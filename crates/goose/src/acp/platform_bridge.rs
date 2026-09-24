//! Serves goose's platform extensions to ACP agents over MCP.
//!
//! An ACP agent runs its own tool loop and sees only the MCP servers named in
//! `session/new`. Platform extensions live inside the goose process, so without
//! this bridge the agent never sees them. Each bridged (session, extension) pair
//! gets a loopback Streamable HTTP endpoint that forwards to that session's own
//! `ExtensionManager`, so a bridged call is authorized and dispatched exactly like
//! one from goose's own agent loop.

use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex, Weak};
use std::time::Duration;

use anyhow::Result;
use axum::extract::{Path, Request, State};
use axum::http::request::Parts;
use axum::http::StatusCode;
use axum::middleware::{self, Next};
use axum::response::Response;
use axum::Router;
use rand::{distr::Alphanumeric, RngExt};
use rmcp::model::{
    CacheScope, CallToolRequestParams, CallToolResponse, DiscoverResult, Implementation,
    InitializeRequestParams, InitializeResult, ListToolsResult, PaginatedRequestParams,
    ServerCapabilities, ServerInfo, Tool,
};
use rmcp::service::RequestContext;
use rmcp::transport::streamable_http_server::{
    session::local::LocalSessionManager, StreamableHttpServerConfig, StreamableHttpService,
};
use rmcp::{ErrorData as McpError, RoleServer, ServerHandler};
use subtle::ConstantTimeEq;
use tokio::task::JoinHandle;

use crate::agents::extension::ExtensionConfig;
use crate::agents::extension_manager::ExtensionManager;
use crate::agents::platform_extensions::PLATFORM_EXTENSIONS;
use crate::agents::tool_execution::ToolCallContext;

const SECRET_HEADER: &str = "X-Secret-Key";
const TOKEN_LENGTH: usize = 48;
const TOOL_TIMEOUT_SECS: u64 = 3600;
// The ACP child connects to its MCP servers as soon as `session/new` lands, which is
// before goose finishes loading the session's extensions.
const EXTENSION_LOAD_TIMEOUT: Duration = Duration::from_secs(30);
const EXTENSION_LOAD_POLL: Duration = Duration::from_millis(50);

static BRIDGE: tokio::sync::Mutex<Option<Arc<PlatformBridge>>> =
    tokio::sync::Mutex::const_new(None);

struct BridgedSession {
    token: String,
    extension_manager: Weak<ExtensionManager>,
}

struct PlatformBridge {
    addr: SocketAddr,
    sessions: Mutex<HashMap<String, BridgedSession>>,
    server: Mutex<Option<JoinHandle<()>>>,
}

#[derive(Clone)]
struct BridgeTarget {
    session_id: String,
    extension: String,
    extension_manager: Arc<ExtensionManager>,
}

/// Replace each bridged platform extension with a Streamable HTTP extension that
/// points at this session's bridge endpoint. Providers that are not ACP agents run
/// goose's own tool loop, so their extension list is returned unchanged.
pub async fn bridge_platform_extensions(
    provider_name: &str,
    session_id: &str,
    extensions: Vec<ExtensionConfig>,
    extension_manager: &Arc<ExtensionManager>,
) -> Vec<ExtensionConfig> {
    if !extensions.iter().any(is_bridged) || !is_acp_provider(provider_name).await {
        return extensions;
    }

    let bridge = match PlatformBridge::running().await {
        Ok(bridge) => bridge,
        Err(error) => {
            tracing::error!(%error, "failed to start the ACP platform extension bridge");
            return extensions;
        }
    };
    let token = bridge.register(session_id, extension_manager);

    extensions
        .into_iter()
        .map(|config| match &config {
            ExtensionConfig::Platform {
                name, description, ..
            } if is_bridged(&config) => {
                let mut bridged = ExtensionConfig::streamable_http(
                    name.clone(),
                    bridge.url(session_id, name),
                    description.clone(),
                    TOOL_TIMEOUT_SECS,
                );
                if let ExtensionConfig::StreamableHttp { headers, .. } = &mut bridged {
                    headers.insert(SECRET_HEADER.to_string(), token.clone());
                }
                bridged
            }
            _ => config,
        })
        .collect()
}

fn is_bridged(config: &ExtensionConfig) -> bool {
    matches!(config, ExtensionConfig::Platform { name, .. }
        if PLATFORM_EXTENSIONS.get(name.as_str()).is_some_and(|def| def.acp_bridged))
}

async fn is_acp_provider(provider_name: &str) -> bool {
    crate::providers::get_from_registry(provider_name)
        .await
        .is_ok_and(|entry| entry.metadata().default_model == super::ACP_CURRENT_MODEL)
}

