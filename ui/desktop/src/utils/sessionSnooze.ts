/**
 * Sessions the user has snoozed: ones that look like they are waiting for the
 * user but are really waiting on something the user cannot hurry, such as a
 * reviewer or CI. A snoozed session sinks to the bottom of the switcher and
 * shows a muted marker in the sidebar until it has new activity or its wake
 * time passes, so the agent coming back with news wakes it early without the
 * user having to remember.
 *
 * Persists each snooze in a single localStorage JSON map, like the last-viewed
 * map in sessionUnread.
 */

import { parseTimestamp } from './sessionUnread';

const STORAGE_KEY = 'session_snoozed';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const WAKE_HOUR = 8;
const MONDAY = 1;

export interface SessionSnooze {
  /** When the user snoozed the session, in Unix ms. */
  at: number;
  /** When it wakes by itself, in Unix ms; absent to wait for new activity. */
  until?: number;
}

export type SnoozedMap = Record<string, SessionSnooze>;

export type SnoozePresetKey =
  | 'tenMinutes'
  | 'thirtyMinutes'
  | 'oneHour'
  | 'threeHours'
  | 'tomorrow'
  | 'monday';

export interface SnoozePreset {
  key: SnoozePresetKey;
  until: number;
}

function atWakeHour(date: Date, daysAhead: number): number {
  const wake = new Date(date);
  wake.setDate(wake.getDate() + daysAhead);
  wake.setHours(WAKE_HOUR, 0, 0, 0);
  return wake.getTime();
}

/** The wake times offered for a timed snooze, in local time. */
export function snoozePresets(now = Date.now()): SnoozePreset[] {
  const today = new Date(now);
  const daysToMonday = (MONDAY - today.getDay() + 7) % 7 || 7;
  return [
    { key: 'tenMinutes', until: now + 10 * MINUTE_MS },
    { key: 'thirtyMinutes', until: now + 30 * MINUTE_MS },
    { key: 'oneHour', until: now + HOUR_MS },
    { key: 'threeHours', until: now + 3 * HOUR_MS },
    { key: 'tomorrow', until: atWakeHour(today, 1) },
    { key: 'monday', until: atWakeHour(today, daysToMonday) },
  ];
}

/** Whether a session with this snooze is still snoozed. */
export function isSessionSnoozed(
  lastMessageAt: string | number | null | undefined,
  snooze: SessionSnooze | undefined,
  now = Date.now()
): boolean {
  if (snooze === undefined) return false;
  if (snooze.until !== undefined && now >= snooze.until) return false;
  const lastMessage = parseTimestamp(lastMessageAt);
  return lastMessage === null || lastMessage <= snooze.at;
}

function parseSnooze(value: unknown): SessionSnooze | undefined {
  // The first version stored only the snooze time.
  if (typeof value === 'number') return Number.isFinite(value) ? { at: value } : undefined;
  if (typeof value !== 'object' || value === null) return undefined;
  const { at, until } = value as Record<string, unknown>;
  if (typeof at !== 'number' || !Number.isFinite(at)) return undefined;
  return typeof until === 'number' && Number.isFinite(until) ? { at, until } : { at };
}

export function loadSnoozedMap(): SnoozedMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const map: SnoozedMap = {};
    for (const [id, value] of Object.entries(parsed)) {
      const snooze = parseSnooze(value);
      if (snooze) map[id] = snooze;
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

/**
 * Snooze a session until it has new activity or, given `until`, that time
 * passes; returns the updated map.
 */
export function snoozeSession(sessionId: string, until?: number, at = Date.now()): SnoozedMap {
  const map = loadSnoozedMap();
  map[sessionId] = until === undefined ? { at } : { at, until };
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
  sessions: readonly { id: string; lastMessageAt?: string | number | null }[],
  now = Date.now()
): SnoozedMap {
  const stored = loadSnoozedMap();
  const map: SnoozedMap = {};
  for (const { id, lastMessageAt } of sessions) {
    const snooze = stored[id];
    if (isSessionSnoozed(lastMessageAt, snooze, now)) map[id] = snooze;
  }
  saveSnoozedMap(map);
  return map;
}
