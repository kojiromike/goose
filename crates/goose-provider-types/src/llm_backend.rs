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
}

impl LlmBackend {
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
