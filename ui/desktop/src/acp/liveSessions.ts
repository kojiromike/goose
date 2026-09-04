import type { LiveSessionDto } from '@aaif/goose-acp-client';
import { getAcpClient } from './acpConnection';

export type LiveSession = LiveSessionDto;

// Sessions the server is holding open, keyed by id.
export async function acpListLiveSessions(): Promise<Map<string, LiveSession>> {
  const client = await getAcpClient();
  const { sessions } = await client.goose.sessionsLive_unstable({});
  return new Map(sessions.map((session) => [session.sessionId, session]));
}
