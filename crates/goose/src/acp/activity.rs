//! Progress tracking for the agent behind an ACP provider.
//!
//! goose knows when it is waiting on a `session/prompt`, but not whether the
//! agent answering it is still making progress, or whether an agent whose turn
//! ended still has work running. This records what the agent's own updates
//! say about that, so a client can tell "working", "waiting for the user", and
//! "stuck" apart.
//!
//! Background work comes in two kinds. A backgrounded Bash command keeps its
//! display terminal open until its task ends, so claude-agent-acp reports the
//! real end with `_meta.terminal_exit`, on the tool result if the command has
//! already finished or in an update of its own later on, whether or not the
//! agent is busy. The announcement arrives first, in `_meta.terminal_output`.
//!
//! A Monitor has no terminal, and its lifecycle reaches only clients that
//! negotiate the JetBrains AIR `asyncTasks` extension, which also switches the
//! adapter's subagent and metadata handling to AIR's. What goose sees is the
//! tool result ("Monitor started (task …") and, when one ends while the agent
//! is idle, the agent resuming unprompted to report on it. One that ends while
//! the agent is busy produces no update at all. So a Monitor counts as running
//! from its announcement until the agent next resumes unprompted or stops it,
//! and a missed report lasts until the client's age limit.

use std::collections::HashSet;
use std::sync::{Arc, Mutex};

use agent_client_protocol::schema::v1::{
    Content, ContentBlock, SessionUpdate, ToolCallContent, ToolCallStatus, ToolCallUpdate,
};
use goose_providers::base::ProviderActivity;

const BACKGROUND_COMMAND_MARKER: &str = "Command running in background with ID: ";
const MONITOR_MARKER: &str = "Monitor started (task ";
const TERMINAL_OUTPUT_META_KEY: &str = "terminal_output";
const TERMINAL_EXIT_META_KEY: &str = "terminal_exit";

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
    /// Oldest first.
    background_tasks: Vec<BackgroundTask>,
    /// Open calls that stop a background command, by tool call id. The agent
    /// announces a call before its input streams in, and the update that
    /// carries the input does not repeat the title that marks it as a stop.
    stop_calls: HashSet<String>,
    last_turn_error: Option<String>,
    consecutive_failed_turns: u32,
}

