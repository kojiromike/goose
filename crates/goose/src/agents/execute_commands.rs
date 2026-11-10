use crate::conversation::message::{Message, MessageContent};

pub fn slash_commands_enabled() -> bool {
    crate::config::Config::global()
        .get_param::<bool>("GOOSE_SLASH_COMMANDS_ENABLED")
        .unwrap_or(true)
}

pub const COMPACT_TRIGGERS: &[&str] =
    &["/compact", "Please compact this conversation", "/summarize"];

pub const PASSTHROUGH_COMMAND: &str = "acp";

pub struct CommandDef {
    pub name: &'static str,
    pub description: &'static str,
}

static COMMANDS: &[CommandDef] = &[
    CommandDef {
        name: "prompts",
        description: "List available prompts, optionally filtered by extension",
    },
    CommandDef {
        name: "prompt",
        description: "Execute a prompt or show its info with --info",
    },
    CommandDef {
        name: "compact",
        description: "Compact the conversation history",
    },
    CommandDef {
        name: "clear",
        description: "Clear the conversation history",
    },
    CommandDef {
        name: "skills",
        description: "List installed skills and other available sources",
    },
    CommandDef {
        name: "doctor",
        description: "Check that your Goose setup is working",
    },
    CommandDef {
        name: "goal",
        description: "Set a goal the agent must satisfy before finishing, or clear with /goal off",
    },
    CommandDef {
        name: "grind",
        description:
            "Set a goal the agent pursues relentlessly until max_turns, or clear with /grind off",
    },
    CommandDef {
        name: "status",
        description: "Show session status: session ID, model, provider, mode, and token usage",
    },
    CommandDef {
        name: PASSTHROUGH_COMMAND,
        description:
            "Send a slash command to the underlying agent instead of goose, e.g. /acp compact",
    },
];

pub struct ParsedSlashCommand<'a> {
    pub command: &'a str,
    pub params_str: &'a str,
}

pub fn parse_slash_command(message_text: &str) -> Option<ParsedSlashCommand<'_>> {
    let mut trimmed = message_text.trim();

    if COMPACT_TRIGGERS.contains(&trimmed) {
        trimmed = COMPACT_TRIGGERS[0];
    }

    if !trimmed.starts_with('/') {
        return None;
    }

    let command_str = trimmed.strip_prefix('/').unwrap_or(trimmed);
    let (command, params_str) = command_str
        .split_once(' ')
        .map(|(cmd, p)| (cmd, p.trim()))
        .unwrap_or((command_str, ""));

    Some(ParsedSlashCommand {
        command,
        params_str,
    })
}

/// Unwraps `/acp <command>` into the command text to forward to the provider
/// verbatim, e.g. `/acp compact` -> `/compact`. Goose shadows names like
/// `/compact` and handles them locally, but a provider that runs its own agent
/// session (ACP) keeps conversation state goose cannot reach, so the local
/// handling is a no-op against the state that actually matters. Forwarding the
/// command as prompt text lets that agent handle it instead.
///
/// Returns `None` for a bare `/acp`, which `execute_command` answers with usage
/// text rather than sending a meaningless prompt to the agent.
pub fn unwrap_passthrough_command(message_text: &str) -> Option<String> {
    let inner = message_text
        .trim()
        .strip_prefix('/')?
        .strip_prefix(PASSTHROUGH_COMMAND)?
        .strip_prefix(char::is_whitespace)?
        .trim();

    if inner.is_empty() {
        return None;
    }

    Some(match inner.strip_prefix('/') {
        Some(_) => inner.to_string(),
        None => format!("/{inner}"),
    })
}

const PASSTHROUGH_NOTE_OPERATION: &str = "slash_command";
const PASSTHROUGH_NOTE: &str = "passthrough";

/// Rewrite an `/acp <command>` message so the agent receives the bare command,
/// and mark it so goose's own slash-command dispatch leaves it alone.
pub fn apply_passthrough_command(message: &mut Message) -> bool {
    let text = message.agent_visible_content().as_concat_text();
    let Some(command) = unwrap_passthrough_command(&text) else {
        return false;
    };
    replace_agent_visible_text(message, &command);
    message
        .metadata
        .set_operation_note(PASSTHROUGH_NOTE_OPERATION, PASSTHROUGH_NOTE, true.into());
    true
}

pub fn is_passthrough_command(message: &Message) -> bool {
    message
        .metadata
        .operation_note(PASSTHROUGH_NOTE_OPERATION, PASSTHROUGH_NOTE)
        .and_then(serde_json::Value::as_bool)
        .unwrap_or(false)
}

fn replace_agent_visible_text(message: &mut Message, text: &str) {
    let mut replaced = false;
    message.content.retain_mut(|content| {
        if content
            .filter_for_audience(rmcp::model::Role::Assistant)
            .is_none()
        {
            return true;
        }
        let MessageContent::Text(block) = content else {
            return true;
        };
        if replaced {
            return false;
        }
        block.text = text.to_string();
        replaced = true;
        true
    });
}

pub fn list_commands() -> &'static [CommandDef] {
    COMMANDS
}

pub fn context_management_unsupported_message(command: &str, provider: &str) -> String {
    format!(
        "/{command} is not available for provider '{provider}' because it manages its own conversation context"
    )
}

