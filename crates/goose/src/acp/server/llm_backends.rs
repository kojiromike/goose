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
            state.active.as_ref(),
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
        save_settings(config, provider.get_name(), &settings).internal_err()?;

        Ok(status(
            &settings,
            state.active.as_ref(),
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
            Some(kind) => Some(settings.backend(kind).map_err(|error| {
                agent_client_protocol::Error::invalid_params().data(error.to_string())
            })?),
            None => None,
        };

        if needs_google_cloud(backend.as_ref()) {
            self.ensure_google_cloud_signin(req.sign_in).await?;
        }

        provider
            .set_llm_backend(backend.clone())
            .await
            .internal_err()?;

        if let (Some(leaving), Some(model)) = (settings.active, req.current_model.as_deref()) {
            settings.remember_model(leaving, model);
        }
        settings.active = kind;
        save_settings(config, provider.get_name(), &settings).internal_err()?;

        Ok(status(
            &settings,
            backend.as_ref(),
            google_cloud_status(&settings).await,
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
    active: Option<&LlmBackend>,
    google_cloud: Option<AdcStatus>,
) -> LlmBackendStatusResponse {
    let vertex_configured = settings.backend(LlmBackendKind::Vertex).is_ok();
    LlmBackendStatusResponse {
        supported: true,
        active: active.map(|backend| backend.label().to_string()),
        options: vec![
            LlmBackendOptionDto {
                id: ANTHROPIC_ID.to_string(),
                label: "Anthropic API".to_string(),
                configured: true,
                detail: settings.anthropic_base_url.clone(),
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
        return Some("Set a Google Cloud project and region to use Vertex AI".to_string());
    }
    settings
        .vertex
        .as_ref()
        .map(|vertex| format!("{} · {}", vertex.project_id, vertex.region))
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
    fn a_configured_vertex_option_shows_its_project_and_region() {
        let settings = vertex_settings();
        let active = settings.resolve().unwrap();

        let response = status(
            &settings,
            active.as_ref(),
            Some(AdcStatus::Ready {
                account: Some("dev@example.com".to_string()),
            }),
        );

        let vertex = &response.options[1];
        assert!(vertex.configured);
        assert_eq!(vertex.detail.as_deref(), Some("my-project · us-east5"));
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
