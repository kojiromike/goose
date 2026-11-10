//! `/clear` against a provider that owns the conversation.
//!
//! For such providers goose's transcript is a display copy: the model sees the
//! provider's own history. Clearing only the copy leaves the real context in
//! place while the token meter reads zero. See issue #10763.

use async_trait::async_trait;
use futures::StreamExt;
use goose::agents::execute_commands::stale_provider_context_message;
use goose::agents::{AgentEvent, SessionConfig, StateMachineServices, StateMachineServicesConfig};
use goose::config::GooseMode;
use goose::conversation::message::{Message, MessageContent};
use goose::conversation::Conversation;
use goose::providers::base::{stream_from_single_message, MessageStream, Provider};
use goose::session::session_manager::SessionType;
use goose::session::Session;
use goose_providers::conversation::token_usage::{ProviderUsage, Usage};
use goose_providers::errors::ProviderError;
use goose_providers::model::ModelConfig;
use rmcp::model::Tool;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
use tempfile::TempDir;

const PROVIDER_NAME: &str = "mock-owns-context";

struct MockOwnContextProvider {
    resets: AtomicUsize,
    reset_error: Option<String>,
}

impl MockOwnContextProvider {
    fn resettable() -> Self {
        Self {
            resets: AtomicUsize::new(0),
            reset_error: None,
        }
    }

    fn unresettable(error: &str) -> Self {
        Self {
            resets: AtomicUsize::new(0),
            reset_error: Some(error.to_string()),
        }
    }
}

/// A context-owning provider that never overrides `reset_context`, standing in
/// for one added later by someone unaware of `/clear`.
struct ForgetfulProvider;

#[async_trait]
impl Provider for ForgetfulProvider {
    async fn stream(
        &self,
        _model_config: &ModelConfig,
        _system_prompt: &str,
        _messages: &[Message],
        _tools: &[Tool],
    ) -> Result<MessageStream, ProviderError> {
        let usage = ProviderUsage::new(
            "mock-model".to_string(),
            Usage::new(Some(10), Some(10), Some(20)),
        );
        Ok(stream_from_single_message(
            Message::assistant().with_text("ok"),
            usage,
        ))
    }

    fn get_name(&self) -> &str {
        "forgetful"
    }

    fn manages_own_context(&self) -> bool {
        true
    }
}

#[async_trait]
impl Provider for MockOwnContextProvider {
    async fn stream(
        &self,
        _model_config: &ModelConfig,
        _system_prompt: &str,
        _messages: &[Message],
        _tools: &[Tool],
    ) -> Result<MessageStream, ProviderError> {
        let usage = ProviderUsage::new(
            "mock-model".to_string(),
            Usage::new(Some(10), Some(10), Some(20)),
        );
        Ok(stream_from_single_message(
            Message::assistant().with_text("ok"),
            usage,
        ))
    }

    fn get_name(&self) -> &str {
        PROVIDER_NAME
    }

    fn manages_own_context(&self) -> bool {
        true
    }

    async fn reset_context(&self) -> Result<(), ProviderError> {
        self.resets.fetch_add(1, Ordering::SeqCst);
        match &self.reset_error {
            Some(error) => Err(ProviderError::NotImplemented(error.clone())),
            None => Ok(()),
        }
    }
}

async fn setup_session(
    services: &StateMachineServices,
    temp_dir: &TempDir,
    name: &str,
) -> anyhow::Result<Session> {
    let session = services
        .session_manager
        .create_session(
            temp_dir.path().to_path_buf(),
            name.to_string(),
            SessionType::Hidden,
            GooseMode::default(),
        )
        .await?;

    let conversation = Conversation::new_unvalidated(vec![
        Message::user().with_text("Hello"),
        Message::assistant().with_text("Hi there!"),
    ]);
    services
        .session_manager
        .replace_conversation(&session.id, &conversation)
        .await?;
    services
        .session_manager
        .update(&session.id)
        .usage(Usage::new(Some(6000), Some(400), Some(6400)))
        .apply()
        .await?;

    Ok(session)
}

fn services() -> Arc<StateMachineServices> {
    StateMachineServices::with_config(StateMachineServicesConfig::cli())
}

