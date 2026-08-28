//! Side channel carrying the agent-side session id to resume into provider
//! construction.
//!
//! `ProviderDef::from_env_with_working_dir` has a trait-fixed signature shared
//! by every ACP provider wrapper, so the id cannot be threaded through as an
//! argument or a config field without touching all of them. The agent sets this
//! around the provider-creation call, where the goose session — and therefore
//! its persisted resume id — is in scope.

tokio::task_local! {
    static RESUME_SESSION_ID: Option<String>;
}

pub async fn with_resume_session_id<F>(session_id: Option<String>, f: F) -> F::Output
where
    F: std::future::Future,
{
    RESUME_SESSION_ID.scope(session_id, f).await
}

pub fn current_resume_session_id() -> Option<String> {
    RESUME_SESSION_ID.try_with(|id| id.clone()).ok().flatten()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn resume_id_visible_inside_scope() {
        with_resume_session_id(Some("claude-abc".to_string()), async {
            assert_eq!(current_resume_session_id(), Some("claude-abc".to_string()));
        })
        .await;
    }

    #[tokio::test]
    async fn resume_id_absent_outside_scope() {
        assert_eq!(current_resume_session_id(), None);
    }

    #[tokio::test]
    async fn none_clears_outer_scope() {
        with_resume_session_id(Some("outer".to_string()), async {
            with_resume_session_id(None, async {
                assert_eq!(current_resume_session_id(), None);
            })
            .await;
        })
        .await;
    }
}