impl PlatformBridge {
    /// The listener runs on whichever runtime first needed it; start a new one if that
    /// runtime has since shut down.
    async fn running() -> Result<Arc<Self>> {
        let mut slot = BRIDGE.lock().await;
        if let Some(bridge) = slot.as_ref().filter(|bridge| bridge.is_serving()) {
            return Ok(bridge.clone());
        }
        let bridge = Self::start().await?;
        *slot = Some(bridge.clone());
        Ok(bridge)
    }

    fn is_serving(&self) -> bool {
        self.server
            .lock()
            .expect("bridge server lock poisoned")
            .as_ref()
            .is_some_and(|server| !server.is_finished())
    }

    async fn start() -> Result<Arc<Self>> {
        let listener = tokio::net::TcpListener::bind(("127.0.0.1", 0)).await?;
        let bridge = Arc::new(Self {
            addr: listener.local_addr()?,
            sessions: Mutex::new(HashMap::new()),
            server: Mutex::new(None),
        });

        let service = StreamableHttpService::new(
            || Ok(BridgeHandler),
            LocalSessionManager::default().into(),
            StreamableHttpServerConfig::default(),
        );
        let app = Router::new()
            .route_service("/{session_id}/{extension}", service)
            .route_layer(middleware::from_fn_with_state(
                bridge.clone(),
                authorize_target,
            ));

        let server = tokio::spawn(async move {
            if let Err(error) = axum::serve(listener, app).await {
                tracing::error!(%error, "ACP platform extension bridge stopped");
            }
        });
        *bridge.server.lock().expect("bridge server lock poisoned") = Some(server);

        Ok(bridge)
    }

    /// Point `session_id` at `extension_manager`, keeping its token stable so an ACP
    /// child that already holds it keeps working when the session's agent is rebuilt.
    fn register(&self, session_id: &str, extension_manager: &Arc<ExtensionManager>) -> String {
        let mut sessions = self.sessions.lock().expect("bridge session lock poisoned");
        sessions
            .retain(|id, session| id == session_id || session.extension_manager.strong_count() > 0);
        let session = sessions
            .entry(session_id.to_string())
            .or_insert_with(|| BridgedSession {
                token: rand::rng()
                    .sample_iter(&Alphanumeric)
                    .take(TOKEN_LENGTH)
                    .map(char::from)
                    .collect(),
                extension_manager: Weak::new(),
            });
        session.extension_manager = Arc::downgrade(extension_manager);
        session.token.clone()
    }

    fn url(&self, session_id: &str, extension: &str) -> String {
        format!(
            "http://{}/{}/{}",
            self.addr,
            urlencoding::encode(session_id),
            urlencoding::encode(extension)
        )
    }

    fn target(
        &self,
        session_id: String,
        extension: String,
        token: Option<&str>,
    ) -> Result<BridgeTarget, StatusCode> {
        if !PLATFORM_EXTENSIONS
            .get(extension.as_str())
            .is_some_and(|def| def.acp_bridged)
        {
            return Err(StatusCode::NOT_FOUND);
        }
        let sessions = self.sessions.lock().expect("bridge session lock poisoned");
        let session = sessions
            .get(&session_id)
            .filter(|session| {
                token.is_some_and(|token| {
                    bool::from(token.as_bytes().ct_eq(session.token.as_bytes()))
                })
            })
            .ok_or(StatusCode::UNAUTHORIZED)?;
        let extension_manager = session
            .extension_manager
            .upgrade()
            .ok_or(StatusCode::NOT_FOUND)?;
        Ok(BridgeTarget {
            session_id,
            extension,
            extension_manager,
        })
    }
}

async fn authorize_target(
    State(bridge): State<Arc<PlatformBridge>>,
    Path((session_id, extension)): Path<(String, String)>,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let token = request
        .headers()
        .get(SECRET_HEADER)
        .and_then(|value| value.to_str().ok());
    let target = bridge.target(session_id, extension, token)?;
    request.extensions_mut().insert(target);
    Ok(next.run(request).await)
}

impl BridgeTarget {
    fn from_context(context: &RequestContext<RoleServer>) -> Result<Self, McpError> {
        context
            .extensions
            .get::<Parts>()
            .and_then(|parts| parts.extensions.get::<Self>())
            .cloned()
            .ok_or_else(|| McpError::internal_error("request has no bridge target", None))
    }