/// Send `/clear` and return the text of the reply goose shows the user.
async fn clear(services: &Arc<StateMachineServices>, session_id: &str) -> anyhow::Result<String> {
    let session_config = SessionConfig {
        id: session_id.to_string(),
        schedule_id: None,
        max_turns: None,
    };
    let mut stream = services
        .reply(Message::user().with_text("/clear"), session_config, None)
        .await?;
    let mut reply = None;
    while let Some(event) = stream.next().await {
        if let AgentEvent::Message(message) = event? {
            if message.role == rmcp::model::Role::Assistant {
                reply = Some(message_text(&message));
            }
        }
    }
    reply.ok_or_else(|| anyhow::anyhow!("/clear produced no reply"))
}

fn message_text(message: &Message) -> String {
    message
        .content
        .iter()
        .filter_map(|content| match content {
            MessageContent::Text(text) => Some(text.text.clone()),
            _ => None,
        })
        .collect()
}

#[tokio::test]
async fn clear_resets_provider_context_and_zeroes_usage() -> anyhow::Result<()> {
    let temp_dir = TempDir::new()?;
    let services = services();
    let session = setup_session(&services, &temp_dir, "clear-resettable").await?;

    let provider = Arc::new(MockOwnContextProvider::resettable());
    services
        .update_provider(
            provider.clone(),
            ModelConfig::new("mock-model"),
            &session.id,
        )
        .await?;

    let result = clear(&services, &session.id).await?;
    assert_eq!(result, "Conversation cleared");
    assert_eq!(provider.resets.load(Ordering::SeqCst), 1);

    let updated = services
        .session_manager
        .get_session(&session.id, true)
        .await?;
    assert!(updated
        .conversation
        .expect("session has a conversation")
        .messages()
        .iter()
        .all(|message| !message.is_agent_visible()));
    assert_eq!(updated.usage.total_tokens, Some(0));

    Ok(())
}

#[tokio::test]
async fn clear_keeps_usage_when_the_provider_cannot_reset() -> anyhow::Result<()> {
    let temp_dir = TempDir::new()?;
    let services = services();
    let session = setup_session(&services, &temp_dir, "clear-unresettable").await?;

    let provider = Arc::new(MockOwnContextProvider::unresettable("no reset for you"));
    services
        .update_provider(
            provider.clone(),
            ModelConfig::new("mock-model"),
            &session.id,
        )
        .await?;

    let result = clear(&services, &session.id).await?;
    assert_eq!(
        result,
        stale_provider_context_message(PROVIDER_NAME, "Unsupported operation: no reset for you")
    );

    let updated = services
        .session_manager
        .get_session(&session.id, true)
        .await?;
    assert!(updated
        .conversation
        .expect("session has a conversation")
        .messages()
        .iter()
        .all(|message| !message.is_agent_visible()));
    assert_eq!(
        updated.usage.total_tokens,
        Some(6400),
        "the meter must keep reflecting the context the model still holds"
    );

    Ok(())
}

#[tokio::test]
async fn a_context_owning_provider_does_not_inherit_a_silent_reset() -> anyhow::Result<()> {
    let temp_dir = TempDir::new()?;
    let services = services();
    let session = setup_session(&services, &temp_dir, "clear-forgetful").await?;

    services
        .update_provider(
            Arc::new(ForgetfulProvider),
            ModelConfig::new("mock-model"),
            &session.id,
        )
        .await?;

    let result = clear(&services, &session.id).await?;
    assert!(
        result.contains("still holds the previous conversation"),
        "the default reset_context must refuse for providers that own their context, got: {}",
        result
    );

    let updated = services
        .session_manager
        .get_session(&session.id, true)
        .await?;
    assert_eq!(updated.usage.total_tokens, Some(6400));

    Ok(())
}

/// A provider whose `reset_context` records whether goose's transcript was
/// already empty when the reset arrived.
struct ResetOrderProbe {
    session_manager: Arc<goose::session::SessionManager>,
    session_id: String,
    local_already_cleared: AtomicBool,
}

#[async_trait]
impl Provider for ResetOrderProbe {
    async fn stream(
        &self,
        _model_config: &ModelConfig,
        _system_prompt: &str,
        _messages: &[Message],
        _tools: &[Tool],
    ) -> Result<MessageStream, ProviderError> {
        let usage = ProviderUsage::new(
            "mock-model".to_string(),
            Usage::new(Some(10), Some(10), Some(20)),
        );
        Ok(stream_from_single_message(
            Message::assistant().with_text("ok"),
            usage,
        ))
    }

    fn get_name(&self) -> &str {
        "reset-order-probe"
    }

    fn manages_own_context(&self) -> bool {
        true
    }

