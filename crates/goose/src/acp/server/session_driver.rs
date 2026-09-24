use super::*;
use crate::agents::platform_extensions::SessionDriver;
use agent_client_protocol::schema::v1::ContentChunk;

/// Runs turns that a platform extension starts (the orchestrator's `send_message`)
/// through `on_prompt`, so they take the run guard, stream to this connection's
/// client, and show up in the session's window exactly like a prompt the user sent.
pub(super) struct AcpSessionDriver {
    server: Weak<GooseAcpAgent>,
}

impl AcpSessionDriver {
    pub(super) fn new(server: Weak<GooseAcpAgent>) -> Self {
        Self { server }
    }

    fn connection(&self) -> Result<(Arc<GooseAcpAgent>, ConnectionTo<Client>), String> {
        let server = self
            .server
            .upgrade()
            .ok_or("the client connection has closed")?;
        let cx = server
            .client_cx
            .get()
            .cloned()
            .ok_or("no client is connected")?;
        Ok((server, cx))
    }

    async fn message_count(server: &GooseAcpAgent, session_id: &str) -> Result<usize, String> {
        let session = server
            .session_manager
            .get_session(session_id, true)
            .await
            .map_err(|error| format!("Session '{session_id}' not found: {error}"))?;
        Ok(session
            .conversation
            .map_or(0, |conversation| conversation.messages().len()))
    }

    async fn reply_since(
        server: &GooseAcpAgent,
        session_id: &str,
        first: usize,
    ) -> Result<String, String> {
        let session = server
            .session_manager
            .get_session(session_id, true)
            .await
            .map_err(|error| format!("Session '{session_id}' not found: {error}"))?;
        let messages = session
            .conversation
            .map(|conversation| conversation.messages().clone())
            .unwrap_or_default();
        Ok(messages
            .iter()
            .skip(first)
            .filter(|message| message.role == rmcp::model::Role::Assistant)
            .map(|message| message.as_concat_text())
            .filter(|text| !text.is_empty())
            .collect::<Vec<_>>()
            .join("\n\n"))
    }
}

#[async_trait::async_trait]
impl SessionDriver for AcpSessionDriver {
    async fn announce_session(&self, session_id: &str) {
        let Ok((server, cx)) = self.connection() else {
            return;
        };
        let Ok(session) = server.session_manager.get_session(session_id, false).await else {
            return;
        };
        let notification = SessionNotification::new(
            SessionId::new(session_id.to_string()),
            SessionUpdate::SessionInfoUpdate(
                SessionInfoUpdate::new()
                    .title(session.name)
                    .updated_at(session.updated_at.to_rfc3339()),
            ),
        );
        if let Err(error) = cx.send_notification(notification) {
            warn!(session_id, %error, "Failed to announce orchestrated session");
        }
    }

    async fn prompt(
        &self,
        session_id: &str,
        message: &str,
        cancel: CancellationToken,
    ) -> Result<String, String> {
        let (server, cx) = self.connection()?;
        let first = Self::message_count(&server, session_id).await?;
        let acp_session_id = SessionId::new(session_id.to_string());
        let content = ContentBlock::Text(TextContent::new(message.to_string()));

        // The client never sent this prompt, so it has no user message to show.
        cx.send_notification(SessionNotification::new(
            acp_session_id.clone(),
            SessionUpdate::UserMessageChunk(ContentChunk::new(content.clone())),
        ))
        .map_err(|error| error.to_string())?;

        let prompt = server.on_prompt(
            &cx,
            PromptRequest::new(acp_session_id.clone(), vec![content]),
        );
        tokio::select! {
            result = prompt => {
                result.map_err(|error| error.to_string())?;
            }
            _ = cancel.cancelled() => {
                let _ = server.on_cancel(CancelNotification::new(acp_session_id)).await;
                return Err("Cancelled by parent session".to_string());
            }
        }

        Self::reply_since(&server, session_id, first).await
    }
}
