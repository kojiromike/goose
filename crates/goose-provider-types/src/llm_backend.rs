//! Which LLM backend a provider's traffic reaches.
//!
//! Providers that front an external harness (an ACP agent, a CLI) may let the
//! client choose the backend the harness talks to, without reconfiguring and
//! restarting that harness.
//!
//! Note what is *not* here: the harness's own credentials. Handing routing back
//! to the agent is the absence of a backend, not a variant — see
//! `providers/disable` in the ACP client. A harness told to route "to Anthropic"
//! is being told to use a gateway, and blanks its local credentials to do it.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "api_type", rename_all = "snake_case")]
pub enum LlmBackend {
    /// A gateway or proxy that supplies its own credentials. The agent blanks
    /// the local ones and sends a placeholder token, so this must never point
    /// at the first-party API — that returns 401.
    AnthropicGateway {
        base_url: String,
    },
    Vertex(VertexRouting),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VertexRouting {
    pub project_id: String,
    pub region: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub base_url: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LlmBackendKind {
    /// The agent's own login. Selecting it removes goose's routing rather than
    /// installing routing of its own.
    Anthropic,
    Vertex,
}

/// A provider's current backend routing. `active: None` means the harness is
/// using the credentials it was started with.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LlmBackendState {
    pub active: Option<LlmBackend>,
    /// The backend this harness's traffic actually reaches, which for a
    /// backend carried by the spawn environment is decided once and cannot be
    /// changed while the harness runs. `active` only covers routing installed
    /// over the wire, so it is silent about exactly the case that bills the
    /// wrong account.
    pub in_use: Option<LlmBackendKind>,
}

impl LlmBackend {
    /// Environment the harness must be started with, for backends that cannot
    /// be installed over the wire.
    ///
    /// Claude Code treats a Vertex deployment as *custom* the moment
    /// `ANTHROPIC_VERTEX_BASE_URL` is set, and then resolves models against a
    /// conservative catalogue that rejects current ids. The protocol's
    /// `providers/set` always sets that variable, so a plain Vertex account is
    /// only reachable by starting the agent with the same environment a user
    /// would put in settings.json — and no base URL at all.
    pub fn spawn_env(&self) -> Vec<(String, String)> {
        match self {
            Self::AnthropicGateway { .. } => vec![],
            Self::Vertex(vertex) if vertex.base_url.is_some() => vec![],
            Self::Vertex(vertex) => vec![
                ("CLAUDE_CODE_USE_VERTEX".to_string(), "1".to_string()),
                (
                    "ANTHROPIC_VERTEX_PROJECT_ID".to_string(),
                    vertex.project_id.clone(),
                ),
                ("CLOUD_ML_REGION".to_string(), vertex.region.clone()),
            ],
        }
    }

    /// Whether this backend is installed with `providers/set` rather than with
    /// the environment the agent starts in.
    pub fn is_routable(&self) -> bool {
        self.spawn_env().is_empty()
    }

    pub fn kind(&self) -> LlmBackendKind {
        match self {
            Self::AnthropicGateway { .. } => LlmBackendKind::Anthropic,
            Self::Vertex(_) => LlmBackendKind::Vertex,
        }
    }

    pub fn base_url(&self) -> String {
        match self {
            Self::AnthropicGateway { base_url } => base_url.clone(),
            Self::Vertex(vertex) => vertex
                .base_url
                .clone()
                .unwrap_or_else(|| vertex_base_url(&vertex.region)),
        }
    }

    /// Short label for logs and error messages.
    pub fn label(&self) -> &'static str {
        match self {
            Self::AnthropicGateway { .. } => "anthropic gateway",
            Self::Vertex(_) => "vertex",
        }
    }
}

/// The endpoint Claude Code derives for a Vertex region when
/// `ANTHROPIC_VERTEX_BASE_URL` is unset. Reproduced here because the wire
/// protocol requires an explicit base URL, and a guessed one would silently
/// route somewhere else.
pub fn vertex_base_url(region: &str) -> String {
    match region {
        "global" => "https://aiplatform.googleapis.com".to_string(),
        "us" | "eu" => format!("https://aiplatform.{region}.rep.googleapis.com"),
        _ => format!("https://{region}-aiplatform.googleapis.com"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn vertex_endpoints_follow_the_cli_region_rule() {
        assert_eq!(
            vertex_base_url("global"),
            "https://aiplatform.googleapis.com"
        );
        assert_eq!(
            vertex_base_url("us"),
            "https://aiplatform.us.rep.googleapis.com"
        );
        assert_eq!(
            vertex_base_url("eu"),
            "https://aiplatform.eu.rep.googleapis.com"
        );
        assert_eq!(
            vertex_base_url("us-east5"),
            "https://us-east5-aiplatform.googleapis.com"
        );
    }

    #[test]
    fn a_vertex_backend_can_override_the_derived_endpoint() {
        let backend = LlmBackend::Vertex(VertexRouting {
            project_id: "my-project".to_string(),
            region: "us-east5".to_string(),
            base_url: Some("https://proxy.internal".to_string()),
        });

        assert_eq!(backend.base_url(), "https://proxy.internal");
        assert_eq!(backend.kind(), LlmBackendKind::Vertex);
    }
}
