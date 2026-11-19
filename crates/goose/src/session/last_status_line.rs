//! The `STATUS:` line an agent ends its turn with, such as
//! `STATUS: waiting-external: CI is running; check back at 11:45`, so clients
//! can offer to snooze a session until the time the agent named.

use crate::conversation::message::MessageContent;
use anyhow::Result;
use rmcp::model::Role;
use sqlx::{AssertSqlSafe, Pool, Sqlite};
use std::collections::HashMap;

const STATUS_PREFIX: &str = "STATUS:";
const STATUS_LINE_MAX_CHARS: usize = 512;
// Streamed replies are stored a few characters per row, so read enough of the
// newest message's tail to hold a whole closing line.
const MESSAGE_TAIL_ROW_LIMIT: i64 = 400;

#[derive(Debug, sqlx::FromRow)]
struct TailRow {
    session_id: String,
    role: String,
    content_json: String,
}

/// Each session's closing `STATUS:` line, for the sessions whose newest
/// message is an assistant reply that ends with one.
pub(super) async fn last_status_lines(
    pool: &Pool<Sqlite>,
    session_ids: &[String],
) -> Result<HashMap<String, String>> {
    if session_ids.is_empty() {
        return Ok(HashMap::new());
    }

    // Every row of the session's newest message, newest first. A streamed
    // reply shares one message_id across all of its rows.
    let branch = r#"
        SELECT session_id, role, content_json FROM (
            SELECT id, session_id, role, content_json
            FROM messages
            WHERE session_id = ?
              AND message_id = (
                  SELECT message_id FROM messages
                  WHERE session_id = ?
                  ORDER BY created_timestamp DESC, id DESC
                  LIMIT 1
              )
            ORDER BY id DESC
            LIMIT ?
        )
    "#;
    let sql = std::iter::repeat_n(branch, session_ids.len())
        .collect::<Vec<_>>()
        .join(" UNION ALL ");

    let mut query = sqlx::query_as::<_, TailRow>(AssertSqlSafe(sql));
    for session_id in session_ids {
        query = query
            .bind(session_id)
            .bind(session_id)
            .bind(MESSAGE_TAIL_ROW_LIMIT);
    }
    let rows = query.fetch_all(pool).await?;

    let mut tails: HashMap<String, Vec<String>> = HashMap::new();
    for row in rows {
        if row.role != "assistant" {
            continue;
        }
        let Ok(content) = serde_json::from_str::<Vec<MessageContent>>(&row.content_json) else {
            continue;
        };
        let text: String = content
            .iter()
            .filter_map(|content| content.filter_for_audience(Role::User))
            .filter_map(|content| content.as_text().map(str::to_string))
            .collect();
        tails.entry(row.session_id).or_default().push(text);
    }

    Ok(tails
        .into_iter()
        .filter_map(|(session_id, mut newest_first)| {
            newest_first.reverse();
            status_line(&newest_first.concat()).map(|line| (session_id, line))
        })
        .collect())
}

/// The last non-blank line of `text`, when it is a `STATUS:` line.
fn status_line(text: &str) -> Option<String> {
    let line = text
        .lines()
        .rev()
        .find(|line| !line.trim().is_empty())?
        .trim();
    if !line.starts_with(STATUS_PREFIX) {
        return None;
    }
    Some(line.chars().take(STATUS_LINE_MAX_CHARS).collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::GooseMode;
    use crate::conversation::message::Message;
    use crate::session::session_manager::{SessionManager, SessionType};
    use std::path::PathBuf;
    use tempfile::TempDir;

    #[test]
    fn test_status_line_takes_the_closing_status_line() {
        assert_eq!(
            status_line("Done.\n\nSTATUS: done: merged it  \n\n").as_deref(),
            Some("STATUS: done: merged it")
        );
        assert_eq!(status_line("STATUS: blocked: x\n\nOne more thing."), None);
        assert_eq!(status_line("No status here."), None);
        assert_eq!(status_line(""), None);
        assert_eq!(
            status_line(&format!("STATUS: {}", "x".repeat(1000)))
                .unwrap()
                .chars()
                .count(),
            STATUS_LINE_MAX_CHARS
        );
    }

    async fn session_with(sm: &SessionManager, messages: &[Message]) -> String {
        let id = sm
            .create_session(
                PathBuf::from("/tmp/status-line"),
                "Status line session".to_string(),
                SessionType::User,
                GooseMode::default(),
            )
            .await
            .unwrap()
            .id;
        for message in messages {
            sm.add_message(&id, message).await.unwrap();
        }
        id
    }

    fn at(message: Message, created: i64, id: &str) -> Message {
        let mut message = message.with_id(id);
        message.created = created;
        message
    }

    #[tokio::test]
    async fn test_last_status_lines_joins_a_streamed_reply_and_skips_stale_ones() {
        let temp_dir = TempDir::new().unwrap();
        let sm = SessionManager::new(temp_dir.path().to_path_buf());

        let streamed = session_with(
            &sm,
            &[
                at(Message::user().with_text("go"), 1, "u1"),
                at(Message::assistant().with_text("All set.\n\nSTAT"), 2, "a1"),
                at(
                    Message::assistant().with_text("US: waiting-external: CI; "),
                    2,
                    "a1",
                ),
                at(
                    Message::assistant().with_text("check back at 11:45"),
                    2,
                    "a1",
                ),
            ],
        )
        .await;
        let answered = session_with(
            &sm,
            &[
                at(Message::assistant().with_text("STATUS: done: x"), 1, "a1"),
                at(Message::user().with_text("thanks"), 2, "u1"),
            ],
        )
        .await;
        let plain = session_with(
            &sm,
            &[at(
                Message::assistant().with_text("Just chatting."),
                1,
                "a1",
            )],
        )
        .await;

        let lines = sm
            .last_status_lines(&[streamed.clone(), answered.clone(), plain.clone()])
            .await
            .unwrap();
        assert_eq!(
            lines.get(&streamed).map(String::as_str),
            Some("STATUS: waiting-external: CI; check back at 11:45")
        );
        assert!(!lines.contains_key(&answered));
        assert!(!lines.contains_key(&plain));
    }
}
