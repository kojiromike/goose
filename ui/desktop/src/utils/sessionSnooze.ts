/**
 * Sessions the user has snoozed: ones that look like they are waiting for the
 * user but are really waiting on something the user cannot hurry, such as a
 * reviewer or CI. A snoozed session sinks to the bottom of the switcher and
 * shows a muted marker in the sidebar until it has new activity, so the
 * agent coming back with news wakes it without the user having to remember.
 *
 * Persists a per-session "snoozed at" timestamp (epoch milliseconds) in a
 * single localStorage JSON map, like the last-viewed map in sessionUnread.
 */

import { parseTimestamp } from './sessionUnread';

const STORAGE_KEY = 'session_snoozed';

export type SnoozedMap = Record<string, number>;

/** Whether a session snoozed at `snoozedAt` is still snoozed. */
export function isSessionSnoozed(
  lastMessageAt: string | number | null | undefined,
  snoozedAt: number | undefined
): boolean {
  if (snoozedAt === undefined) return false;
  const lastMessage = parseTimestamp(lastMessageAt);
  return lastMessage === null || lastMessage <= snoozedAt;
}

export function loadSnoozedMap(): SnoozedMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const map: SnoozedMap = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        map[id] = value;
      }
    }
    return map;
  } catch (error) {
    console.error('Failed to load snoozed sessions:', error);
    return {};
  }
}

function saveSnoozedMap(map: SnoozedMap): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Failed to save snoozed sessions:', error);
  }
}

/** Snooze a session as of now; returns the updated map. */
export function snoozeSession(sessionId: string, snoozedAt = Date.now()): SnoozedMap {
  const map = loadSnoozedMap();
  map[sessionId] = snoozedAt;
  saveSnoozedMap(map);
  return map;
}

/** Wake a snoozed session; returns the updated map. */
export function unsnoozeSession(sessionId: string): SnoozedMap {
  const map = loadSnoozedMap();
  delete map[sessionId];
  saveSnoozedMap(map);
  return map;
}

/**
 * Drop entries for sessions that left the list or have woken, so the stored
 * map stays bounded and a woken session does not fall back asleep. Returns
 * the updated map.
 */
export function pruneSnoozedMap(
  sessions: readonly { id: string; lastMessageAt?: string | number | null }[]
): SnoozedMap {
  const stored = loadSnoozedMap();
  const map: SnoozedMap = {};
  for (const { id, lastMessageAt } of sessions) {
    const snoozedAt = stored[id];
    if (isSessionSnoozed(lastMessageAt, snoozedAt)) map[id] = snoozedAt;
  }
  saveSnoozedMap(map);
  return map;
}
