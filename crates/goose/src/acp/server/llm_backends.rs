use super::*;
use crate::acp::llm_backend::{
    load_settings, save_settings, LlmBackend, LlmBackendKind, LlmBackendSettings, VertexRouting,
};
use crate::providers::gcloud_adc::{self, AdcStatus};

const ANTHROPIC_ID: &str = "anthropic";
const VERTEX_ID: &str = "vertex";

impl GooseAcpAgent {
    pub(super) async fn on_read_llm_backend(
        &self,
        req: ReadLlmBackendRequest,
    ) -> Result<LlmBackendStatusResponse, agent_client_protocol::Error> {
        let provider = self.session_provider(&req.session_id).await?;
        let Some(state) = provider.llm_backend_state() else {
            return Ok(LlmBackendStatusResponse::default());
        };

        let settings = load_settings(Config::global(), provider.get_name());
        Ok(status(
            &settings,
            state.in_use,
            google_cloud_status(&settings).await,
        ))
    }

    pub(super) async fn on_configure_llm_backend(
        &self,
        req: ConfigureLlmBackendRequest,
    ) -> Result<LlmBackendStatusResponse, agent_client_protocol::Error> {
        let provider = self.session_provider(&req.session_id).await?;
        let Some(state) = provider.llm_backend_state() else {
            return Ok(LlmBackendStatusResponse::default());
        };

        let config = Config::global();
        let mut settings = load_settings(config, provider.get_name());
        settings.vertex = req.vertex.map(|vertex| VertexRouting {
            project_id: vertex.project_id,
            region: vertex.region,
            base_url: vertex.base_url,
        });
        if let Some(model) = req.vertex_model.filter(|model| !model.trim().is_empty()) {
            settings.remember_model(LlmBackendKind::Vertex, model.trim());
        }
        save_settings(config, provider.get_name(), &settings).internal_err()?;

        Ok(status(
            &settings,
            state.in_use,
            google_cloud_status(&settings).await,
        ))
    }

    pub(super) async fn on_set_llm_backend(
        &self,
        req: SetLlmBackendRequest,
    ) -> Result<LlmBackendStatusResponse, agent_client_protocol::Error> {
        let provider = self.session_provider(&req.session_id).await?;
        if provider.llm_backend_state().is_none() {
            return Err(agent_client_protocol::Error::invalid_params().data(format!(
                "{} does not support choosing an LLM backend",
                provider.get_name()
            )));
        }

        let kind = match req.backend.as_deref() {
            None => None,
            Some(ANTHROPIC_ID) => Some(LlmBackendKind::Anthropic),
            Some(VERTEX_ID) => Some(LlmBackendKind::Vertex),
            Some(other) => {
                return Err(agent_client_protocol::Error::invalid_params()
                    .data(format!("Unknown LLM backend: {other}")))
            }
        };

        let config = Config::global();
        let mut settings = load_settings(config, provider.get_name());
        let backend = match kind {
            Some(kind) => {
                if settings.requires_model(kind) {
                    return Err(agent_client_protocol::Error::invalid_params().data(
                        "Choose a model for Vertex AI in its settings first: a Vertex project enables models one by one, so this session's model may not exist there",
                    ));
                }
                settings.backend(kind).map_err(|error| {
                    agent_client_protocol::Error::invalid_params().data(error.to_string())
                })?
            }
            None => None,
        };

        if needs_google_cloud(backend.as_ref()) {
            self.ensure_google_cloud_signin(req.sign_in).await?;
        }

        let needs_restart = requires_restart(&settings, backend.as_ref());

        // The restart replaces the agent the running turn is talking to, which
        // would strand that turn's answer in a process nothing is reading.
        if needs_restart && self.has_active_run(&req.session_id).await {
            return Err(agent_client_protocol::Error::invalid_params().data(
                "This chat is mid-response. Let it finish or stop it first: switching backend restarts its agent.",
            ));
        }

        if let (Some(leaving), Some(model)) = (settings.active, req.current_model.as_deref()) {
            settings.remember_model(leaving, model);
        }
        settings.active = kind;
        save_settings(config, provider.get_name(), &settings).internal_err()?;

        if needs_restart {
            // After the save: the replacement agent reads its backend from the
            // stored selection.
            self.restart_session_on_backend(&req.session_id, &settings, kind)
                .await?;
        } else {
            provider
                .set_llm_backend(backend.clone())
                .await
                .internal_err()?;
        }

        // Read the session's backend back rather than assuming the save moved
        // it: whether the switch reached this session is the whole question.
        // A restart replaced the provider, so ask the session for it again.
        let provider = self.session_provider(&req.session_id).await?;
        let in_use = provider.llm_backend_state().and_then(|state| state.in_use);
        Ok(status(
            &settings,
            in_use,
            google_cloud_status(&settings).await,
        ))
    }