    async fn reset_context(&self) -> Result<(), ProviderError> {
        let cleared = self
            .session_manager
            .get_session(&self.session_id, true)
            .await
            .ok()
            .and_then(|session| session.conversation)
            .map(|conversation| conversation.messages().is_empty())
            .unwrap_or(false);
        self.local_already_cleared.store(cleared, Ordering::SeqCst);
        Ok(())
    }
}

/// The provider may only be reset after the local clear succeeds: a
/// provider-side reset cannot be undone, so a failed local clear must leave
/// both histories in place rather than only goose's.
#[tokio::test]
async fn clear_empties_the_local_transcript_before_resetting_the_provider() -> anyhow::Result<()> {
    let temp_dir = TempDir::new()?;
    let services = services();
    let session = setup_session(&services, &temp_dir, "clear-ordering").await?;

    let provider = Arc::new(ResetOrderProbe {
        session_manager: services.session_manager.clone(),
        session_id: session.id.clone(),
        local_already_cleared: AtomicBool::new(false),
    });
    services
        .update_provider(
            provider.clone(),
            ModelConfig::new("mock-model"),
            &session.id,
        )
        .await?;

    clear(&services, &session.id).await?;

    assert!(
        provider.local_already_cleared.load(Ordering::SeqCst),
        "the local transcript must already be empty when the provider reset runs"
    );

    Ok(())
}

/// Records the last user text the agent was asked to answer.
struct RecordingProvider {
    last_user_text: std::sync::Mutex<Option<String>>,
}

#[async_trait]
impl Provider for RecordingProvider {
    async fn stream(
        &self,
        _model_config: &ModelConfig,
        _system_prompt: &str,
        messages: &[Message],
        _tools: &[Tool],
    ) -> Result<MessageStream, ProviderError> {
        let last = messages
            .iter()
            .rev()
            .find(|message| message.role == rmcp::model::Role::User)
            .map(message_text);
        *self.last_user_text.lock().unwrap() = last;
        let usage = ProviderUsage::new(
            "mock-model".to_string(),
            Usage::new(Some(10), Some(10), Some(20)),
        );
        Ok(stream_from_single_message(
            Message::assistant().with_text("ok"),
            usage,
        ))
    }

    fn get_name(&self) -> &str {
        "recording"
    }

    fn manages_own_context(&self) -> bool {
        true
    }
}

async fn send(
    services: &Arc<StateMachineServices>,
    session_id: &str,
    text: &str,
) -> anyhow::Result<Vec<String>> {
    let session_config = SessionConfig {
        id: session_id.to_string(),
        schedule_id: None,
        max_turns: None,
    };
    let mut stream = services
        .reply(Message::user().with_text(text), session_config, None)
        .await?;
    let mut replies = Vec::new();
    while let Some(event) = stream.next().await {
        if let AgentEvent::Message(message) = event? {
            if message.role == rmcp::model::Role::Assistant {
                replies.push(message_text(&message));
            }
        }
    }
    Ok(replies)
}

#[tokio::test]
async fn acp_passthrough_sends_the_bare_command_to_the_agent() -> anyhow::Result<()> {
    let temp_dir = TempDir::new()?;
    let services = services();
    let session = setup_session(&services, &temp_dir, "acp-passthrough").await?;
    let provider = Arc::new(RecordingProvider {
        last_user_text: std::sync::Mutex::new(None),
    });
    services
        .update_provider(
            provider.clone(),
            ModelConfig::new("mock-model"),
            &session.id,
        )
        .await?;

    send(&services, &session.id, "/acp clear").await?;

    let sent = provider.last_user_text.lock().unwrap().clone();
    assert!(
        sent.as_deref()
            .is_some_and(|text| text.starts_with("/clear")),
        "goose must not handle a wrapped command itself, sent: {sent:?}"
    );
    Ok(())
}

#[tokio::test]
async fn bare_acp_answers_with_usage_without_a_turn() -> anyhow::Result<()> {
    let temp_dir = TempDir::new()?;
    let services = services();
    let session = setup_session(&services, &temp_dir, "acp-usage").await?;
    let provider = Arc::new(RecordingProvider {
        last_user_text: std::sync::Mutex::new(None),
    });
    services
        .update_provider(
            provider.clone(),
            ModelConfig::new("mock-model"),
            &session.id,
        )
        .await?;

    let replies = send(&services, &session.id, "/acp").await?;

    assert!(replies.iter().any(|reply| reply.starts_with("Usage: /acp")));
    assert_eq!(*provider.last_user_text.lock().unwrap(), None);
    Ok(())
}
