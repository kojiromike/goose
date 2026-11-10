//! Commands that act on context a provider keeps for itself, such as an ACP agent's session.

use std::sync::Arc;

use anyhow::{anyhow, Result};
use async_trait::async_trait;
use goose_providers::base::Provider;

use crate::agents::execute_commands::{stale_provider_context_message, PASSTHROUGH_COMMAND};
use crate::agents::state_machine::{
    messages_since_kickoff, not_applicable, yielded_with, ConversationEffect, Emitter, GooseEffect,
    Operation, OperationResult, SlashCommand,
};
use crate::agents::AgentEvent;
use crate::conversation::message::Message;
use crate::conversation::Conversation;
use crate::session::{Session, SessionManager};

pub struct ProviderContextOperation {
    provider: Arc<dyn Provider>,
    session_manager: Arc<SessionManager>,
}

impl ProviderContextOperation {
    pub fn new(provider: Arc<dyn Provider>, session_manager: Arc<SessionManager>) -> Self {
        Self {
            provider,
            session_manager,
        }
    }

    fn command_message(conversation: &Conversation) -> Result<Message> {
        messages_since_kickoff(conversation)?
            .first()
            .cloned()
            .ok_or_else(|| anyhow!("slash command conversation has no kickoff message"))
    }

    fn passthrough_usage(
        conversation: &Conversation,
        emit: &Emitter,
    ) -> Result<OperationResult<GooseEffect>> {
        let command = Self::command_message(conversation)?;
        let message_id = command
            .id
            .clone()
            .ok_or_else(|| anyhow!("Persisted slash command message has no id"))?;
        emit.message(command.with_visibility(true, false));
        let response = emit.message(
            Message::assistant()
                .with_text(format!(
                    "Usage: /{PASSTHROUGH_COMMAND} <command> sends /<command> to the underlying \
                     agent instead of goose, e.g. /{PASSTHROUGH_COMMAND} compact"
                ))
                .with_visibility(true, false),
        );
        yielded_with([
            ConversationEffect::SetMessageVisibility {
                message_id,
                user_visible: true,
                agent_visible: false,
            }
            .into(),
            response.into(),
        ])
    }

    /// Goose's transcript is only a copy for a provider that manages its own
    /// context, so `/clear` also has to drop the provider's conversation. The
    /// local clear runs first: a provider-side reset cannot be undone, so a
    /// failed local clear must leave both histories in place.
    async fn clear(
        &self,
        session: &Session,
        conversation: &Conversation,
        emit: &Emitter,
    ) -> Result<OperationResult<GooseEffect>> {
        let command = Self::command_message(conversation)?.with_visibility(true, false);
        self.session_manager
            .replace_conversation(&session.id, &Conversation::default())
            .await?;
        let reset = self.provider.reset_context().await;
        let text = match &reset {
            Ok(()) => "Conversation cleared".to_string(),
            Err(error) => {
                tracing::warn!(provider = self.provider.get_name(), %error, "provider-side context reset failed");
                stale_provider_context_message(self.provider.get_name(), &error.to_string())
            }
        };
        let command = emit.message(command);
        let response = emit.message(
            Message::assistant()
                .with_text(text)
                .with_visibility(true, false),
        );
        if reset.is_ok() {
            return yielded_with([
                GooseEffect::CompactConversation {
                    conversation: Conversation::default(),
                    usage: None,
                },
                command.into(),
                response.into(),
            ]);
        }
        // Replacing the conversation through an effect would re-estimate usage
        // from the empty transcript, but the meter has to keep showing the
        // context the model still holds, so only the client's history is reset.
        emit.emit(AgentEvent::HistoryReplaced(Conversation::new_unvalidated(
            vec![command.clone(), response.clone()],
        )));
        yielded_with([command.into(), response.into()])
    }
}

#[async_trait]
impl Operation<Session, GooseEffect> for ProviderContextOperation {
    fn name(&self) -> &'static str {
        "provider_context"
    }

    async fn run_command(
        &self,
        command: &SlashCommand<'_>,
        session: &Session,
        conversation: &Conversation,
        emit: &Emitter,
    ) -> Result<OperationResult<GooseEffect>> {
        match command.command {
            PASSTHROUGH_COMMAND => Self::passthrough_usage(conversation, emit),
            "clear" if self.provider.manages_own_context() => {
                self.clear(session, conversation, emit).await
            }
            _ => not_applicable(),
        }
    }
}