    /// Moves a live session onto `kind` by replacing its agent with one started
    /// for that backend, resuming the conversation into it.
    ///
    /// The model moves with it: backends spell model ids differently, and a
    /// Vertex project enables them one by one, so carrying the outgoing
    /// backend's id across would strand the session on a model the new one
    /// does not serve.
    async fn restart_session_on_backend(
        &self,
        session_id: &str,
        settings: &LlmBackendSettings,
        kind: Option<LlmBackendKind>,
    ) -> Result<(), agent_client_protocol::Error> {
        let agent = self.get_session_agent(session_id).await?;
        let provider_name = agent
            .provider()
            .await
            .internal_err()?
            .get_name()
            .to_string();
        let current_model_config = agent
            .model_config_for_session(session_id)
            .await
            .internal_err_ctx("Failed to resolve model config")?;
        let model = model_for_switch(settings, kind, &current_model_config.model_name);
        let model_config =
            crate::model_config::model_config_from_user_config_with_session_settings(
                &provider_name,
                model,
                Some(&current_model_config),
                None,
                None,
            )
            .invalid_params_err_ctx("Invalid model config")?;

        agent
            .recreate_provider_for_session(session_id, &provider_name, model_config)
            .await
            .internal_err_ctx("Failed to restart this chat on the selected backend")?;
        self.subscribe_thinking_effort_updates(session_id, &agent)
            .await;
        Ok(())
    }

    async fn has_active_run(&self, session_id: &str) -> bool {
        self.active_prompt_runs
            .lock()
            .await
            .contains_key(session_id)
    }

    /// Signing in opens a browser, so it only happens when the user asked for
    /// this backend; otherwise the caller gets an error it can offer to fix.
    async fn ensure_google_cloud_signin(
        &self,
        sign_in: bool,
    ) -> Result<(), agent_client_protocol::Error> {
        if gcloud_adc::status().await.is_ready() {
            return Ok(());
        }
        if !sign_in {
            return Err(agent_client_protocol::Error::auth_required()
                .data("Vertex AI needs a Google Cloud sign-in"));
        }

        gcloud_adc::ensure_ready(|line| tracing::info!(target: "gcloud", "{line}"))
            .await
            .internal_err()?;
        Ok(())
    }

    async fn session_provider(
        &self,
        session_id: &str,
    ) -> Result<Arc<dyn Provider>, agent_client_protocol::Error> {
        self.get_session_agent(session_id)
            .await?
            .provider()
            .await
            .internal_err()
    }
}

fn needs_google_cloud(backend: Option<&LlmBackend>) -> bool {
    matches!(backend, Some(LlmBackend::Vertex(_)))
}

/// Whether moving to `next` needs the session's agent replaced rather than
/// switched in place.
///
/// Routing sent over the wire reaches a live agent. A backend carried in the
/// child's environment does not: it is fixed when that child starts, so both
/// arriving at one and leaving one take a new child.
fn requires_restart(settings: &LlmBackendSettings, next: Option<&LlmBackend>) -> bool {
    let arriving_by_env = next.is_some_and(|backend| !backend.is_routable());
    let leaving_by_env = settings
        .active
        .and_then(|kind| settings.backend(kind).ok().flatten())
        .is_some_and(|previous| !previous.is_routable());
    arriving_by_env || leaving_by_env
}

/// The model a session restarted onto `kind` should run.
///
/// Each backend remembers the model it was last used with, because the ids are
/// spelled differently and a Vertex project enables them one at a time. Only a
/// backend nothing is remembered for keeps the outgoing model.
fn model_for_switch<'a>(
    settings: &'a LlmBackendSettings,
    kind: Option<LlmBackendKind>,
    current: &'a str,
) -> &'a str {
    kind.and_then(|kind| settings.model_for(kind))
        .unwrap_or(current)
}

fn backend_id(kind: LlmBackendKind) -> String {
    match kind {
        LlmBackendKind::Anthropic => ANTHROPIC_ID.to_string(),
        LlmBackendKind::Vertex => VERTEX_ID.to_string(),
    }
}