struct BackgroundTask {
    id: String,
    started_at: i64,
    /// Set when the agent will report the task's end with `terminal_exit`.
    terminal_id: Option<String>,
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
                .map(|task| task.started_at)
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
                    state
                        .background_tasks
                        .retain(|task| task.terminal_id.is_some());
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
            if let Some(stopped) = stopped_background_task(&mut state.stop_calls, update) {
                state.background_tasks.retain(|task| task.id != stopped);
            }
            if let Some(launched) = launched_background_task(update) {
                if !state
                    .background_tasks
                    .iter()
                    .any(|task| task.id == launched.id)
                    && state.background_tasks.len() < MAX_TRACKED_BACKGROUND_TASKS
                {
                    state.background_tasks.push(BackgroundTask {
                        id: launched.id,
                        started_at: now,
                        terminal_id: launched.terminal_id,
                    });
                }
            }
            if let Some(exited) = exited_terminal(update) {
                state
                    .background_tasks
                    .retain(|task| task.terminal_id.as_deref() != Some(exited));
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

struct LaunchedTask {
    id: String,
    terminal_id: Option<String>,
}

fn launched_background_task(update: &SessionUpdate) -> Option<LaunchedTask> {
    match update {
        SessionUpdate::ToolCall(call) => {
            launched_monitor(call.status, Some(call.content.as_slice()))
        }
        SessionUpdate::ToolCallUpdate(update) => launched_command(update)
            .or_else(|| launched_monitor(update.fields.status?, update.fields.content.as_deref())),
        _ => None,
    }
}

fn launched_command(update: &ToolCallUpdate) -> Option<LaunchedTask> {
    let output = update.meta.as_ref()?.get(TERMINAL_OUTPUT_META_KEY)?;
    let data = output.get("data")?.as_str()?;
    Some(LaunchedTask {
        id: task_id_after_marker(data, BACKGROUND_COMMAND_MARKER)?,
        terminal_id: Some(output.get("terminal_id")?.as_str()?.to_string()),
    })
}

/// Only the start of a block counts: a read of a log or of this file quotes
/// the marker without starting anything.
fn launched_monitor(
    status: ToolCallStatus,
    content: Option<&[ToolCallContent]>,
) -> Option<LaunchedTask> {
    if status != ToolCallStatus::Completed {
        return None;
    }
    content?.iter().find_map(|block| match block {
        ToolCallContent::Content(Content {
            content: ContentBlock::Text(text),
            ..
        }) => task_id_after_marker(&text.text, MONITOR_MARKER).map(|id| LaunchedTask {
            id,
            terminal_id: None,
        }),
        _ => None,
    })
}

fn task_id_after_marker(text: &str, marker: &str) -> Option<String> {
    let rest = text.trim_start().strip_prefix(marker)?;
    let id: String = rest
        .chars()
        .take_while(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '-')
        .collect();
    (!id.is_empty()).then_some(id)
}

fn exited_terminal(update: &SessionUpdate) -> Option<&str> {
    let SessionUpdate::ToolCallUpdate(update) = update else {
        return None;
    };
    update
        .meta
        .as_ref()?
        .get(TERMINAL_EXIT_META_KEY)?
        .get("terminal_id")?
        .as_str()
}

/// The task id of a call that stops a background command (KillShell,
/// TaskStop). claude-agent-acp announces the call with an empty input and
/// sends the input in a later update, so `stop_calls` carries what the
/// announcement said across to it.
fn stopped_background_task(
    stop_calls: &mut HashSet<String>,
    update: &SessionUpdate,
) -> Option<String> {
    let (call_id, title, status, raw_input) = match update {
        SessionUpdate::ToolCall(call) => (
            call.tool_call_id.0.to_string(),
            Some(call.title.as_str()),
            Some(call.status),
            call.raw_input.as_ref(),
        ),
        SessionUpdate::ToolCallUpdate(update) => (
            update.tool_call_id.0.to_string(),
            update.fields.title.as_deref(),
            update.fields.status,
            update.fields.raw_input.as_ref(),
        ),
        _ => return None,
    };
    if title.is_some_and(is_stop_title) {
        stop_calls.insert(call_id.clone());
    }
    let is_stop = if matches!(
        status,
        Some(ToolCallStatus::Completed | ToolCallStatus::Failed)
    ) {
        stop_calls.remove(&call_id)
    } else {
        stop_calls.contains(&call_id)
    };
    let input = raw_input?.as_object()?;
    if let Some(id) = input.get("shell_id").and_then(|v| v.as_str()) {
        return Some(id.to_string());
    }
    if is_stop {
        return input
            .get("task_id")
            .and_then(|v| v.as_str())
            .map(str::to_string);
    }
    None
}

fn is_stop_title(title: &str) -> bool {
    let title = title.to_lowercase();
    title.contains("stop") || title.contains("kill")
}

#[cfg(test)]
mod tests {
    use super::*;
    use agent_client_protocol::schema::v1::{
        ContentChunk, TextContent, ToolCall, ToolCallId, ToolCallUpdateFields, UsageUpdate,
    };

    fn text_chunk() -> SessionUpdate {
        SessionUpdate::AgentMessageChunk(ContentChunk::new(ContentBlock::Text(TextContent::new(
            "the build passed",
        ))))
    }

    fn terminal_meta(
        key: &str,
        value: serde_json::Value,
    ) -> serde_json::Map<String, serde_json::Value> {
        let mut meta = serde_json::Map::new();
        meta.insert(key.to_string(), value);
        meta
    }

    fn command_output(terminal_id: &str, data: &str) -> SessionUpdate {
        SessionUpdate::ToolCallUpdate(
            ToolCallUpdate::new(
                ToolCallId::new(terminal_id.to_string()),
                ToolCallUpdateFields::new(),
            )
            .meta(terminal_meta(
                "terminal_output",
                serde_json::json!({ "terminal_id": terminal_id, "data": data }),
            )),
        )
    }

    fn background_announcement(task_id: &str) -> SessionUpdate {
        command_output(
            task_id,
            &format!(
                "Command running in background with ID: {task_id}. Output is being written to: /tmp/tasks/{task_id}.output"
            ),
        )
    }

    fn command_result_without_exit(terminal_id: &str) -> SessionUpdate {
        SessionUpdate::ToolCallUpdate(ToolCallUpdate::new(
            ToolCallId::new(terminal_id.to_string()),
            ToolCallUpdateFields::new().status(ToolCallStatus::Completed),
        ))
    }

    fn command_result_with_exit(terminal_id: &str) -> SessionUpdate {
        SessionUpdate::ToolCallUpdate(
            ToolCallUpdate::new(
                ToolCallId::new(terminal_id.to_string()),
                ToolCallUpdateFields::new().status(ToolCallStatus::Completed),
            )
            .meta(terminal_meta(
                "terminal_exit",
                serde_json::json!({ "terminal_id": terminal_id, "exit_code": null, "signal": null }),
            )),
        )
    }

    fn terminal_exit(terminal_id: &str) -> SessionUpdate {
        SessionUpdate::ToolCallUpdate(
            ToolCallUpdate::new(
                ToolCallId::new(terminal_id.to_string()),
                ToolCallUpdateFields::new(),
            )
            .meta(terminal_meta(
                "terminal_exit",
                serde_json::json!({ "terminal_id": terminal_id, "exit_code": null, "signal": null }),
            )),
        )
    }

    /// A command still running when its Bash call returned.
    fn launch_command(activity: &AcpActivity, task_id: &str, at: i64) {
        activity.record_update(&background_announcement(task_id), at);
        activity.record_update(&command_result_without_exit(task_id), at);
    }

    fn monitor_result(task_id: &str) -> SessionUpdate {
        let text = format!(
            "Monitor started (task {task_id}, expires in 30m unless the source ends first; you get one notice at expiry — re-arm if you still need the watch)"
        );
        SessionUpdate::ToolCallUpdate(ToolCallUpdate::new(
            ToolCallId::new("toolu_monitor"),
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
    fn a_command_finishing_before_its_result_never_counts() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&background_announcement("fast"), 1_000);
        activity.record_update(&command_result_with_exit("fast"), 1_000);
        activity.turn_finished(None, 2_000);

        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn a_command_finishing_during_the_turn_is_gone_when_the_turn_ends() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        launch_command(&activity, "build", 1_000);
        assert_eq!(activity.snapshot().background_tasks_started_at, vec![1_000]);

        activity.record_update(&text_chunk(), 2_000);
        activity.record_update(&terminal_exit("build"), 3_000);
        activity.turn_finished(None, 4_000);

        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn a_command_runs_until_it_exits_after_the_turn() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        launch_command(&activity, "build", 1_000);
        activity.turn_finished(None, 2_000);
        assert_eq!(activity.snapshot().background_tasks_started_at, vec![1_000]);

        activity.record_update(&terminal_exit("build"), 600_000);
        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn an_unprompted_run_for_one_command_keeps_the_one_still_running() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        launch_command(&activity, "first", 1_000);
        launch_command(&activity, "second", 2_000);
        activity.turn_finished(None, 3_000);

        activity.record_update(&terminal_exit("first"), 100_000);
        activity.record_update(&text_chunk(), 101_000);
        activity.record_update(&unprompted_run_result(), 102_000);

        let snapshot = activity.snapshot();
        assert_eq!(snapshot.background_tasks_started_at, vec![2_000]);
        assert_eq!(snapshot.last_unprompted_update_at, None);
    }

    #[test]
    fn foreground_output_quoting_the_marker_does_not_count() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(
            &command_output(
                "grep",
                "main.log: Command running in background with ID: old123",
            ),
            1_000,
        );
        activity.record_update(&command_result_with_exit("grep"), 1_000);

        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn a_read_quoting_a_marker_does_not_count() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        let read = SessionUpdate::ToolCallUpdate(ToolCallUpdate::new(
            ToolCallId::new("toolu_read"),
            ToolCallUpdateFields::new()
                .status(ToolCallStatus::Completed)
                .content(vec![ToolCallContent::from(ContentBlock::Text(
                    TextContent::new("```\n1\tMonitor started (task old123, expires in 30m"),
                ))]),
        ));
        activity.record_update(&read, 1_000);

        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn an_unprompted_run_forgets_the_monitors_launched_before_it() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&monitor_result("first"), 1_000);
        activity.record_update(&monitor_result("second"), 2_000);
        activity.turn_finished(None, 3_000);
        assert_eq!(
            activity.snapshot().background_tasks_started_at,
            vec![1_000, 2_000]
        );

        activity.record_update(&text_chunk(), 100_000);
        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn a_monitor_an_unprompted_run_launches_outlives_the_run() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&monitor_result("first"), 1_000);
        activity.turn_finished(None, 2_000);

        activity.record_update(&text_chunk(), 100_000);
        activity.record_update(&monitor_result("second"), 101_000);
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
        activity.record_update(&monitor_result("a"), 1_000);
        activity.turn_finished(None, 2_000);

        activity.record_update(&text_chunk(), 100_000);
        activity.record_update(&monitor_result("b"), 110_000);
        activity.record_update(&unprompted_run_result(), 130_000);
        assert_eq!(
            activity.snapshot().background_tasks_started_at,
            vec![110_000]
        );

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
        activity.record_update(&monitor_result("watch"), 110_000);
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
        activity.record_update(&monitor_result("watch"), 101_000);
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
        launch_command(&activity, "build", 1_000);
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
        launch_command(&activity, "b1x9", 1_000);
        let kill = ToolCall::new(ToolCallId::new("toolu_kill"), "Kill Shell")
            .raw_input(serde_json::json!({ "shell_id": "b1x9" }));
        activity.record_update(&SessionUpdate::ToolCall(kill), 2_000);

        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn a_stop_whose_input_arrives_after_the_announcement_forgets_the_command() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        launch_command(&activity, "bz5p", 1_000);
        let announce = ToolCall::new(ToolCallId::new("toolu_stop"), "TaskStop")
            .raw_input(serde_json::json!({}));
        activity.record_update(&SessionUpdate::ToolCall(announce), 2_000);
        assert_eq!(activity.snapshot().background_tasks_started_at, vec![1_000]);

        let input = ToolCallUpdate::new(
            ToolCallId::new("toolu_stop"),
            ToolCallUpdateFields::new().raw_input(serde_json::json!({ "task_id": "bz5p" })),
        );
        activity.record_update(&SessionUpdate::ToolCallUpdate(input), 3_000);

        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn a_monitor_runs_until_the_agent_resumes_to_report_it() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&monitor_result("bhrfdag21"), 1_000);
        activity.turn_finished(None, 2_000);
        assert_eq!(activity.snapshot().background_tasks_started_at, vec![1_000]);

