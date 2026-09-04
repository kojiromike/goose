//! Client-side support for the ACP `providers/*` methods.
//!
//! An ACP agent that advertises the `providers` capability lets its client pick
//! which LLM backend the agent's API traffic reaches. claude-agent-acp maps a
//! `providers/set` onto the Claude Code routing environment, so goose can move a
//! Claude Code ACP session between the first-party Anthropic API and Vertex AI
//! without the user editing `~/.claude/settings.json` and restarting.
//!
//! The typed payloads come from `agent-client-protocol-schema`, but the
//! `agent-client-protocol` crate does not yet forward the schema's
//! `unstable_llm_providers` feature, so the JSON-RPC glue for these three
//! methods lives here. Delete [`SetProvider`], [`DisableProvider`] and
//! [`ListProviders`] once upstream ships it.

use agent_client_protocol::{JsonRpcRequest, JsonRpcResponse};
use agent_client_protocol_schema::v1::{
    DisableProviderRequest, ListProvidersRequest, ListProvidersResponse, LlmProtocol, Meta,
    ProviderId, SetProviderRequest,
};
use anyhow::{bail, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::config::{Config, ConfigError};

pub use goose_providers::llm_backend::{
    LlmBackend, LlmBackendKind, LlmBackendState, VertexRouting,
};

/// The single mutually exclusive backend slot claude-agent-acp exposes.
pub const MAIN_PROVIDER_ID: &str = "main";

/// `config.yaml` key holding one [`LlmBackendSettings`] per ACP provider.
const CONFIG_KEY: &str = "acp_llm_backends";

#[derive(Debug, Clone, Serialize, Deserialize, JsonRpcRequest)]
#[request(method = "providers/set", response = serde_json::Value)]
#[serde(transparent)]
pub struct SetProvider(pub SetProviderRequest);

#[derive(Debug, Clone, Serialize, Deserialize, JsonRpcRequest)]
#[request(method = "providers/disable", response = serde_json::Value)]
#[serde(transparent)]
pub struct DisableProvider(pub DisableProviderRequest);

#[derive(Debug, Clone, Serialize, Deserialize, JsonRpcRequest)]
#[request(method = "providers/list", response = ProvidersListed)]
#[serde(transparent)]
pub struct ListProviders(pub ListProvidersRequest);

#[derive(Debug, Clone, Serialize, Deserialize, JsonRpcResponse)]
#[serde(transparent)]
pub struct ProvidersListed(pub ListProvidersResponse);

pub fn set_provider_request(backend: &LlmBackend) -> SetProvider {
    let request = SetProviderRequest::new(
        ProviderId::new(MAIN_PROVIDER_ID),
        protocol(backend),
        backend.base_url(),
    );
    SetProvider(match backend {
        LlmBackend::AnthropicGateway { .. } => request,
        LlmBackend::Vertex(vertex) => request.meta(vertex_meta(vertex)),
    })
}

pub fn disable_request() -> DisableProvider {
    DisableProvider(DisableProviderRequest::new(ProviderId::new(
        MAIN_PROVIDER_ID,
    )))
}

fn protocol(backend: &LlmBackend) -> LlmProtocol {
    match backend {
        LlmBackend::AnthropicGateway { .. } => LlmProtocol::Anthropic,
        LlmBackend::Vertex(_) => LlmProtocol::Vertex,
    }
}

/// Vertex AI needs a project and region the standard `providers/set` payload
/// cannot carry; claude-agent-acp reads them from `_meta.claudeCode.vertex`.
fn vertex_meta(vertex: &VertexRouting) -> Meta {
    let mut claude_code = serde_json::Map::new();
    claude_code.insert(
        "vertex".to_string(),
        serde_json::json!({
            "projectId": vertex.project_id,
            "region": vertex.region,
        }),
    );
    let mut meta = Meta::new();
    meta.insert(
        "claudeCode".to_string(),
        serde_json::Value::Object(claude_code),
    );
    meta
}

/// Persisted per-provider backend selection. Routing for the backend that is
/// not active is kept so switching back is a single choice rather than a
/// re-entry of the project and region.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct LlmBackendSettings {
    /// `None` leaves the agent on its own routing — the behaviour goose had
    /// before it spoke `providers/*` at all.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub active: Option<LlmBackendKind>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub anthropic_base_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vertex: Option<VertexRouting>,
    /// Model to re-pin after a switch, per backend: a Vertex project enables
    /// models one by one, so carrying one model across a switch can strand the
    /// session on an id the new backend does not have.
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub models: HashMap<String, String>,
}

