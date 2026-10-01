use super::*;

impl GooseAcpAgent {
    pub(super) async fn on_list_live_sessions(
        &self,
        _req: ListLiveSessionsRequest,
    ) -> Result<ListLiveSessionsResponse, agent_client_protocol::Error> {
        let running: HashSet<String> = self
            .active_prompt_runs
            .lock()
            .await
            .keys()
            .cloned()
            .collect();

        let live = self.agent_manager.live_sessions().await;
        let mut sessions = Vec::with_capacity(live.len());
        for (session_id, agent) in live {
            // Best-effort: a session whose provider cannot be resolved is
            // still live, it just has nothing more to report.
            let provider = agent.provider().await.ok();
            let activity = provider
                .as_ref()
                .and_then(|provider| provider.activity())
                .unwrap_or_default();
            sessions.push(LiveSessionDto {
                running_turn: running.contains(&session_id),
                provider_id: provider.map(|provider| provider.get_name().to_string()),
                awaiting_input: activity.pending_permissions > 0,
                last_activity_at: activity.last_update_at,
                last_unprompted_activity_at: activity.last_unprompted_update_at,
                agent_exited: activity.exited,
                background_tasks_started_at: activity.background_tasks_started_at,
                last_turn_error: activity.last_turn_error,
                consecutive_failed_turns: activity.consecutive_failed_turns,
                session_id,
            });
        }
        Ok(ListLiveSessionsResponse { sessions })
    }
}
