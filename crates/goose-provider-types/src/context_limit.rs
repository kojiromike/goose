use std::collections::HashMap;
use std::future::Future;

use crate::canonical::{maybe_get_canonical_model, split_context_window_hint};
use crate::errors::ProviderError;
use crate::model::DEFAULT_CONTEXT_LIMIT;

#[derive(Debug, Clone, Default)]
pub struct ContextLimitResolver {
    provider_name: String,
    configured_limits: HashMap<String, usize>,
}

impl ContextLimitResolver {
    pub fn new(provider_name: impl Into<String>) -> Self {
        Self {
            provider_name: provider_name.into(),
            configured_limits: HashMap::new(),
        }
    }

    pub fn with_configured_limits(
        mut self,
        configured_limits: impl IntoIterator<Item = (String, usize)>,
    ) -> Self {
        self.configured_limits = configured_limits
            .into_iter()
            .filter(|(_, context_limit)| *context_limit > 0)
            .collect();
        self
    }

    fn configured_limit(&self, model: &str) -> Option<usize> {
        self.configured_limits.get(model).copied().or_else(|| {
            let mut matches = self
                .configured_limits
                .iter()
                .filter(|(configured_model, _)| configured_model.eq_ignore_ascii_case(model));
            let (_, limit) = matches.next()?;
            matches.next().is_none().then_some(*limit)
        })
    }

    /// Configured limit for a model id, matching the raw id first and, when
    /// the id carries a context-window hint (e.g. "claude-fable-5[1m]"), the
    /// base name second.
    fn configured_limit_for(&self, model: &str, base: &str, hinted: bool) -> Option<usize> {
        self.configured_limit(model)
            .or_else(|| hinted.then(|| self.configured_limit(base)).flatten())
    }

    pub fn resolve_local(&self, model: &str, override_limit: Option<usize>) -> usize {
        // A "[1m]"/"[200k]" hint in the model id names a specific
        // context-window variant, so it wins over the base model's canonical
        // limit — but not over an explicitly configured limit.
        let (base, window_hint) = split_context_window_hint(model);
        override_limit
            .or_else(|| self.configured_limit_for(model, base, window_hint.is_some()))
            .or(window_hint)
            .or_else(|| {
                maybe_get_canonical_model(&self.provider_name, model)
                    .map(|canonical| canonical.limit.context)
            })
            .unwrap_or(DEFAULT_CONTEXT_LIMIT)
    }

