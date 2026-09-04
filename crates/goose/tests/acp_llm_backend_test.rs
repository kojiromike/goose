use agent_client_protocol::schema::v1::{
    AgentCapabilities, InitializeRequest, InitializeResponse, LlmProtocol, NewSessionRequest,
    NewSessionResponse, ProvidersCapabilities, SessionId,
};
use agent_client_protocol::schema::ProtocolVersion;
use agent_client_protocol::{on_receive_request, Agent as SacpAgent, ByteStreams};
use goose::acp::llm_backend::{set_provider_request, LlmBackend, SetProvider, VertexRouting};
use goose::acp::{AcpProvider, AcpProviderConfig};
use goose::config::GooseMode;
use goose::providers::base::Provider;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio_util::compat::{TokioAsyncReadCompatExt, TokioAsyncWriteCompatExt};

type Recorder = Arc<Mutex<Vec<String>>>;

fn vertex_backend() -> LlmBackend {
    LlmBackend::Vertex(VertexRouting {
        project_id: "my-project".to_string(),
        region: "us-east5".to_string(),
        base_url: None,
    })
}

fn provider_config(llm_backend: Option<LlmBackend>) -> AcpProviderConfig {
    AcpProviderConfig {
        command: "unused".into(),
        args: vec![],
        env: vec![],
        env_remove: vec![],
        work_dir: std::env::temp_dir(),
        mcp_servers: vec![],
        session_mode_id: None,
        session_config_options: vec![],
        model_config_option_id: None,
        mode_mapping: HashMap::new(),
        llm_backend,
        notification_callback: None,
    }
}

/// A scripted agent that records the requests it receives, in order.
async fn connect_to_scripted_agent(
    advertises_providers: bool,
    config: AcpProviderConfig,
) -> (anyhow::Result<AcpProvider>, Recorder, Recorder) {
    let (client_read, agent_write) = tokio::io::duplex(64 * 1024);
    let (agent_read, client_write) = tokio::io::duplex(64 * 1024);

    let calls: Recorder = Arc::new(Mutex::new(Vec::new()));
    let payloads: Recorder = Arc::new(Mutex::new(Vec::new()));
    let recorded_calls = calls.clone();
    let recorded_payloads = payloads.clone();

    tokio::spawn(async move {
        let set_provider_calls = recorded_calls.clone();
        let new_session_calls = recorded_calls.clone();
        SacpAgent
            .builder()
            .name("scripted-agent")
            .on_receive_request(
                async move |_req: InitializeRequest, responder, _cx| {
                    let capabilities = AgentCapabilities::new();
                    let capabilities = if advertises_providers {
                        capabilities.providers(ProvidersCapabilities::new())
                    } else {
                        capabilities
                    };
                    responder.respond(
                        InitializeResponse::new(ProtocolVersion::LATEST)
                            .agent_capabilities(capabilities),
                    )
                },
                on_receive_request!(),
            )
            .on_receive_request(
                async move |req: SetProvider, responder, _cx| {
                    set_provider_calls
                        .lock()
                        .unwrap()
                        .push("providers/set".to_string());
                    recorded_payloads
                        .lock()
                        .unwrap()
                        .push(serde_json::to_string(&req).unwrap());
                    responder.respond(serde_json::json!({}))
                },
                on_receive_request!(),
            )
            .on_receive_request(
                async move |_req: NewSessionRequest, responder, _cx| {
                    new_session_calls
                        .lock()
                        .unwrap()
                        .push("session/new".to_string());
                    responder.respond(NewSessionResponse::new(SessionId::new("scripted-session")))
                },
                on_receive_request!(),
            )
            .connect_to(ByteStreams::new(
                agent_write.compat_write(),
                agent_read.compat(),
            ))
            .await
    });

    let provider = AcpProvider::connect_with_transport(
        "scripted-acp".to_string(),
        GooseMode::default(),
        config,
        ByteStreams::new(client_write.compat_write(), client_read.compat()),
        None,
    )
    .await;

    (provider, calls, payloads)
}

