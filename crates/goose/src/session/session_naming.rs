use std::path::Path;
use std::sync::{Arc, LazyLock};
use std::time::Duration;

use anyhow::Result;
use goose_providers::conversation::{message::Message, Conversation};
use goose_providers::model::ModelConfig;
use regex::Regex;

use crate::{config::Config, providers::base::Provider, utils::safe_truncate};

pub static MSG_COUNT_FOR_SESSION_NAME_GENERATION: usize = 3;

pub const SESSION_NAMING_PROVIDER_KEY: &str = "GOOSE_SESSION_NAMING_PROVIDER";
pub const SESSION_NAMING_MODEL_KEY: &str = "GOOSE_SESSION_NAMING_MODEL";

// A local model may have to load before it answers, and a reasoning model
// thinks before it writes four words.
const NAMING_PROVIDER_TIMEOUT: Duration = Duration::from_secs(120);
// Keep a pasted document from overflowing a small naming model's context.
const NAMING_PROVIDER_MESSAGE_CHARS: usize = 4000;

/// A provider dedicated to titling sessions, so that sessions whose own
/// provider cannot run a side completion still get a model-written title.
pub(crate) struct NamingProvider {
    pub(crate) provider: Arc<dyn Provider>,
    pub(crate) model_config: ModelConfig,
}

impl NamingProvider {
    pub(crate) async fn from_config() -> Result<Option<Self>> {
        let config = Config::global();
        let Some(provider_name) = non_empty_param(config, SESSION_NAMING_PROVIDER_KEY) else {
            return Ok(None);
        };
        let model_name = non_empty_param(config, SESSION_NAMING_MODEL_KEY)
            .or_else(|| {
                crate::config::providers::get_provider_entry(config, &provider_name)
                    .map(|entry| entry.model)
                    .filter(|model| !model.is_empty())
            })
            .ok_or_else(|| {
                anyhow::anyhow!("No model configured for session naming provider '{provider_name}'")
            })?;
        let model_config =
            crate::model_config::model_config_from_user_config(&provider_name, &model_name)?;
        let provider = crate::providers::create(&provider_name, Vec::new()).await?;
        Ok(Some(Self {
            provider,
            model_config,
        }))
    }
}

fn non_empty_param(config: &Config, key: &str) -> Option<String> {
    config
        .get_param::<String>(key)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn strip_xml_tags(text: &str) -> String {
    static BLOCK_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"(?s)<([a-zA-Z][a-zA-Z0-9_]*)[^>]*>.*?</[a-zA-Z][a-zA-Z0-9_]*>").unwrap()
    });
    static TAG_RE: LazyLock<Regex> =
        LazyLock::new(|| Regex::new(r"</?[a-zA-Z][a-zA-Z0-9_]*[^>]*>").unwrap());
    let pass1 = BLOCK_RE.replace_all(text, "");
    TAG_RE.replace_all(&pass1, "").into_owned()
}

fn extract_short_title(text: &str) -> String {
    let word_count = text.split_whitespace().count();
    if word_count <= 8 {
        return text.to_string();
    }

    {
        let mut results = Vec::new();
        let mut quote_char: Option<char> = None;
        let mut current = String::new();
        let mut prev_char: Option<char> = None;

        for ch in text.chars() {
            match quote_char {
                None => {
                    if matches!(ch, '"' | '\'' | '`') {
                        let after_alnum = prev_char.map(|p| p.is_alphanumeric()).unwrap_or(false);
                        if !after_alnum {
                            quote_char = Some(ch);
                            current.clear();
                        }
                    }
                }
                Some(q) => {
                    if ch == q {
                        let trimmed = current.trim().to_string();
                        let wc = trimmed.split_whitespace().count();
                        if (2..=8).contains(&wc) {
                            results.push(trimmed);
                        }
                        quote_char = None;
                        current.clear();
                    } else {
                        current.push(ch);
                    }
                }
            }
            prev_char = Some(ch);
        }

        if let Some(title) = results.last() {
            return title.clone();
        }
    }

    if let Some(last) = text.lines().rev().find(|l| !l.trim().is_empty()) {
        return last.trim().to_string();
    }

    text.to_string()
}

fn get_initial_user_messages(messages: &Conversation) -> Vec<String> {
    messages
        .iter()
        .filter(|m| m.role == rmcp::model::Role::User && m.is_user_visible())
        .take(MSG_COUNT_FOR_SESSION_NAME_GENERATION)
        .map(|m| {
            m.content
                .iter()
                .filter_map(|c| c.filter_for_audience(rmcp::model::Role::User))
                .filter_map(|c| c.as_text().map(|s| s.to_string()))
                .collect::<Vec<_>>()
                .join("\n")
        })
        .collect()
}

fn naming_system_prompt() -> Result<String> {
    Ok(crate::prompt_template::render_template(
        "session_name.md",
        &std::collections::HashMap::<String, String>::new(),
    )?)
}

