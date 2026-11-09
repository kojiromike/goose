//! Client side of the ACP steering extension.
//!
//! An agent that advertises `_meta.steering.supported` in its initialize
//! response accepts `_session/steering`, which injects a user message into the
//! turn it is running instead of queuing it behind that turn the way a second
//! `session/prompt` would. claude-agent-acp holds a turn open while background
//! subagents it spawned are still live, so a steer goose keeps to itself waits
//! for them and dies with the turn if it is cancelled first.

use agent_client_protocol::schema::v1::{ContentBlock, InitializeResponse, SessionId};
use agent_client_protocol::{JsonRpcRequest, JsonRpcResponse};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, JsonRpcRequest)]
#[request(method = "_session/steering", response = SteeringResponse)]
#[serde(rename_all = "camelCase")]
pub struct SteeringRequest {
    session_id: SessionId,
    pub(crate) prompt: Vec<ContentBlock>,
    #[serde(rename = "_meta")]
    meta: serde_json::Value,
}

impl SteeringRequest {
    /// Steer `session_id`'s running turn, refusing rather than starting a new
    /// turn when none is running: goose already owns the prompt lifecycle, so
    /// an idle agent must leave the message for goose to send as a prompt.
    pub fn new(session_id: SessionId, prompt: Vec<ContentBlock>) -> Self {
        Self {
            session_id,
            prompt,
            meta: serde_json::json!({ "steering": { "idleBehavior": "promptRequired" } }),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, JsonRpcResponse)]
pub struct SteeringResponse {
    pub(crate) outcome: String,
}

impl SteeringResponse {
    pub fn injected(&self) -> bool {
        self.outcome == "injected"
    }
}

pub fn supports_steering(init_response: &InitializeResponse) -> bool {
    init_response
        .meta
        .as_ref()
        .and_then(|meta| meta.get("steering"))
        .and_then(|steering| steering.get("supported"))
        .and_then(serde_json::Value::as_bool)
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;
    use agent_client_protocol::schema::v1::TextContent;
    use agent_client_protocol::schema::ProtocolVersion;

    #[test]
    fn the_request_opts_out_of_starting_a_turn() {
        let request = SteeringRequest::new(
            SessionId::new("s1"),
            vec![ContentBlock::Text(TextContent::new("stop"))],
        );
        assert_eq!(
            serde_json::to_value(&request).unwrap(),
            serde_json::json!({
                "sessionId": "s1",
                "prompt": [{ "type": "text", "text": "stop" }],
                "_meta": { "steering": { "idleBehavior": "promptRequired" } },
            })
        );
    }

    #[test]
    fn only_an_injected_outcome_counts_as_delivered() {
        let outcome = |outcome: &str| -> SteeringResponse {
            serde_json::from_value(serde_json::json!({ "outcome": outcome })).unwrap()
        };
        assert!(outcome("injected").injected());
        assert!(!outcome("promptRequired").injected());
        assert!(!outcome("startedNewTurn").injected());
    }

    #[test]
    fn steering_support_is_read_from_initialize_meta() {
        let advertised: InitializeResponse = serde_json::from_value(serde_json::json!({
            "protocolVersion": ProtocolVersion::V1,
            "_meta": { "steering": { "supported": true } },
        }))
        .unwrap();
        assert!(supports_steering(&advertised));
        assert!(!supports_steering(&InitializeResponse::new(
            ProtocolVersion::V1
        )));
    }
}