impl LlmBackendSettings {
    pub fn resolve(&self) -> Result<Option<LlmBackend>> {
        match self.active {
            Some(kind) => self.backend(kind),
            None => Ok(None),
        }
    }

    /// Routing to install for `kind`, or `None` when the answer is to install
    /// none. Selecting Anthropic normally means "use the login the agent
    /// already has", which is the absence of routing: pointing the agent's
    /// anthropic protocol at the first-party API makes it blank its own
    /// credentials and send a placeholder token, which the API rejects with
    /// 401. Only an explicit gateway URL is worth routing to.
    pub fn backend(&self, kind: LlmBackendKind) -> Result<Option<LlmBackend>> {
        match kind {
            LlmBackendKind::Anthropic => Ok(self
                .anthropic_base_url
                .clone()
                .filter(|base_url| !base_url.trim().is_empty())
                .map(|base_url| LlmBackend::AnthropicGateway { base_url })),
            LlmBackendKind::Vertex => match self.vertex.clone() {
                Some(vertex)
                    if !vertex.project_id.trim().is_empty() && !vertex.region.trim().is_empty() =>
                {
                    Ok(Some(LlmBackend::Vertex(vertex)))
                }
                _ => bail!("Vertex AI is selected but its project and region are not configured"),
            },
        }
    }

    /// Whether a model has to be chosen before this backend can be used.
    /// A Vertex project enables models one by one, so a model that works on
    /// the first-party API may simply not exist there — carrying the current
    /// one over fails the next turn with `model_not_found`.
    ///
    /// The `[1m]` context spellings do work on Vertex and should be kept.
    pub fn requires_model(&self, kind: LlmBackendKind) -> bool {
        matches!(kind, LlmBackendKind::Vertex) && self.model_for(kind).is_none()
    }

    pub fn model_for(&self, kind: LlmBackendKind) -> Option<&str> {
        self.models.get(model_key(kind)).map(String::as_str)
    }

    pub fn remember_model(&mut self, kind: LlmBackendKind, model: impl Into<String>) {
        self.models
            .insert(model_key(kind).to_string(), model.into());
    }
}

fn model_key(kind: LlmBackendKind) -> &'static str {
    match kind {
        LlmBackendKind::Anthropic => "anthropic",
        LlmBackendKind::Vertex => "vertex",
    }
}

type SettingsByProvider = HashMap<String, LlmBackendSettings>;

pub fn load_settings(config: &Config, provider_name: &str) -> LlmBackendSettings {
    config
        .get_param::<SettingsByProvider>(CONFIG_KEY)
        .unwrap_or_default()
        .remove(provider_name)
        .unwrap_or_default()
}

pub fn save_settings(
    config: &Config,
    provider_name: &str,
    settings: &LlmBackendSettings,
) -> Result<(), ConfigError> {
    let provider_name = provider_name.to_string();
    let settings = settings.clone();
    config.update_param::<SettingsByProvider, _, _>(CONFIG_KEY, |mut all| {
        all.insert(provider_name, settings);
        all
    })
}

