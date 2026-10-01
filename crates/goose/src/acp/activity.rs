//! Progress tracking for the agent behind an ACP provider.
//!
//! goose knows when it is waiting on a `session/prompt`, but not whether the
//! agent answering it is still making progress, or whether an agent whose turn
//! ended still has work running. This records what the agent's own updates
//! say about that, so a client can tell "working", "waiting for the user", and
//! "stuck" apart.
//!
//! Background commands are the weak spot. claude-agent-acp publishes their
//! lifecycle only to clients that negotiate its JetBrains AIR `asyncTasks`
//! extension, which goose does not. What every client sees is the Bash result
//! announcing the command ("Command running in background with ID: …") and,
//! when a command finishes while the agent is idle, the agent resuming
//! unprompted to report on it. A command that finishes while the agent is busy
//! is reported inside that run and produces no update at all. So a command
//! counts as running from its announcement until the agent next resumes
//! unprompted or stops it. That forgets a command still running beside the one
//! that finished, which then shows as waiting until it brings the agent back.
//! Counting one command per run erred the other way, and worse: every command
//! that finished unseen left the session "working" until its age limit, long
//! after the agent had gone idle.

use std::sync::{Arc, Mutex};

use agent_client_protocol::schema::v1::{SessionUpdate, ToolCallStatus};
use goose_providers::base::ProviderActivity;

const BACKGROUND_COMMAND_MARKER: &str = "Command running in background with ID: ";

/// An unprompted run that goes this long without an update is over. Only
/// matters for an agent that does not report the result of each run.
const UNPROMPTED_RUN_GAP_MS: i64 = 60_000;

/// claude-agent-acp sends a usage update carrying this key with the result of
/// every cycle the agent runs, naming what started the cycle.
const CYCLE_ORIGIN_META_KEY: &str = "_claude/origin";

/// Enough for any real session; bounds the list if completions are missed.
const MAX_TRACKED_BACKGROUND_TASKS: usize = 32;

#[derive(Clone, Default)]
pub(crate) struct AcpActivity {
    state: Arc<Mutex<ActivityState>>,
}

#[derive(Default)]
struct ActivityState {
    /// Before goose's first prompt, updates are the agent replaying a resumed
    /// session's history, not anything it is doing now.
    prompted: bool,
    turn_in_flight: bool,
    /// The agent resumed with no prompt in flight and has not finished yet.
    unprompted_run_open: bool,
    last_update_at: Option<i64>,
    /// The latest update of the open unprompted run; `None` once it ends.
    last_unprompted_update_at: Option<i64>,
    pending_permissions: u32,
    exited: bool,
    /// (task id, start time), oldest first.
    background_tasks: Vec<(String, i64)>,
    last_turn_error: Option<String>,
    consecutive_failed_turns: u32,
}

pub(crate) fn now_ms() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

impl AcpActivity {
    fn with_state<T>(&self, f: impl FnOnce(&mut ActivityState) -> T) -> T {
        let mut state = self.state.lock().unwrap_or_else(|e| e.into_inner());
        f(&mut state)
    }

    pub(crate) fn snapshot(&self) -> ProviderActivity {
        self.with_state(|state| ProviderActivity {
            last_update_at: state.last_update_at,
            last_unprompted_update_at: state.last_unprompted_update_at,
            pending_permissions: state.pending_permissions,
            exited: state.exited,
            background_tasks_started_at: state
                .background_tasks
                .iter()
                .map(|(_, started)| *started)
                .collect(),
            last_turn_error: state.last_turn_error.clone(),
            consecutive_failed_turns: state.consecutive_failed_turns,
        })
    }

    pub(crate) fn record_update(&self, update: &SessionUpdate, now: i64) {
        self.with_state(|state| {
            let previous_update = state.last_update_at;
            state.last_update_at = Some(now);
            if !state.prompted {
                return;
            }
            if !state.turn_in_flight {
                let after_silence =
                    previous_update.is_some_and(|previous| now - previous > UNPROMPTED_RUN_GAP_MS);
                if is_agent_output(update) && (!state.unprompted_run_open || after_silence) {
                    state.unprompted_run_open = true;
                    state.background_tasks.clear();
                }
                if state.unprompted_run_open {
                    if is_cycle_result(update) {
                        state.unprompted_run_open = false;
                        state.last_unprompted_update_at = None;
                    } else {
                        state.last_unprompted_update_at = Some(now);
                    }
                }
            }
            if let Some(stopped) = stopped_background_task(update) {
                state.background_tasks.retain(|(id, _)| id != &stopped);
            }
            if let Some(task_id) = launched_background_task(update) {
                if !state.background_tasks.iter().any(|(id, _)| id == &task_id)
                    && state.background_tasks.len() < MAX_TRACKED_BACKGROUND_TASKS
                {
                    state.background_tasks.push((task_id, now));
                }
            }
        });
    }

