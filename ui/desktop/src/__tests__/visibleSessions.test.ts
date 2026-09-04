import { describe, expect, it } from 'vitest';
import { mergeVisibleSessions } from '../hooks/useNavigationSessions';
import type { LiveSession } from '../acp/liveSessions';
import type { SessionListItem } from '../acp/sessions';

function session(id: string, updatedAt: string): SessionListItem {
  return {
    id,
    name: id,
    workingDir: '/tmp',
    updatedAt,
    messageCount: 1,
    createdAt: updatedAt,
  };
}

function live(...ids: string[]): Map<string, LiveSession> {
  return new Map(ids.map((id) => [id, { sessionId: id, runningTurn: false }]));
}

const RECENT = [session('new', '2026-09-04T12:00:00Z'), session('newer', '2026-09-04T13:00:00Z')];
const OLD = session('old', '2026-08-01T09:00:00Z');

describe('mergeVisibleSessions', () => {
  it('orders the recency window by most recent first', () => {
    const merged = mergeVisibleSessions(RECENT, [], new Map());

    expect(merged.map((s) => s.id)).toEqual(['newer', 'new']);
  });

  it('shows a live session that has aged out of the recency window', () => {
    const merged = mergeVisibleSessions(RECENT, [OLD], live('old'));

    expect(merged.map((s) => s.id)).toEqual(['newer', 'new', 'old']);
  });

  it('drops a pinned session once it is no longer live', () => {
    const merged = mergeVisibleSessions(RECENT, [OLD], new Map());

    expect(merged.map((s) => s.id)).toEqual(['newer', 'new']);
  });

  it('does not duplicate a live session that is also recent', () => {
    const recent = [...RECENT, OLD];

    const merged = mergeVisibleSessions(recent, [OLD], live('old'));

    expect(merged.filter((s) => s.id === 'old')).toHaveLength(1);
  });

  it('keeps a live session in recency order rather than at the top', () => {
    const middle = session('middle', '2026-09-04T12:30:00Z');

    const merged = mergeVisibleSessions(RECENT, [middle], live('middle'));

    expect(merged.map((s) => s.id)).toEqual(['newer', 'middle', 'new']);
  });

  it('prefers the last message time over the session update time', () => {
    const stale = { ...session('stale', '2026-09-04T13:30:00Z'), lastMessageAt: '2026-01-01T00:00:00Z' };

    const merged = mergeVisibleSessions([...RECENT, stale], [], new Map());

    expect(merged.map((s) => s.id)).toEqual(['newer', 'new', 'stale']);
  });
});