/// The backend an ACP provider should start on, or `None` for the agent's own
/// routing. A selection that is present but unusable is an error rather than a
/// silent fall back to the wrong account.
pub fn configured_backend(config: &Config, provider_name: &str) -> Result<Option<LlmBackend>> {
    load_settings(config, provider_name).resolve()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_config() -> (tempfile::TempDir, Config) {
        let directory = tempfile::tempdir().unwrap();
        let config = Config::new(directory.path().join("config.yaml"), "test").unwrap();
        (directory, config)
    }

    fn vertex_settings() -> LlmBackendSettings {
        LlmBackendSettings {
            active: Some(LlmBackendKind::Vertex),
            anthropic_base_url: None,
            vertex: Some(VertexRouting {
                project_id: "my-project".to_string(),
                region: "us-east5".to_string(),
                base_url: None,
            }),
            models: HashMap::new(),
        }
    }

    #[test]
    fn vertex_request_carries_project_and_region_in_meta() {
        let SetProvider(request) =
            set_provider_request(&vertex_settings().resolve().unwrap().unwrap());

        assert_eq!(request.provider_id.0.as_ref(), MAIN_PROVIDER_ID);
        assert_eq!(request.api_type, LlmProtocol::Vertex);
        assert_eq!(
            request.base_url,
            "https://us-east5-aiplatform.googleapis.com"
        );
        assert_eq!(
            request.meta.expect("vertex meta")["claudeCode"]["vertex"],
            serde_json::json!({"projectId": "my-project", "region": "us-east5"})
        );
    }

    /// Routing the agent's anthropic protocol at the first-party API makes it
    /// blank its own credentials and send a placeholder token, so selecting
    /// Anthropic must install no routing at all.
    #[test]
    fn anthropic_leaves_the_agent_on_its_own_login() {
        let settings = LlmBackendSettings {
            active: Some(LlmBackendKind::Anthropic),
            ..vertex_settings()
        };

        assert_eq!(settings.resolve().unwrap(), None);
    }

    #[test]
    fn an_explicit_gateway_url_is_the_only_anthropic_routing() {
        let settings = LlmBackendSettings {
            active: Some(LlmBackendKind::Anthropic),
            anthropic_base_url: Some("https://gateway.internal".to_string()),
            ..Default::default()
        };

        let backend = settings.resolve().unwrap().expect("gateway routing");
        assert_eq!(
            backend,
            LlmBackend::AnthropicGateway {
                base_url: "https://gateway.internal".to_string()
            }
        );

        let SetProvider(request) = set_provider_request(&backend);
        assert_eq!(request.api_type, LlmProtocol::Anthropic);
        assert_eq!(request.base_url, "https://gateway.internal");
        assert!(request.meta.is_none());
    }

    #[test]
    fn vertex_cannot_be_selected_until_a_model_is_chosen() {
        let mut settings = vertex_settings();
        assert!(settings.requires_model(LlmBackendKind::Vertex));

        settings.remember_model(LlmBackendKind::Vertex, "claude-opus-5@20260514");

        assert!(!settings.requires_model(LlmBackendKind::Vertex));
    }

    #[test]
    fn no_active_backend_leaves_the_agent_on_its_own_routing() {
        assert_eq!(LlmBackendSettings::default().resolve().unwrap(), None);
    }

    #[test]
    fn selecting_vertex_without_a_project_is_an_error() {
        let settings = LlmBackendSettings {
            active: Some(LlmBackendKind::Vertex),
            ..Default::default()
        };

        assert!(settings.resolve().is_err());
    }

    #[test]
    fn switching_back_to_anthropic_keeps_the_vertex_routing() {
        let settings = LlmBackendSettings {
            active: Some(LlmBackendKind::Anthropic),
            ..vertex_settings()
        };

        assert_eq!(settings.resolve().unwrap(), None);
        assert!(settings.vertex.is_some());
    }

    #[test]
    fn each_backend_remembers_its_own_model() {
        let mut settings = vertex_settings();
        settings.remember_model(LlmBackendKind::Anthropic, "claude-opus-5[1m]");
        settings.remember_model(LlmBackendKind::Vertex, "claude-opus-5@20260514");

        assert_eq!(
            settings.model_for(LlmBackendKind::Anthropic),
            Some("claude-opus-5[1m]")
        );
        assert_eq!(
            settings.model_for(LlmBackendKind::Vertex),
            Some("claude-opus-5@20260514")
        );
    }

    #[test]
    fn settings_round_trip_per_provider() {
        let (_directory, config) = test_config();
        let settings = vertex_settings();

        save_settings(&config, "claude-acp", &settings).unwrap();

        assert_eq!(load_settings(&config, "claude-acp"), settings);
        assert_eq!(
            load_settings(&config, "codex-acp"),
            LlmBackendSettings::default()
        );
        assert!(matches!(
            configured_backend(&config, "claude-acp").unwrap(),
            Some(LlmBackend::Vertex(_))
        ));
    }

    #[test]
    fn an_unconfigured_provider_stays_on_agent_routing() {
        let (_directory, config) = test_config();

        assert_eq!(configured_backend(&config, "claude-acp").unwrap(), None);
    }
}