    pub(crate) fn turn_started(&self, now: i64) {
        self.with_state(|state| {
            state.prompted = true;
            state.turn_in_flight = true;
            state.last_update_at = Some(now);
            state.unprompted_run_open = false;
            state.last_unprompted_update_at = None;
        });
    }

    pub(crate) fn turn_finished(&self, error: Option<String>, now: i64) {
        self.with_state(|state| {
            state.turn_in_flight = false;
            state.last_update_at = Some(now);
            match error {
                Some(error) => {
                    state.last_turn_error = Some(error);
                    state.consecutive_failed_turns += 1;
                }
                None => {
                    state.last_turn_error = None;
                    state.consecutive_failed_turns = 0;
                }
            }
        });
    }

    /// Failures goose hits before the prompt reaches the agent count as failed
    /// turns too: from the user's side the turn failed all the same.
    pub(crate) fn turn_failed_before_prompt(&self, error: String, now: i64) {
        self.turn_finished(Some(error), now);
    }

    pub(crate) fn permission_requested(&self, now: i64) {
        self.with_state(|state| {
            state.pending_permissions += 1;
            state.last_update_at = Some(now);
        });
    }

    pub(crate) fn permission_resolved(&self, now: i64) {
        self.with_state(|state| {
            state.pending_permissions = state.pending_permissions.saturating_sub(1);
            state.last_update_at = Some(now);
        });
    }

    pub(crate) fn mark_exited(&self) {
        self.with_state(|state| {
            state.exited = true;
            state.pending_permissions = 0;
        });
    }
}

fn is_agent_output(update: &SessionUpdate) -> bool {
    matches!(
        update,
        SessionUpdate::AgentMessageChunk(_)
            | SessionUpdate::AgentThoughtChunk(_)
            | SessionUpdate::ToolCall(_)
    )
}

fn is_cycle_result(update: &SessionUpdate) -> bool {
    matches!(
        update,
        SessionUpdate::UsageUpdate(usage)
            if usage
                .meta
                .as_ref()
                .is_some_and(|meta| meta.contains_key(CYCLE_ORIGIN_META_KEY))
    )
}

/// The task id a finished Bash call handed off to the background.
fn launched_background_task(update: &SessionUpdate) -> Option<String> {
    let (status, content, raw_output) = match update {
        SessionUpdate::ToolCall(call) => (
            Some(call.status),
            serde_json::to_string(&call.content).ok(),
            call.raw_output.as_ref().map(|v| v.to_string()),
        ),
        SessionUpdate::ToolCallUpdate(update) => (
            update.fields.status,
            update
                .fields
                .content
                .as_ref()
                .and_then(|content| serde_json::to_string(content).ok()),
            update.fields.raw_output.as_ref().map(|v| v.to_string()),
        ),
        _ => return None,
    };
    if status != Some(ToolCallStatus::Completed) {
        return None;
    }
    [content, raw_output]
        .into_iter()
        .flatten()
        .find_map(|text| background_task_id(&text))
}

fn background_task_id(text: &str) -> Option<String> {
    let (_, rest) = text.split_once(BACKGROUND_COMMAND_MARKER)?;
    let id: String = rest
        .chars()
        .take_while(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '-')
        .collect();
    (!id.is_empty()).then_some(id)
}