        activity.record_update(&text_chunk(), 600_000);
        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn stopping_a_monitor_forgets_it() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        activity.record_update(&monitor_result("bhrfdag21"), 1_000);
        let announce = ToolCall::new(ToolCallId::new("toolu_stop"), "TaskStop")
            .raw_input(serde_json::json!({}));
        activity.record_update(&SessionUpdate::ToolCall(announce), 2_000);
        let input = ToolCallUpdate::new(
            ToolCallId::new("toolu_stop"),
            ToolCallUpdateFields::new().raw_input(serde_json::json!({ "task_id": "bhrfdag21" })),
        );
        activity.record_update(&SessionUpdate::ToolCallUpdate(input), 3_000);

        assert!(activity.snapshot().background_tasks_started_at.is_empty());
    }

    #[test]
    fn reading_a_command_output_does_not_forget_it() {
        let activity = AcpActivity::default();
        activity.turn_started(0);
        launch_command(&activity, "b1x9", 1_000);
        let read = ToolCall::new(ToolCallId::new("toolu_read"), "TaskOutput")
            .raw_input(serde_json::json!({}));
        activity.record_update(&SessionUpdate::ToolCall(read), 2_000);
        let input = ToolCallUpdate::new(
            ToolCallId::new("toolu_read"),
            ToolCallUpdateFields::new().raw_input(serde_json::json!({ "task_id": "b1x9" })),
        );
        activity.record_update(&SessionUpdate::ToolCallUpdate(input), 3_000);

        assert_eq!(activity.snapshot().background_tasks_started_at, vec![1_000]);
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
        launch_command(&activity, "old", 1_000);
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