/// Only report credential state once Vertex is on the table: an Anthropic-only
/// user should never see a Google Cloud line, and the check mints a token.
async fn google_cloud_status(settings: &LlmBackendSettings) -> Option<AdcStatus> {
    if settings.vertex.is_none() && settings.active != Some(LlmBackendKind::Vertex) {
        return None;
    }
    Some(gcloud_adc::status().await)
}

/// `in_use` is the backend this session's agent was started for, which is the
/// one it bills. It differs from the saved selection whenever the choice was
/// made after the agent started, and a checkmark on the saved selection would
/// then point at an account this session never reaches.
fn status(
    settings: &LlmBackendSettings,
    in_use: Option<LlmBackendKind>,
    google_cloud: Option<AdcStatus>,
) -> LlmBackendStatusResponse {
    let vertex_configured = settings.backend(LlmBackendKind::Vertex).is_ok()
        && !settings.requires_model(LlmBackendKind::Vertex);
    LlmBackendStatusResponse {
        supported: true,
        applies_next_session: settings.active != in_use,
        active: in_use.map(backend_id),
        selected: settings.active.map(backend_id),
        options: vec![
            LlmBackendOptionDto {
                id: ANTHROPIC_ID.to_string(),
                label: "Anthropic API".to_string(),
                configured: true,
                detail: Some(
                    settings
                        .anthropic_base_url
                        .clone()
                        .unwrap_or_else(|| "Your Claude Code login".to_string()),
                ),
                model: settings
                    .model_for(LlmBackendKind::Anthropic)
                    .map(str::to_string),
            },
            LlmBackendOptionDto {
                id: VERTEX_ID.to_string(),
                label: "Vertex AI".to_string(),
                configured: vertex_configured,
                detail: vertex_detail(settings, vertex_configured),
                model: settings
                    .model_for(LlmBackendKind::Vertex)
                    .map(str::to_string),
            },
        ],
        vertex: settings.vertex.as_ref().map(|vertex| VertexRoutingDto {
            project_id: vertex.project_id.clone(),
            region: vertex.region.clone(),
            base_url: vertex.base_url.clone(),
        }),
        google_cloud: google_cloud.map(google_cloud_dto),
    }
}

fn vertex_detail(settings: &LlmBackendSettings, configured: bool) -> Option<String> {
    if !configured {
        return Some("Set a Google Cloud project, region and model to use Vertex AI".to_string());
    }
    settings.vertex.as_ref().map(|vertex| {
        let model = settings.model_for(LlmBackendKind::Vertex).unwrap_or("");
        format!("{} · {} · {}", vertex.project_id, vertex.region, model)
    })
}