    pub async fn resolve<F, Fut>(
        &self,
        model: &str,
        override_limit: Option<usize>,
        discover: F,
    ) -> usize
    where
        F: FnOnce() -> Fut,
        Fut: Future<Output = Result<Option<usize>, ProviderError>>,
    {
        if let Some(limit) = override_limit {
            return limit;
        }

        let (base, window_hint) = split_context_window_hint(model);
        if let Some(limit) = self.configured_limit_for(model, base, window_hint.is_some()) {
            return limit;
        }

        // The hint names the exact context-window variant being requested, so
        // it outranks discovery (which may describe a different or stale
        // session) and the base model's canonical limit.
        if let Some(limit) = window_hint {
            return limit;
        }

        match discover().await {
            Ok(Some(limit)) if limit > 0 => return limit,
            Ok(Some(_) | None) => {}
            Err(error) => tracing::warn!(
                provider = self.provider_name,
                model,
                %error,
                "Context-limit discovery failed; falling back"
            ),
        }

        maybe_get_canonical_model(&self.provider_name, model)
            .map(|canonical| canonical.limit.context)
            .unwrap_or(DEFAULT_CONTEXT_LIMIT)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn applies_precedence() {
        let resolver = ContextLimitResolver::new("anthropic")
            .with_configured_limits([("claude-sonnet-4-5".to_string(), 64_000)]);

        assert_eq!(
            resolver
                .resolve("claude-sonnet-4-5", Some(32_000), || async {
                    Ok(Some(16_000))
                })
                .await,
            32_000
        );
        assert_eq!(
            resolver
                .resolve("claude-sonnet-4-5", None, || async { Ok(Some(16_000)) })
                .await,
            64_000
        );
    }

    #[test]
    fn configured_limits_match_case_insensitively() {
        let resolver = ContextLimitResolver::new("unknown-provider")
            .with_configured_limits([("MyModel".to_string(), 64_000)]);

        assert_eq!(resolver.resolve_local("mymodel", None), 64_000);
    }

    #[test]
    fn exact_match_wins_over_case_insensitive_matches() {
        let resolver = ContextLimitResolver::new("unknown-provider").with_configured_limits([
            ("MyModel".to_string(), 64_000),
            ("mymodel".to_string(), 32_000),
        ]);

        assert_eq!(resolver.resolve_local("MyModel", None), 64_000);
        assert_eq!(resolver.resolve_local("mymodel", None), 32_000);
        assert_eq!(
            resolver.resolve_local("MYMODEL", None),
            DEFAULT_CONTEXT_LIMIT
        );
    }

    #[test]
    fn ignores_zero_configured_limits() {
        let resolver = ContextLimitResolver::new("unknown-provider")
            .with_configured_limits([("configured".to_string(), 0)]);

        assert_eq!(
            resolver.resolve_local("configured", None),
            DEFAULT_CONTEXT_LIMIT
        );
    }

    #[test]
    fn local_resolution_skips_discovery() {
        let resolver = ContextLimitResolver::new("anthropic")
            .with_configured_limits([("configured".to_string(), 64_000)]);

        assert_eq!(resolver.resolve_local("configured", None), 64_000);
        assert_eq!(resolver.resolve_local("claude-sonnet-4-5", None), 1_000_000);
        assert_eq!(
            resolver.resolve_local("unknown", None),
            DEFAULT_CONTEXT_LIMIT
        );
    }

    #[tokio::test]
    async fn ignores_zero_discovered_limits() {
        let resolver = ContextLimitResolver::new("unknown-provider");

        assert_eq!(
            resolver
                .resolve("unknown-model", None, || async { Ok(Some(0)) })
                .await,
            DEFAULT_CONTEXT_LIMIT
        );
    }

    #[test]
    fn context_window_hint_overrides_canonical_limit() {
        let resolver = ContextLimitResolver::new("claude-acp");

        assert_eq!(
            resolver.resolve_local("claude-fable-5[1m]", None),
            1_000_000
        );
        // The hint is authoritative for the variant even when it is smaller
        // than the base model's canonical limit (claude-fable-5 is 1M).
        assert_eq!(
            resolver.resolve_local("claude-fable-5[200k]", None),
            200_000
        );
        assert_eq!(resolver.resolve_local("claude-fable-5", None), 1_000_000);
    }

    #[test]
    fn configured_limit_wins_over_context_window_hint() {
        let hinted = ContextLimitResolver::new("claude-acp")
            .with_configured_limits([("claude-fable-5[1m]".to_string(), 64_000)]);
        assert_eq!(hinted.resolve_local("claude-fable-5[1m]", None), 64_000);

        // A limit configured for the base name also applies to the hinted id.
        let base = ContextLimitResolver::new("claude-acp")
            .with_configured_limits([("claude-fable-5".to_string(), 64_000)]);
        assert_eq!(base.resolve_local("claude-fable-5[1m]", None), 64_000);

        assert_eq!(
            hinted.resolve_local("claude-fable-5[1m]", Some(32_000)),
            32_000
        );
    }

    #[tokio::test]
    async fn context_window_hint_outranks_discovery() {
        let resolver = ContextLimitResolver::new("claude-acp");

        assert_eq!(
            resolver
                .resolve("claude-fable-5[200k]", None, || async { Ok(Some(500_000)) })
                .await,
            200_000
        );
    }

    #[tokio::test]
    async fn uses_discovery_then_canonical_then_default() {
        let resolver = ContextLimitResolver::new("anthropic");
        assert_eq!(
            resolver
                .resolve("runtime-model", None, || async { Ok(Some(24_000)) })
                .await,
            24_000
        );
        assert_eq!(
            resolver
                .resolve("claude-sonnet-4-5", None, || async { Ok(None) })
                .await,
            1_000_000
        );
        assert_eq!(
            resolver
                .resolve("unknown-model", None, || async { Ok(None) })
                .await,
            DEFAULT_CONTEXT_LIMIT
        );
    }
}