/// Routing must be in place before the first session exists: the agent bakes it
/// into each session's query.
#[tokio::test]
async fn a_configured_backend_is_applied_before_the_first_session() {
    let (provider, calls, payloads) =
        connect_to_scripted_agent(true, provider_config(Some(vertex_backend()))).await;

    provider.expect("provider should connect to the scripted agent");

    assert_eq!(
        *calls.lock().unwrap(),
        vec!["providers/set".to_string(), "session/new".to_string()]
    );

    let payload: serde_json::Value =
        serde_json::from_str(&payloads.lock().unwrap()[0]).expect("recorded providers/set");
    assert_eq!(payload["providerId"], "main");
    assert_eq!(payload["apiType"], "vertex");
    assert_eq!(
        payload["baseUrl"],
        "https://us-east5-aiplatform.googleapis.com"
    );
    assert_eq!(
        payload["_meta"]["claudeCode"]["vertex"],
        serde_json::json!({"projectId": "my-project", "region": "us-east5"})
    );
}

#[tokio::test]
async fn no_configured_backend_leaves_the_agent_on_its_own_routing() {
    let (provider, calls, _payloads) = connect_to_scripted_agent(true, provider_config(None)).await;

    let provider = provider.expect("provider should connect to the scripted agent");

    assert_eq!(*calls.lock().unwrap(), vec!["session/new".to_string()]);
    assert_eq!(provider.llm_backend(), None);
    assert!(provider.supports_llm_backends());
}

/// Falling back to the agent's own routing would silently bill the wrong
/// account, so a backend that cannot be applied fails the connection instead.
#[tokio::test]
async fn a_backend_is_not_silently_dropped_when_the_agent_cannot_route() {
    let (provider, calls, _payloads) =
        connect_to_scripted_agent(false, provider_config(Some(vertex_backend()))).await;

    let error = provider.expect_err("connect should fail");

    assert!(
        error.to_string().contains("providers capability"),
        "unexpected error: {error}"
    );
    assert!(calls.lock().unwrap().is_empty());
}

#[tokio::test]
async fn the_backend_can_be_switched_on_a_live_connection() {
    let (provider, calls, payloads) = connect_to_scripted_agent(true, provider_config(None)).await;

    let provider = provider.expect("provider should connect to the scripted agent");
    provider
        .set_llm_backend(Some(vertex_backend()))
        .await
        .expect("switch to vertex");

    assert_eq!(
        *calls.lock().unwrap(),
        vec!["session/new".to_string(), "providers/set".to_string()]
    );
    assert_eq!(
        provider.llm_backend(),
        Some(LlmBackend::Vertex(VertexRouting {
            project_id: "my-project".to_string(),
            region: "us-east5".to_string(),
            base_url: None,
        }))
    );

    let payload: serde_json::Value =
        serde_json::from_str(&payloads.lock().unwrap()[0]).expect("recorded providers/set");
    assert_eq!(payload["apiType"], "vertex");
}

#[tokio::test]
async fn switching_is_refused_when_the_agent_cannot_route() {
    let (provider, _calls, _payloads) =
        connect_to_scripted_agent(false, provider_config(None)).await;

    let provider = provider.expect("provider should connect to the scripted agent");

    assert!(!provider.supports_llm_backends());
    assert!(provider
        .set_llm_backend(Some(vertex_backend()))
        .await
        .is_err());
}

#[test]
fn a_gateway_is_the_only_anthropic_routing() {
    let SetProvider(request) = set_provider_request(&LlmBackend::AnthropicGateway {
        base_url: "https://gateway.internal".to_string(),
    });

    assert_eq!(request.api_type, LlmProtocol::Anthropic);
    assert_eq!(request.base_url, "https://gateway.internal");
}