fn google_cloud_dto(status: AdcStatus) -> GoogleCloudAuthDto {
    match status {
        AdcStatus::Ready { account } => GoogleCloudAuthDto {
            state: "ready".to_string(),
            account,
            detail: None,
        },
        AdcStatus::NotConfigured => GoogleCloudAuthDto {
            state: "not_configured".to_string(),
            account: None,
            detail: None,
        },
        AdcStatus::Invalid { detail } => GoogleCloudAuthDto {
            state: "invalid".to_string(),
            account: None,
            detail: Some(detail),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn vertex_backend() -> LlmBackend {
        LlmBackend::Vertex(VertexRouting {
            project_id: "my-project".to_string(),
            region: "us-east5".to_string(),
            base_url: None,
        })
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
            models: Default::default(),
        }
    }

    /// A project and region are not enough: without a model, selecting Vertex
    /// would carry over one it does not offer.
    #[test]
    fn vertex_is_not_configured_until_it_has_a_model() {
        let response = status(&vertex_settings(), Some(LlmBackendKind::Vertex), None);

        let vertex = &response.options[1];
        assert!(!vertex.configured);
        assert!(vertex.detail.as_deref().unwrap().contains("model"));
    }

    /// Selecting Anthropic hands routing back to the agent's own login rather
    /// than pointing it at the first-party API, which would 401.
    /// Saving a backend the agent must be started with is a success with a
    /// caveat, not a failure — reporting it as an error made every switch look
    /// broken.
    #[test]
    fn a_backend_applied_at_startup_is_reported_not_raised() {
        let response = status(&vertex_settings(), None, None);

        assert!(response.applies_next_session);
        assert_eq!(response.selected.as_deref(), Some("vertex"));
    }

    /// The checkmark answers "where does this session's money go", so it
    /// follows the running agent, not the setting. Saving Vertex while a
    /// session is already up on the Claude Code login leaves that session
    /// billing the login until it restarts.
    #[test]
    fn the_check_follows_the_session_not_the_saved_selection() {
        let response = status(&vertex_settings(), Some(LlmBackendKind::Anthropic), None);

        assert_eq!(response.active.as_deref(), Some("anthropic"));
        assert_eq!(response.selected.as_deref(), Some("vertex"));
        assert!(response.applies_next_session);
    }

    #[test]
    fn a_session_started_on_the_saved_backend_is_not_reported_as_pending() {
        let response = status(&vertex_settings(), Some(LlmBackendKind::Vertex), None);

        assert_eq!(response.active.as_deref(), Some("vertex"));
        assert_eq!(response.selected.as_deref(), Some("vertex"));
        assert!(!response.applies_next_session);
    }

    #[test]
    fn the_anthropic_option_describes_the_agents_own_login() {
        let response = status(&LlmBackendSettings::default(), None, None);

        let anthropic = &response.options[0];
        assert!(anthropic.configured);
        assert_eq!(anthropic.detail.as_deref(), Some("Your Claude Code login"));
    }

    #[test]
    fn an_unconfigured_vertex_option_says_what_is_missing() {
        let response = status(&LlmBackendSettings::default(), None, None);

        let vertex = &response.options[1];
        assert!(!vertex.configured);
        assert!(vertex.detail.as_deref().unwrap().contains("project"));
        assert_eq!(response.active, None);
        assert!(response.google_cloud.is_none());
    }

    #[test]
    fn a_configured_vertex_option_shows_its_project_region_and_model() {
        let mut settings = vertex_settings();
        settings.remember_model(LlmBackendKind::Vertex, "claude-opus-5@20260514");

        let response = status(
            &settings,
            Some(LlmBackendKind::Vertex),
            Some(AdcStatus::Ready {
                account: Some("dev@example.com".to_string()),
            }),
        );

        let vertex = &response.options[1];
        assert!(vertex.configured);
        assert_eq!(
            vertex.detail.as_deref(),
            Some("my-project · us-east5 · claude-opus-5@20260514")
        );
        assert_eq!(vertex.model.as_deref(), Some("claude-opus-5@20260514"));
        assert_eq!(response.active.as_deref(), Some("vertex"));
        assert_eq!(
            response.google_cloud.unwrap().account.as_deref(),
            Some("dev@example.com")
        );
    }

    /// The case that cost real money: Vertex arrives in the child's
    /// environment, so a session already up on the Claude Code login only
    /// reaches it by starting a new child.
    #[test]
    fn arriving_at_an_environment_carried_backend_restarts_the_session() {
        let settings = LlmBackendSettings::default();

        assert!(requires_restart(&settings, Some(&vertex_backend())));
    }

    /// Symmetric: the environment cannot be unset on a running child either, so
    /// going back to the Claude Code login is just as much a restart.
    #[test]
    fn leaving_an_environment_carried_backend_restarts_the_session() {
        let settings = vertex_settings();

        assert!(requires_restart(&settings, None));
    }

    /// A gateway is installed over the wire, which a live agent accepts — and a
    /// restart there would cost a conversation replay for nothing.
    #[test]
    fn a_routable_backend_is_installed_without_a_restart() {
        let settings = LlmBackendSettings {
            anthropic_base_url: Some("https://gateway.internal".to_string()),
            ..LlmBackendSettings::default()
        };
        let gateway = LlmBackend::AnthropicGateway {
            base_url: "https://gateway.internal".to_string(),
        };

        assert!(!requires_restart(&settings, Some(&gateway)));
    }

    /// Carrying `claude-opus-5[1m]` onto Vertex strands the session on an id
    /// that project does not serve, so the switch takes the model with it.
    #[test]
    fn a_restart_lands_on_the_model_the_new_backend_remembers() {
        let mut settings = vertex_settings();
        settings.remember_model(LlmBackendKind::Vertex, "claude-opus-5@20260514");

        let model = model_for_switch(&settings, Some(LlmBackendKind::Vertex), "claude-opus-5[1m]");

        assert_eq!(model, "claude-opus-5@20260514");
    }

    #[test]
    fn a_backend_with_no_remembered_model_keeps_the_current_one() {
        let settings = LlmBackendSettings::default();

        let model = model_for_switch(
            &settings,
            Some(LlmBackendKind::Anthropic),
            "claude-opus-5[1m]",
        );

        assert_eq!(model, "claude-opus-5[1m]");
    }

    #[tokio::test]
    async fn credentials_are_not_probed_until_vertex_is_in_play() {
        assert!(google_cloud_status(&LlmBackendSettings::default())
            .await
            .is_none());
    }
}
