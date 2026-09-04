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
        if provider.llm_backend_state().is_none() {
            return Ok(LlmBackendStatusResponse::default());
        }

        let settings = load_settings(Config::global(), provider.get_name());
        Ok(status(
            &settings,
            google_cloud_status(&settings).await,
            false,
        ))
    }

    pub(super) async fn on_configure_llm_backend(
        &self,
        req: ConfigureLlmBackendRequest,
    ) -> Result<LlmBackendStatusResponse, agent_client_protocol::Error> {
        let provider = self.session_provider(&req.session_id).await?;
        if provider.llm_backend_state().is_none() {
            return Ok(LlmBackendStatusResponse::default());
        }

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
            google_cloud_status(&settings).await,
            false,
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

        // A backend the agent must be started with cannot be installed on a
        // running session, and neither can leaving one.
        let carried_by_env = backend
            .as_ref()
            .is_some_and(|backend| !backend.is_routable());
        let leaving_env = settings
            .active
            .and_then(|kind| settings.backend(kind).ok().flatten())
            .is_some_and(|previous| !previous.is_routable());

        if !carried_by_env && !leaving_env {
            provider
                .set_llm_backend(backend.clone())
                .await
                .internal_err()?;
        }

        if let (Some(leaving), Some(model)) = (settings.active, req.current_model.as_deref()) {
            settings.remember_model(leaving, model);
        }
        settings.active = kind;
        save_settings(config, provider.get_name(), &settings).internal_err()?;

        Ok(status(
            &settings,
            google_cloud_status(&settings).await,
            carried_by_env || leaving_env,
        ))
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

/// Only report credential state once Vertex is on the table: an Anthropic-only
/// user should never see a Google Cloud line, and the check mints a token.
async fn google_cloud_status(settings: &LlmBackendSettings) -> Option<AdcStatus> {
    if settings.vertex.is_none() && settings.active != Some(LlmBackendKind::Vertex) {
        return None;
    }
    Some(gcloud_adc::status().await)
}

fn status(
    settings: &LlmBackendSettings,
    google_cloud: Option<AdcStatus>,
    applies_next_session: bool,
) -> LlmBackendStatusResponse {
    let vertex_configured = settings.backend(LlmBackendKind::Vertex).is_ok()
        && !settings.requires_model(LlmBackendKind::Vertex);
    LlmBackendStatusResponse {
        supported: true,
        applies_next_session,
        active: settings.active.map(|kind| match kind {
            LlmBackendKind::Anthropic => ANTHROPIC_ID.to_string(),
            LlmBackendKind::Vertex => VERTEX_ID.to_string(),
        }),
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
        let response = status(&vertex_settings(), None, false);

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
        let response = status(&vertex_settings(), None, true);

        assert!(response.applies_next_session);
        assert_eq!(response.active.as_deref(), Some("vertex"));
    }

    #[test]
    fn the_anthropic_option_describes_the_agents_own_login() {
        let response = status(&LlmBackendSettings::default(), None, false);

        let anthropic = &response.options[0];
        assert!(anthropic.configured);
        assert_eq!(anthropic.detail.as_deref(), Some("Your Claude Code login"));
    }

    #[test]
    fn an_unconfigured_vertex_option_says_what_is_missing() {
        let response = status(&LlmBackendSettings::default(), None, false);

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
            Some(AdcStatus::Ready {
                account: Some("dev@example.com".to_string()),
            }),
            false,
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

    #[tokio::test]
    async fn credentials_are_not_probed_until_vertex_is_in_play() {
        assert!(google_cloud_status(&LlmBackendSettings::default())
            .await
            .is_none());
    }
}