    async fn wait_until_loaded(&self) -> Result<(), McpError> {
        let loaded = async {
            while !self
                .extension_manager
                .is_extension_enabled(&self.extension)
                .await
            {
                tokio::time::sleep(EXTENSION_LOAD_POLL).await;
            }
        };
        tokio::time::timeout(EXTENSION_LOAD_TIMEOUT, loaded)
            .await
            .map_err(|_| {
                McpError::internal_error(
                    format!(
                        "extension '{}' is not loaded in this session",
                        self.extension
                    ),
                    None,
                )
            })
    }

    async fn instructions(&self) -> Option<String> {
        self.wait_until_loaded().await.ok()?;
        self.extension_manager
            .extension_instructions(&self.extension)
            .await
    }

    /// The session's tools for this extension, keyed by the name the ACP agent sees
    /// (goose's `extension__` prefix removed: the agent already namespaces by server).
    async fn tools(&self) -> Result<Vec<(Tool, String)>, McpError> {
        self.wait_until_loaded().await?;
        let prefix = format!("{}__", self.extension);
        let tools = self
            .extension_manager
            .get_prefixed_tools(&self.session_id, Some(self.extension.clone()))
            .await
            .map_err(|error| McpError::internal_error(error.to_string(), None))?;
        Ok(tools
            .into_iter()
            .map(|mut tool| {
                let goose_name = tool.name.to_string();
                if let Some(public_name) = goose_name.strip_prefix(&prefix) {
                    tool.name = public_name.to_string().into();
                }
                (tool, goose_name)
            })
            .collect())
    }
}

struct BridgeHandler;

impl ServerHandler for BridgeHandler {
    fn get_info(&self) -> ServerInfo {
        InitializeResult::new(ServerCapabilities::builder().enable_tools().build())
            .with_server_info(Implementation::new("goose", env!("CARGO_PKG_VERSION")))
    }

    async fn initialize(
        &self,
        request: InitializeRequestParams,
        context: RequestContext<RoleServer>,
    ) -> Result<InitializeResult, McpError> {
        context.peer.set_peer_info(request.clone());
        let mut result = self.negotiate_initialize(&request)?;
        result.instructions = BridgeTarget::from_context(&context)?.instructions().await;
        Ok(result)
    }

    async fn discover(
        &self,
        context: RequestContext<RoleServer>,
    ) -> Result<DiscoverResult, McpError> {
        let mut result = DiscoverResult::from_server_info(
            self.supported_protocol_versions().into_owned(),
            self.get_info(),
        );
        result.instructions = BridgeTarget::from_context(&context)?.instructions().await;
        Ok(result)
    }

    async fn list_tools(
        &self,
        _request: Option<PaginatedRequestParams>,
        context: RequestContext<RoleServer>,
    ) -> Result<ListToolsResult, McpError> {
        let tools = BridgeTarget::from_context(&context)?.tools().await?;
        // Private and never fresh: the list depends on the calling session and can change
        // as extensions load. Protocol 2026-07-28 clients reject a list without these.
        Ok(
            ListToolsResult::with_all_items(tools.into_iter().map(|(tool, _)| tool).collect())
                .with_ttl_ms(0)
                .with_cache_scope(CacheScope::Private),
        )
    }

