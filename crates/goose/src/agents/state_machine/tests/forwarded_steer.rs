//! A steer the provider forwards into the turn it is running, as the ACP
//! provider does for claude-agent-acp, must be recorded where it landed and
//! never queued for a second delivery, in both agent loops.

use std::sync::Arc;

use crate::agents::{Agent, AgentConfig, AgentEvent, GoosePlatform, SessionConfig};
use crate::config::permission::PermissionManager;
use crate::config::GooseMode;
use crate::conversation::message::Message;
use crate::providers::base::{MessageStream, Provider, ProviderDef, ProviderMetadata};
use crate::session::session_manager::SessionType;
use crate::session::SessionManager;
use anyhow::Result;
use async_trait::async_trait;
use futures::StreamExt;
use goose_providers::errors::ProviderError;
use goose_providers::model::ModelConfig;
use rmcp::model::Tool;
use std::path::PathBuf;
use std::time::Duration;
use tokio::sync::mpsc;
use tokio_util::sync::CancellationToken;

/// Stands in for claude-agent-acp holding a turn open for a background
/// subagent: the turn says "before", takes any steer into itself, and
/// never ends on its own.
struct HeldTurnProvider {
    steer_tx: mpsc::UnboundedSender<Message>,
    steer_rx: std::sync::Mutex<Option<mpsc::UnboundedReceiver<Message>>>,
}

impl HeldTurnProvider {
    fn new() -> Self {
        let (steer_tx, steer_rx) = mpsc::unbounded_channel();
        Self {
            steer_tx,
            steer_rx: std::sync::Mutex::new(Some(steer_rx)),
        }
    }
}

impl crate::providers::base::ProviderDescriptor for HeldTurnProvider {
    fn metadata() -> ProviderMetadata {
        ProviderMetadata {
            name: "held-turn-mock".to_string(),
            display_name: "Held Turn Mock".to_string(),
            description: "Mock provider whose turn waits on background work".to_string(),
            default_model: "mock-model".to_string(),
            known_models: vec![],
            model_doc_link: "".to_string(),
            config_keys: vec![],
            setup_steps: vec![],
            setup: None,
            deprecated: None,
        }
    }
}

impl ProviderDef for HeldTurnProvider {
    type Provider = Self;

    fn from_env(
        _extensions: Vec<crate::config::ExtensionConfig>,
        _tls_config: Option<crate::providers::api_client::TlsConfig>,
    ) -> futures::future::BoxFuture<'static, anyhow::Result<Self>> {
        unimplemented!()
    }
}

#[async_trait]
impl Provider for HeldTurnProvider {
    async fn stream(
        &self,
        _model_config: &ModelConfig,
        _system_prompt: &str,
        _messages: &[Message],
        _tools: &[Tool],
    ) -> Result<MessageStream, ProviderError> {
        let steers = self
            .steer_rx
            .lock()
            .unwrap()
            .take()
            .expect("one turn per test");
        let before = Message::assistant().with_text("before");
        let steered = futures::stream::unfold(steers, |mut steers| async move {
            let message = steers.recv().await?;
            Some((Ok((Some(message), None)), steers))
        });
        Ok(Box::pin(
            futures::stream::once(async move { Ok((Some(before), None)) })
                .chain(steered)
                .chain(futures::stream::pending()),
        ))
    }

    async fn steer(&self, _session_id: &str, message: &Message) -> bool {
        self.steer_tx.send(message.clone().with_steer()).is_ok()
    }

    fn get_name(&self) -> &str {
        "held-turn-mock"
    }
}

fn texts(messages: &[Message]) -> Vec<String> {
    messages
        .iter()
        .filter(|m| m.is_user_visible() && !m.is_turn_context())
        .map(|m| m.as_concat_text())
        .collect()
}

async fn persisted(session_manager: &SessionManager, id: &str) -> Result<Vec<Message>> {
    Ok(session_manager
        .get_session(id, true)
        .await?
        .conversation
        .map(|c| c.messages().to_vec())
        .unwrap_or_default())
}

async fn steer_a_held_turn_then_stop(state_machine: Option<&str>) -> Result<()> {
    let _guard = env_lock::lock_env([("GOOSE_STATE_MACHINE", state_machine)]);
    let temp_dir = tempfile::tempdir()?;
    let session_manager = Arc::new(SessionManager::new(temp_dir.path().to_path_buf()));
    let agent = Agent::with_config(AgentConfig::new(
        session_manager.clone(),
        PermissionManager::instance(),
        None,
        GooseMode::Auto,
        true,
        GoosePlatform::GooseCli,
    ));
    let session = session_manager
        .create_session(
            PathBuf::default(),
            "forwarded-steer".to_string(),
            SessionType::Hidden,
            GooseMode::default(),
        )
        .await?;
    agent
        .update_provider(
            Arc::new(HeldTurnProvider::new()),
            ModelConfig::new("mock-model"),
            &session.id,
        )
        .await?;

    let cancel = CancellationToken::new();
    let reply = agent
        .reply(
            Message::user().with_text("start the subagent"),
            SessionConfig {
                id: session.id.clone(),
                schedule_id: None,
                max_turns: Some(5),
                retry_config: None,
            },
            Some(cancel.clone()),
        )
        .await?;
    tokio::pin!(reply);

    let mut next_text = async || -> Result<String> {
        loop {
            let event = tokio::time::timeout(Duration::from_secs(5), reply.next())
                .await?
                .expect("the reply ended early")?;
            if let AgentEvent::Message(message) = event {
                return Ok(message.as_concat_text());
            }
        }
    };
    assert_eq!(next_text().await?, "before");
    agent
        .steer(&session.id, Message::user().with_text("stop merging"))
        .await;
    assert_eq!(next_text().await?, "stop merging");

    if state_machine.is_none() {
        let saved = persisted(&session_manager, &session.id).await?;
        assert_eq!(
            texts(&saved),
            ["start the subagent", "before", "stop merging"],
            "the steer must be saved while the turn is still held open"
        );
        assert!(saved.last().unwrap().metadata.steer);
        let before = saved
            .iter()
            .find(|m| m.as_concat_text() == "before")
            .unwrap();
        assert!(
            before.metadata.inference.is_some(),
            "a reply saved early must still record which model wrote it"
        );
    }

    cancel.cancel();
    while let Some(event) = reply.next().await {
        event?;
    }

    let saved = persisted(&session_manager, &session.id).await?;
    let saved = texts(&saved);
    assert_eq!(
        saved.iter().filter(|text| *text == "stop merging").count(),
        1,
        "the provider took the steer, so goose must not queue it again: {saved:?}"
    );
    let steer = saved
        .iter()
        .position(|text| text == "stop merging")
        .unwrap();
    let before = saved.iter().position(|text| text == "before").unwrap();
    assert!(before < steer, "{saved:?}");
    Ok(())
}

#[tokio::test]
async fn a_forwarded_steer_survives_stopping_the_held_turn() -> Result<()> {
    steer_a_held_turn_then_stop(None).await
}

#[tokio::test]
async fn a_forwarded_steer_survives_stopping_the_held_turn_in_the_state_machine() -> Result<()> {
    steer_a_held_turn_then_stop(Some("1")).await
}
