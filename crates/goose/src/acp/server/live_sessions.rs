use super::*;

impl AcpConnection {
    pub(super) async fn on_list_live_sessions(
        &self,
        _req: ListLiveSessionsRequest,
    ) -> Result<ListLiveSessionsResponse, agent_client_protocol::Error> {
        let running = self.active_run_session_ids();
        let live = self.services.providers.loaded();
        let mut sessions = Vec::with_capacity(live.len());
        for (session_id, provider) in live {
            let activity = provider.activity().unwrap_or_default();
            sessions.push(LiveSessionDto {
                running_turn: running.contains(&session_id),
                provider_id: Some(provider.get_name().to_string()),
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