    async fn call_tool(
        &self,
        mut request: CallToolRequestParams,
        context: RequestContext<RoleServer>,
    ) -> Result<CallToolResponse, McpError> {
        let target = BridgeTarget::from_context(&context)?;
        let goose_name = target
            .tools()
            .await?
            .into_iter()
            .find_map(|(tool, goose_name)| (tool.name == request.name).then_some(goose_name))
            .ok_or_else(|| {
                McpError::invalid_params(format!("unknown tool '{}'", request.name), None)
            })?;
        request.name = goose_name.into();

        let tool_context = ToolCallContext::new(target.session_id.clone(), None, None);
        let call = target
            .extension_manager
            .dispatch_tool_call(&tool_context, request, context.ct.clone())
            .await?;
        Ok(call.result.await?.into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::GooseMode;
    use crate::session::session_manager::SessionType;
    use rmcp::model::ContentBlock;
    use tokio_util::sync::CancellationToken;

    fn platform(name: &str) -> ExtensionConfig {
        ExtensionConfig::Platform {
            name: name.to_string(),
            description: String::new(),
            display_name: None,
            bundled: None,
            available_tools: Vec::new(),
        }
    }

    async fn session_with_orchestrator(dir: &std::path::Path) -> (Arc<ExtensionManager>, String) {
        let manager = Arc::new(ExtensionManager::new_without_provider(dir.to_path_buf()));
        let session = manager
            .get_context()
            .session_manager
            .create_session(
                dir.to_path_buf(),
                "bridge test".to_string(),
                SessionType::User,
                GooseMode::default(),
            )
            .await
            .unwrap();
        manager
            .add_extension(platform("orchestrator"), None, None, Some(&session.id))
            .await
            .unwrap();
        (manager, session.id)
    }

    fn bridged_config(configs: &[ExtensionConfig], name: &str) -> ExtensionConfig {
        configs
            .iter()
            .find(|config| config.name() == name)
            .cloned()
            .unwrap()
    }

    #[tokio::test]
    #[serial_test::serial(platform_bridge)]
    async fn acp_agent_reaches_its_own_sessions_platform_extension() {
        let temp_dir = tempfile::tempdir().unwrap();
        let (manager, session_id) = session_with_orchestrator(temp_dir.path()).await;

        let configs = bridge_platform_extensions(
            "claude-acp",
            &session_id,
            vec![platform("orchestrator"), platform("developer")],
            &manager,
        )
        .await;
        assert!(matches!(
            bridged_config(&configs, "orchestrator"),
            ExtensionConfig::StreamableHttp { .. }
        ));
        assert!(matches!(
            bridged_config(&configs, "developer"),
            ExtensionConfig::Platform { .. }
        ));

        let acp_child = Arc::new(ExtensionManager::new_without_provider(
            temp_dir.path().to_path_buf(),
        ));
        acp_child
            .add_extension(
                bridged_config(&configs, "orchestrator"),
                None,
                None,
                Some(&session_id),
            )
            .await
            .unwrap();
        let tools: Vec<String> = acp_child
            .get_prefixed_tools(&session_id, Some("orchestrator".to_string()))
            .await
            .unwrap()
            .into_iter()
            .map(|tool| tool.name.to_string())
            .collect();
        assert!(
            tools.contains(&"orchestrator__send_message".to_string()),
            "{tools:?}"
        );
        assert!(tools.contains(&"orchestrator__start_agent".to_string()));

        // The orchestrator refuses to message its own session, which it can only tell
        // if the bridge dispatched the call as the bridged session.
        let arguments = serde_json::json!({ "session_id": session_id, "message": "hi" });
        let call = acp_child
            .dispatch_tool_call(
                &ToolCallContext::new(session_id.clone(), None, None),
                CallToolRequestParams::new("orchestrator__send_message")
                    .with_arguments(arguments.as_object().unwrap().clone()),
                CancellationToken::default(),
            )
            .await
            .unwrap();
        let result = call.result.await.unwrap();
        assert!(result.is_error.unwrap_or(false));
        let text = match &result.content[0] {
            ContentBlock::Text(text) => text.text.clone(),
            other => panic!("unexpected content {other:?}"),
        };
        assert!(text.contains("orchestrator's own session"), "{text}");
    }

    #[tokio::test]
    #[serial_test::serial(platform_bridge)]
    async fn bridge_rejects_wrong_token_and_unbridged_extensions() {
        let temp_dir = tempfile::tempdir().unwrap();
        let (manager, session_id) = session_with_orchestrator(temp_dir.path()).await;
        let configs = bridge_platform_extensions(
            "claude-acp",
            &session_id,
            vec![platform("orchestrator")],
            &manager,
        )
        .await;
        let ExtensionConfig::StreamableHttp { uri, headers, .. } =
            bridged_config(&configs, "orchestrator")
        else {
            panic!("orchestrator was not bridged");
        };

        let client = reqwest::Client::new();
        let initialize = serde_json::json!({
            "jsonrpc": "2.0", "id": 1, "method": "initialize",
            "params": {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "t", "version": "0"}}
        });
        let post = |url: String, token: &str| {
            client
                .post(url)
                .header(SECRET_HEADER, token)
                .header("Accept", "application/json, text/event-stream")
                .json(&initialize)
                .send()
        };
        let token = &headers[SECRET_HEADER];

        assert_eq!(post(uri.clone(), token).await.unwrap().status(), 200);
        assert_eq!(post(uri.clone(), "wrong").await.unwrap().status(), 401);
        let developer = uri.replace("/orchestrator", "/developer");
        assert_eq!(post(developer, token).await.unwrap().status(), 404);
    }

    #[tokio::test]
    #[serial_test::serial(platform_bridge)]
    async fn non_acp_providers_keep_platform_extensions_in_process() {
        let temp_dir = tempfile::tempdir().unwrap();
        let (manager, session_id) = session_with_orchestrator(temp_dir.path()).await;
        let configs = bridge_platform_extensions(
            "openai",
            &session_id,
            vec![platform("orchestrator")],
            &manager,
        )
        .await;
        assert!(matches!(configs[..], [ExtensionConfig::Platform { .. }]));
    }
}
