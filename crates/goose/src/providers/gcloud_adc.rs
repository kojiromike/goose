//! Application Default Credentials status, and the interactive gcloud login
//! that fixes it.
//!
//! Backends that authenticate to Google Cloud (Vertex AI) read ADC rather than
//! an API key, so "not signed in" is a recoverable state, not a configuration
//! error: `gcloud auth application-default login` opens a browser and writes
//! the credentials itself, the same flow the user would run by hand.

use anyhow::{bail, Context, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync::mpsc;

use super::gcpauth::GcpAuth;
use crate::config::search_path::SearchPaths;
use crate::subprocess::configure_subprocess;

const GCLOUD_BINARY: &str = "gcloud";

/// How long to wait for the user to finish the browser flow.
const LOGIN_TIMEOUT: std::time::Duration = std::time::Duration::from_secs(300);

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "state", rename_all = "snake_case")]
pub enum AdcStatus {
    Ready {
        #[serde(skip_serializing_if = "Option::is_none")]
        account: Option<String>,
    },
    /// No credentials have been written yet.
    NotConfigured,
    /// Credentials exist but no longer mint a token — typically a revoked or
    /// expired refresh token.
    Invalid { detail: String },
}

impl AdcStatus {
    pub fn is_ready(&self) -> bool {
        matches!(self, Self::Ready { .. })
    }
}

/// Checks that ADC can actually mint a token, not just that a file exists: an
/// expired refresh token fails at the first prompt otherwise, mid-turn.
pub async fn status() -> AdcStatus {
    if credentials_path().is_none() {
        return AdcStatus::NotConfigured;
    }

    match GcpAuth::new().await {
        Ok(auth) => match auth.get_token().await {
            Ok(_) => AdcStatus::Ready {
                account: adc_account(),
            },
            Err(error) => AdcStatus::Invalid {
                detail: error.to_string(),
            },
        },
        Err(error) => AdcStatus::Invalid {
            detail: error.to_string(),
        },
    }
}

/// Signs in if ADC is missing or stale, then confirms it works. Callers should
/// only reach this from an explicit user action — it opens a browser.
pub async fn ensure_ready(on_output: impl FnMut(String) + Send) -> Result<AdcStatus> {
    let before = status().await;
    if before.is_ready() {
        return Ok(before);
    }

    login(on_output).await?;

    let after = status().await;
    match &after {
        AdcStatus::Ready { .. } => Ok(after),
        AdcStatus::NotConfigured => {
            bail!("Google Cloud sign-in finished but no credentials were written")
        }
        AdcStatus::Invalid { detail } => {
            bail!("Google Cloud credentials are still unusable: {detail}")
        }
    }
}

/// The ADC file in effect, if there is one.
fn credentials_path() -> Option<PathBuf> {
    if let Some(path) = std::env::var_os("GOOGLE_APPLICATION_CREDENTIALS") {
        let path = PathBuf::from(path);
        return path.is_file().then_some(path);
    }

    let path = default_credentials_path()?;
    path.is_file().then_some(path)
}

fn default_credentials_path() -> Option<PathBuf> {
    let (dir, subpath) = if cfg!(windows) {
        (
            std::env::var_os("APPDATA")?,
            "gcloud/application_default_credentials.json",
        )
    } else {
        (
            std::env::var_os("HOME")?,
            ".config/gcloud/application_default_credentials.json",
        )
    };
    Some(PathBuf::from(dir).join(subpath))
}

/// Best-effort: the signed-in account, for display only.
fn adc_account() -> Option<String> {
    let contents = std::fs::read_to_string(credentials_path()?).ok()?;
    let credentials: serde_json::Value = serde_json::from_str(&contents).ok()?;
    credentials
        .get("account")?
        .as_str()
        .map(str::to_string)
        .filter(|account| !account.is_empty())
}

/// Runs `gcloud auth application-default login`, which opens a browser and
/// writes the credentials on success. Each line gcloud prints is handed to
/// `on_output` so a caller can surface the verification URL when the browser
/// does not open on its own.
pub async fn login(mut on_output: impl FnMut(String) + Send) -> Result<()> {
    let gcloud = SearchPaths::builder().resolve(GCLOUD_BINARY).context(
        "gcloud is required to sign in to Google Cloud. Install the Google Cloud CLI and try again",
    )?;

    let mut command = Command::new(gcloud);
    command
        .args(["auth", "application-default", "login"])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    configure_subprocess(&mut command);

    let mut child = command.spawn().context("failed to run gcloud")?;
    let stdout = child.stdout.take().context("no stdout")?;
    let stderr = child.stderr.take().context("no stderr")?;

    let (tx, mut rx) = mpsc::channel::<String>(32);
    forward_lines(stdout, tx.clone());
    forward_lines(stderr, tx);

    let status = tokio::time::timeout(LOGIN_TIMEOUT, async {
        while let Some(line) = rx.recv().await {
            on_output(line);
        }
        child.wait().await
    })
    .await;

    match status {
        Ok(status) => {
            let status = status.context("gcloud did not exit cleanly")?;
            if !status.success() {
                bail!("gcloud auth application-default login failed ({status})");
            }
            Ok(())
        }
        Err(_) => {
            let _ = child.start_kill();
            bail!("timed out waiting for the Google Cloud sign-in to finish")
        }
    }
}

fn forward_lines(
    stream: impl tokio::io::AsyncRead + Unpin + Send + 'static,
    tx: mpsc::Sender<String>,
) {
    tokio::spawn(async move {
        let mut lines = BufReader::new(stream).lines();
        while let Ok(Some(line)) = lines.next_line().await {
            if tx.send(line).await.is_err() {
                break;
            }
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn status_serializes_for_the_wire() {
        assert_eq!(
            serde_json::to_value(AdcStatus::NotConfigured).unwrap(),
            serde_json::json!({"state": "not_configured"})
        );
        assert_eq!(
            serde_json::to_value(AdcStatus::Ready {
                account: Some("dev@example.com".to_string())
            })
            .unwrap(),
            serde_json::json!({"state": "ready", "account": "dev@example.com"})
        );
    }

    #[tokio::test]
    async fn missing_credentials_are_reported_as_not_configured() {
        let directory = tempfile::tempdir().unwrap();
        let _guard = env_lock::lock_env([
            (
                "GOOGLE_APPLICATION_CREDENTIALS",
                Some(directory.path().join("absent.json").to_str().unwrap()),
            ),
            ("HOME", Some(directory.path().to_str().unwrap())),
        ]);

        assert_eq!(status().await, AdcStatus::NotConfigured);
    }
}
