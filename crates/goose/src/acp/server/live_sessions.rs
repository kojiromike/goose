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
            sessions.push(LiveSessionDto {
                running_turn: running.contains(&session_id),
                // Best-effort: a session whose provider cannot be resolved is
                // still live, it just has no name to show.
                provider_id: agent
                    .provider()
                    .await
                    .ok()
                    .map(|provider| provider.get_name().to_string()),
                session_id,
            });
        }
        Ok(ListLiveSessionsResponse { sessions })
    }
}
