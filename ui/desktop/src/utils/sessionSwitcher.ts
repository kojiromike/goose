import type { SessionListItem } from '../acp/sessions';
import type { SessionActivity } from './sessionActivity';

export interface SwitcherEntry {
  session: SessionListItem;
  activity: SessionActivity;
}

/**
 * How urgently a session wants the user, lowest first: an open permission
 * request blocks the agent outright, a stuck session needs a decision, and an
 * unread one has news. Everything else is ordered by when the user was last
 * in it.
 */
function attentionTier(activity: SessionActivity): number {
  if (activity.reason === 'approval') return 0;
  if (activity.state === 'stuck') return 1;
  if (activity.unread) return 2;
  return 3;
}

function activityAt(session: SessionListItem): number {
  const parsed = Date.parse(session.lastMessageAt ?? session.updatedAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Order sessions for the switcher so that its first row is the best place to
 * go next: the session that most needs the user, or else the one they were in
 * before this one, so the shortcut followed by Enter toggles between two
 * chats. `recentlyOpened` lists session ids most recent first.
 */
export function rankSwitcherEntries(
  entries: readonly SwitcherEntry[],
  activeSessionId: string | undefined,
  recentlyOpened: readonly string[]
): SwitcherEntry[] {
  const openedRank = new Map(recentlyOpened.map((id, index) => [id, index]));
  return entries
    .filter((entry) => entry.session.id !== activeSessionId)
    .map((entry) => ({ entry, tier: attentionTier(entry.activity) }))
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      if (a.tier === 3) {
        const aOpened = openedRank.get(a.entry.session.id) ?? Infinity;
        const bOpened = openedRank.get(b.entry.session.id) ?? Infinity;
        if (aOpened !== bOpened) return aOpened - bOpened;
      }
      return activityAt(b.entry.session) - activityAt(a.entry.session);
    })
    .map(({ entry }) => entry);
}

/** Keep entries whose name or directory contains every word of the query. */
export function filterSwitcherEntries(
  entries: readonly SwitcherEntry[],
  query: string
): SwitcherEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...entries];
  return entries.filter(({ session }) => {
    const haystack = `${session.name} ${session.workingDir ?? ''}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

/**
 * The session `step` places away from the active one in sidebar order,
 * wrapping at either end. With no active session in the list, stepping forward
 * starts at the top and stepping back starts at the bottom.
 */
export function adjacentSessionId(
  orderedIds: readonly string[],
  activeSessionId: string | undefined,
  step: 1 | -1
): string | undefined {
  if (orderedIds.length === 0) return undefined;
  const index = activeSessionId === undefined ? -1 : orderedIds.indexOf(activeSessionId);
  if (index === -1) return step === 1 ? orderedIds[0] : orderedIds[orderedIds.length - 1];
  return orderedIds[(index + step + orderedIds.length) % orderedIds.length];
}

/** Move `sessionId` to the front of a most-recent-first list, bounded in size. */
export function noteSessionOpened(
  recentlyOpened: readonly string[],
  sessionId: string,
  limit = 50
): string[] {
  return [sessionId, ...recentlyOpened.filter((id) => id !== sessionId)].slice(0, limit);
}