/// The task id of a call that stops a background command (KillShell,
/// TaskStop).
fn stopped_background_task(update: &SessionUpdate) -> Option<String> {
    let SessionUpdate::ToolCall(call) = update else {
        return None;
    };
    let input = call.raw_input.as_ref()?.as_object()?;
    if let Some(id) = input.get("shell_id").and_then(|v| v.as_str()) {
        return Some(id.to_string());
    }
    let title = call.title.to_lowercase();
    if title.contains("stop") || title.contains("kill") {
        return input
            .get("task_id")
            .and_then(|v| v.as_str())
            .map(str::to_string);
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use agent_client_protocol::schema::v1::{
        ContentBlock, ContentChunk, TextContent, ToolCall, ToolCallContent, ToolCallId,
        ToolCallUpdate, ToolCallUpdateFields, UsageUpdate,
    };

    fn text_chunk() -> SessionUpdate {
        SessionUpdate::AgentMessageChunk(ContentChunk::new(ContentBlock::Text(TextContent::new(
            "the build passed",
        ))))
    }

    fn background_bash_result(task_id: &str) -> SessionUpdate {
        let text = format!(
            "Command running in background with ID: {task_id}. Output is being written to: /tmp/tasks/{task_id}.output"
        );
        SessionUpdate::ToolCallUpdate(ToolCallUpdate::new(
            ToolCallId::new("toolu_bash"),
            ToolCallUpdateFields::new()
                .status(ToolCallStatus::Completed)
                .content(vec![ToolCallContent::from(ContentBlock::Text(
                    TextContent::new(text),
                ))]),
        ))
    }

    fn tool_progress() -> SessionUpdate {
        SessionUpdate::ToolCallUpdate(ToolCallUpdate::new(
            ToolCallId::new("toolu_slow"),
            ToolCallUpdateFields::new().status(ToolCallStatus::InProgress),
        ))
    }

    fn unprompted_run_result() -> SessionUpdate {
        let mut meta = serde_json::Map::new();
        meta.insert(
            "_claude/origin".to_string(),
            serde_json::json!({ "kind": "task-notification" }),
        );
        SessionUpdate::UsageUpdate(UsageUpdate::new(120_000, 1_000_000).meta(meta))
    }

    #[test]
    fn background_command_runs_until_the_agent_resumes_to_report_it() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&background_bash_result("b1x9"), 1_000);
        activity.record_update(&text_chunk(), 2_000);
        activity.turn_finished(None, 3_000);

        assert_eq!(activity.snapshot().background_tasks_started_at, vec![1_000]);

        activity.record_update(&text_chunk(), 600_000);
        activity.record_update(&text_chunk(), 601_000);
        let snapshot = activity.snapshot();
        assert!(snapshot.background_tasks_started_at.is_empty());
        assert_eq!(snapshot.last_unprompted_update_at, Some(601_000));
    }

    #[test]
    fn an_unprompted_run_forgets_the_commands_launched_before_it() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        // "first" finishes while the turn is still running, which no update
        // reports; "second" finishing is what brings the agent back.
        activity.record_update(&background_bash_result("first"), 1_000);
        activity.record_update(&background_bash_result("second"), 2_000);
        activity.turn_finished(None, 3_000);
        assert_eq!(
            activity.snapshot().background_tasks_started_at,
            vec![1_000, 2_000]
        );

        activity.record_update(&text_chunk(), 100_000);
        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn a_command_an_unprompted_run_launches_outlives_the_run() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&background_bash_result("first"), 1_000);
        activity.turn_finished(None, 2_000);

        activity.record_update(&text_chunk(), 100_000);
        activity.record_update(&background_bash_result("second"), 101_000);
        activity.record_update(&text_chunk(), 102_000);
        activity.record_update(&unprompted_run_result(), 103_000);

        let snapshot = activity.snapshot();
        assert_eq!(snapshot.background_tasks_started_at, vec![101_000]);
        assert_eq!(snapshot.last_unprompted_update_at, None);
    }

    #[test]
    fn nothing_is_in_flight_once_the_last_unprompted_run_ends() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&background_bash_result("a"), 1_000);
        activity.turn_finished(None, 2_000);

        // The agent comes back for "a" and starts two more. "b" finishes
        // before this run does, so nothing ever reports it.
        activity.record_update(&text_chunk(), 100_000);
        activity.record_update(&background_bash_result("b"), 110_000);
        activity.record_update(&background_bash_result("c"), 120_000);
        activity.record_update(&unprompted_run_result(), 130_000);
        assert_eq!(
            activity.snapshot().background_tasks_started_at,
            vec![110_000, 120_000]
        );

        // It comes back for "c" and starts nothing.
        activity.record_update(&text_chunk(), 300_000);
        assert_eq!(activity.snapshot().last_unprompted_update_at, Some(300_000));
        activity.record_update(&unprompted_run_result(), 310_000);

        let snapshot = activity.snapshot();
        assert!(snapshot.background_tasks_started_at.is_empty());
        assert_eq!(snapshot.last_unprompted_update_at, None);
        assert_eq!(snapshot.consecutive_failed_turns, 0);
        assert_eq!(snapshot.last_update_at, Some(310_000));
    }

    #[test]
    fn a_slow_tool_inside_an_unprompted_run_does_not_start_another() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.turn_finished(None, 1_000);

        activity.record_update(&text_chunk(), 100_000);
        activity.record_update(&background_bash_result("build"), 110_000);
        for at in [140_000, 170_000, 200_000] {
            activity.record_update(&tool_progress(), at);
        }
        assert_eq!(activity.snapshot().last_unprompted_update_at, Some(200_000));
        activity.record_update(&text_chunk(), 230_000);

        assert_eq!(
            activity.snapshot().background_tasks_started_at,
            vec![110_000]
        );
    }

    #[test]
    fn silence_separates_the_runs_of_an_agent_that_reports_no_results() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.turn_finished(None, 1_000);

        activity.record_update(&text_chunk(), 100_000);
        activity.record_update(&background_bash_result("build"), 101_000);
        activity.record_update(&text_chunk(), 102_000);
        assert_eq!(
            activity.snapshot().background_tasks_started_at,
            vec![101_000]
        );

        activity.record_update(&text_chunk(), 400_000);
        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn only_a_result_ends_an_unprompted_run() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.turn_finished(None, 1_000);

        // A result with no run open is the placeholder the agent emits for a
        // notification it answers together with a later one.
        activity.record_update(&unprompted_run_result(), 50_000);
        activity.record_update(&text_chunk(), 100_000);
        let mid_run_usage = SessionUpdate::UsageUpdate(UsageUpdate::new(120_000, 1_000_000));
        activity.record_update(&mid_run_usage, 101_000);
        assert_eq!(activity.snapshot().last_unprompted_update_at, Some(101_000));

        activity.record_update(&unprompted_run_result(), 102_000);
        assert_eq!(activity.snapshot().last_unprompted_update_at, None);
    }

    #[test]
    fn a_result_inside_a_prompt_is_not_an_unprompted_run_ending() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&background_bash_result("build"), 1_000);
        // The agent holds the prompt open for a background subagent and reports
        // on it before the prompt returns.
        activity.record_update(&text_chunk(), 100_000);
        activity.record_update(&unprompted_run_result(), 101_000);

        let snapshot = activity.snapshot();
        assert_eq!(snapshot.background_tasks_started_at, vec![1_000]);
        assert_eq!(snapshot.last_unprompted_update_at, None);
    }

    #[test]
    fn stopping_a_background_command_forgets_it() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&background_bash_result("b1x9"), 1_000);
        let kill = ToolCall::new(ToolCallId::new("toolu_kill"), "Kill Shell")
            .raw_input(serde_json::json!({ "shell_id": "b1x9" }));
        activity.record_update(&SessionUpdate::ToolCall(kill), 2_000);

        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn failed_turns_count_until_one_succeeds() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.turn_finished(Some("API Error: 400".to_string()), 1);
        activity.turn_started(2);
        activity.turn_finished(Some("API Error: 400".to_string()), 3);

        let snapshot = activity.snapshot();
        assert_eq!(snapshot.consecutive_failed_turns, 2);
        assert_eq!(snapshot.last_turn_error.as_deref(), Some("API Error: 400"));

        activity.turn_started(4);
        activity.turn_finished(None, 5);
        let snapshot = activity.snapshot();
        assert_eq!(snapshot.consecutive_failed_turns, 0);
        assert_eq!(snapshot.last_turn_error, None);
    }

    #[test]
    fn permissions_are_counted_and_cleared_when_the_agent_exits() {
        let activity = AcpActivity::default();
        activity.permission_requested(1);
        activity.permission_requested(2);
        activity.permission_resolved(3);
        assert_eq!(activity.snapshot().pending_permissions, 1);

        activity.mark_exited();
        let snapshot = activity.snapshot();
        assert!(snapshot.exited);
        assert_eq!(snapshot.pending_permissions, 0);
    }

    #[test]
    fn history_replayed_before_the_first_prompt_is_ignored() {
        let activity = AcpActivity::default();
        activity.record_update(&background_bash_result("old"), 1_000);
        activity.record_update(&text_chunk(), 2_000);
        let snapshot = activity.snapshot();
        assert!(snapshot.background_tasks_started_at.is_empty());
        assert_eq!(snapshot.last_unprompted_update_at, None);
    }

    #[test]
    fn prompted_output_is_not_unprompted() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&text_chunk(), 1_000);
        let snapshot = activity.snapshot();
        assert_eq!(snapshot.last_update_at, Some(1_000));
        assert_eq!(snapshot.last_unprompted_update_at, None);
    }
}