fn naming_request(context: &[String], working_dir: Option<&Path>) -> Message {
    use crate::providers::cli_common::{
        SESSION_NAME_BEGIN_MARKER, SESSION_NAME_END_MARKER, SESSION_NAME_SUFFIX,
    };

    let hint = working_dir
        .and_then(Path::file_name)
        .and_then(|folder| folder.to_str())
        .map(|folder| format!("working folder: {folder}"))
        .unwrap_or_default();
    let hints_section = if hint.is_empty() {
        String::new()
    } else {
        format!(
            "---BEGIN HINTS (optional signals like the working folder; use them only when they match the subject of the messages)---\n{hint}\n---END HINTS---\n\n"
        )
    };
    let user_text = format!(
        "{}{}\n{}\n{}\n\n{}",
        hints_section,
        SESSION_NAME_BEGIN_MARKER,
        context.join("\n"),
        SESSION_NAME_END_MARKER,
        SESSION_NAME_SUFFIX,
    );
    Message::user().with_text(&user_text)
}

fn title_from_response(response: &Message) -> String {
    let raw: String = response
        .content
        .iter()
        .filter_map(|c| c.as_text())
        .collect();
    let description = strip_xml_tags(&raw)
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");

    safe_truncate(&extract_short_title(&description), 100)
}

pub(crate) async fn generate_session_name(
    provider: &dyn Provider,
    model_config: &ModelConfig,
    session_id: &str,
    messages: &Conversation,
    working_dir: Option<&Path>,
) -> Result<String> {
    let message = naming_request(&get_initial_user_messages(messages), working_dir);
    let result = if provider.uses_local_session_naming() {
        crate::providers::cli_common::generate_simple_session_description(
            provider.get_name(),
            &[message],
        )?
    } else {
        crate::model_config::complete_one_shot(
            provider,
            model_config,
            session_id,
            &naming_system_prompt()?,
            &[message],
            &[],
        )
        .await?
    };

    Ok(title_from_response(&result.0))
}

pub(crate) async fn generate_session_name_with_naming_provider(
    naming: &NamingProvider,
    session_id: &str,
    messages: &Conversation,
    working_dir: Option<&Path>,
) -> Result<String> {
    let context: Vec<String> = get_initial_user_messages(messages)
        .iter()
        .map(|message| safe_truncate(message, NAMING_PROVIDER_MESSAGE_CHARS))
        .collect();
    let message = naming_request(&context, working_dir);
    let system = naming_system_prompt()?;
    let result = tokio::time::timeout(
        NAMING_PROVIDER_TIMEOUT,
        crate::model_config::complete_one_shot(
            naming.provider.as_ref(),
            &naming.model_config,
            session_id,
            &system,
            &[message],
            &[],
        ),
    )
    .await
    .map_err(|_| anyhow::anyhow!("Session naming provider timed out"))??;

    let title = title_from_response(&result.0);
    if title.is_empty() {
        anyhow::bail!("Session naming provider returned an empty title");
    }
    Ok(title)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_strip_xml_tags() {
        assert_eq!(strip_xml_tags("<think>reasoning</think>answer"), "answer");
        assert_eq!(strip_xml_tags("before<t>mid</t>after"), "beforeafter");
        assert_eq!(strip_xml_tags("<a>x</a><b>y</b>z"), "z");
        assert_eq!(strip_xml_tags("no tags here"), "no tags here");
        assert_eq!(strip_xml_tags("a < b > c"), "a < b > c");
        assert_eq!(strip_xml_tags("<think>über</think>ok"), "ok");
        assert_eq!(strip_xml_tags("<think>日本語</think>hello"), "hello");
        assert_eq!(strip_xml_tags(""), "");
        assert_eq!(strip_xml_tags("<>stuff</>"), "<>stuff</>");
        // attributes
        assert_eq!(
            strip_xml_tags(r#"<think class="deep">reasoning</think>answer"#),
            "answer"
        );
        // self-closing tags
        assert_eq!(strip_xml_tags("<br/>self closing"), "self closing");
        // orphan closing tags
        assert_eq!(strip_xml_tags("orphan </think> tag"), "orphan  tag");
        // multiline content
        assert_eq!(
            strip_xml_tags("<think>\nline1\nline2\n</think>result"),
            "result"
        );
    }

    #[test]
    fn test_extract_short_title() {
        assert_eq!(extract_short_title("List files"), "List files");
        assert_eq!(
            extract_short_title(
                r#"blah blah blah blah blah blah blah blah blah "List files in folder""#
            ),
            "List files in folder"
        );
        assert_eq!(
            extract_short_title(
                "blah blah blah blah blah blah blah blah blah `View current files`"
            ),
            "View current files"
        );
        assert_eq!(
            extract_short_title(
                r#"stuff stuff stuff stuff stuff stuff stuff stuff "Abc title" "Zzz title""#
            ),
            "Zzz title"
        );
        assert_eq!(
            extract_short_title(
                "long long long long long long long long long\nList files in folder"
            ),
            "List files in folder"
        );
        assert_eq!(
            extract_short_title(
                r#"lots of words here and there and more and more "single" final line here"#
            ),
            "lots of words here and there and more and more \"single\" final line here"
        );
        assert_eq!(extract_short_title("Hello world"), "Hello world");
        assert_eq!(
            extract_short_title(
                r#"1. Analyze the request. 2. The user's message says list files. 3. "List current folder files" fits perfectly. Result: List current folder files"#
            ),
            "List current folder files"
        );
        assert_eq!(
            extract_short_title(
                r#"the user's phrasing is about listing files and the user's intent is clear. "List folder files" is best"#
            ),
            "List folder files"
        );
        assert_eq!(
            extract_short_title(
                "lots of reasoning here about what to call it\nList current folder files"
            ),
            "List current folder files"
        );
    }
}