/// Shown when `/clear` emptied goose's transcript but the provider still holds
/// the real conversation.
pub fn stale_provider_context_message(provider_name: &str, error: &str) -> String {
    format!(
        "Cleared goose's transcript, but '{provider_name}' still holds the previous conversation \
         and will keep sending it to the model: {error}. Start a new session for a full reset."
    )
}

fn is_clear_goal_param(params_str: &str) -> bool {
    matches!(params_str, "off" | "clear" | "none")
}

/// Whether a slash command should kick off an agent turn instead of just
/// returning a confirmation. Setting a `/goal` or `/grind` (with a description,
/// not the query or `off` forms) makes the agent start pursuing it immediately.
pub fn command_starts_turn(message_text: &str) -> bool {
    let Some(parsed) = parse_slash_command(message_text) else {
        return false;
    };
    matches!(parsed.command, "goal" | "grind")
        && !parsed.params_str.is_empty()
        && !is_clear_goal_param(parsed.params_str)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_slash_command_splits_on_literal_space() {
        let parsed = parse_slash_command("/speckit.plan hello world").unwrap();

        assert_eq!(parsed.command, "speckit.plan");
        assert_eq!(parsed.params_str, "hello world");
    }

    #[test]
    fn parse_slash_command_does_not_split_on_tab_or_newline() {
        let parsed = parse_slash_command("/speckit.plan\thello").unwrap();
        assert_eq!(parsed.command, "speckit.plan\thello");
        assert_eq!(parsed.params_str, "");

        let parsed = parse_slash_command("/speckit.plan\nhello").unwrap();
        assert_eq!(parsed.command, "speckit.plan\nhello");
        assert_eq!(parsed.params_str, "");
    }

    #[test]
    fn apply_passthrough_command_collapses_agent_blocks_and_keeps_user_only_blocks() {
        use rmcp::model::{Annotations, Role, TextContent};

        let user_only = TextContent::new("SECRET_USER_ONLY")
            .with_annotations(Annotations::default().with_audience(vec![Role::User]));
        let mut message = Message::user()
            .with_text("/acp compact")
            .with_text("trailing")
            .with_content(MessageContent::Text(user_only));

        assert!(apply_passthrough_command(&mut message));

        let agent_visible = message.agent_visible_content();
        assert_eq!(agent_visible.content.len(), 1);
        assert_eq!(agent_visible.as_concat_text(), "/compact\ntrailing");
        assert!(is_passthrough_command(&message));
        assert!(message
            .content
            .iter()
            .filter_map(|c| c.as_text())
            .any(|text| text == "SECRET_USER_ONLY"));
    }

    #[test]
    fn apply_passthrough_command_leaves_other_messages_unmarked() {
        let mut message = Message::user().with_text("/compact");
        assert!(!apply_passthrough_command(&mut message));
        assert!(!is_passthrough_command(&message));
        let mut bare = Message::user().with_text("/acp");
        assert!(!apply_passthrough_command(&mut bare));
    }

    #[test]
    fn unwrap_passthrough_command_strips_the_acp_wrapper() {
        assert_eq!(
            unwrap_passthrough_command("/acp compact").as_deref(),
            Some("/compact")
        );
        assert_eq!(
            unwrap_passthrough_command("  /acp   compact  ").as_deref(),
            Some("/compact")
        );
        // An already-slashed inner command must not gain a second slash,
        // which the agent would not honor.
        assert_eq!(
            unwrap_passthrough_command("/acp /compact").as_deref(),
            Some("/compact")
        );
        assert_eq!(
            unwrap_passthrough_command("/acp model opus").as_deref(),
            Some("/model opus")
        );
    }

    #[test]
    fn unwrap_passthrough_command_ignores_non_passthrough_text() {
        // Bare `/acp` is answered with usage text, not forwarded.
        assert_eq!(unwrap_passthrough_command("/acp"), None);
        assert_eq!(unwrap_passthrough_command("/acp   "), None);
        assert_eq!(unwrap_passthrough_command("/acpfoo bar"), None);
        assert_eq!(unwrap_passthrough_command("/compact"), None);
        assert_eq!(unwrap_passthrough_command("acp compact"), None);
        assert_eq!(
            unwrap_passthrough_command("tell me about /acp compact"),
            None
        );
    }

    #[test]
    fn passthrough_command_is_listed_so_it_is_not_treated_as_a_recipe() {
        assert!(list_commands()
            .iter()
            .any(|cmd| cmd.name == PASSTHROUGH_COMMAND));
    }

    #[test]
    fn command_starts_turn_only_for_goal_and_grind_with_description() {
        assert!(command_starts_turn("/goal make all tests pass"));
        assert!(command_starts_turn("/grind keep refactoring"));

        // Query and clear forms must not start a turn.
        assert!(!command_starts_turn("/goal"));
        assert!(!command_starts_turn("/goal off"));
        assert!(!command_starts_turn("/goal clear"));
        assert!(!command_starts_turn("/goal none"));
        assert!(!command_starts_turn("/grind"));
        assert!(!command_starts_turn("/grind off"));

        // Other commands and plain prompts never start a turn here.
        assert!(!command_starts_turn("/compact"));
        assert!(!command_starts_turn("just a normal message"));
    }

    #[test]
    fn status_is_registered_as_a_builtin_command() {
        assert!(list_commands()
            .iter()
            .any(|command| command.name == "status"));
    }
}
