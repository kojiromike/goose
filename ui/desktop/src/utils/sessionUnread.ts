/**
 * Durable read/unread tracking for sessions in the navigation sidebar.
 *
 * Persists a per-session "last viewed at" timestamp (epoch milliseconds) in a
 * single localStorage JSON map so unread markers survive window reloads and
 * reflect activity from other windows. A session is unread when its
 * last_message_at is newer than the stored last-viewed timestamp.
 */

const STORAGE_KEY = 'session_last_viewed';

export type LastViewedMap = Record<string, number>;

/**
 * Parse a backend timestamp (ISO string, or epoch seconds/milliseconds as a
 * number or numeric string) into epoch milliseconds. Returns null when the
 * value is missing or unparseable.
 */
export function parseTimestamp(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return normalizeEpoch(value);
  const trimmed = value.trim();
  if (trimmed === '') return null;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return normalizeEpoch(Number(trimmed));
  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeEpoch(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  // Epoch seconds are ~1e9 today; epoch milliseconds are ~1e12.
  return value < 1e12 ? value * 1000 : value;
}

/**
 * Whether a session should show an unread marker. A session with no stored
 * last-viewed timestamp is treated as read (it gets seeded on first sight),
 * so historical sessions do not all light up on first launch.
 */
export function isSessionUnread(
  lastMessageAt: string | number | null | undefined,
  lastViewedAt: number | undefined
): boolean {
  if (lastViewedAt === undefined) return false;
  const lastMessage = parseTimestamp(lastMessageAt);
  if (lastMessage === null) return false;
  return lastMessage > lastViewedAt;
}

export function loadLastViewedMap(): LastViewedMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const map: LastViewedMap = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        map[id] = value;
      }
    }
    return map;
  } catch (error) {
    console.error('Failed to load session last-viewed map:', error);
    return {};
  }
}

function saveLastViewedMap(map: LastViewedMap): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Failed to save session last-viewed map:', error);
  }
}

/** Record that a session was viewed now; returns the updated map. */
export function markSessionViewed(sessionId: string, viewedAt = Date.now()): LastViewedMap {
  const map = loadLastViewedMap();
  map[sessionId] = viewedAt;
  saveLastViewedMap(map);
  return map;
}

/**
 * Reconcile the stored map with the current session list: seed sessions seen
 * for the first time as viewed-now (so they start out read), and prune
 * entries for sessions no longer listed to bound growth. Returns the updated
 * map.
 */
export function syncLastViewedMap(sessionIds: readonly string[], now = Date.now()): LastViewedMap {
  const stored = loadLastViewedMap();
  const map: LastViewedMap = {};
  for (const id of sessionIds) {
    map[id] = stored[id] ?? now;
  }
  saveLastViewedMap(map);
  return map;
}
