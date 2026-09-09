import { beforeEach, describe, expect, it } from 'vitest';
import {
  isSessionUnread,
  loadLastViewedMap,
  markSessionViewed,
  parseTimestamp,
  syncLastViewedMap,
} from './sessionUnread';

const STORAGE_KEY = 'session_last_viewed';

describe('parseTimestamp', () => {
  it('parses ISO strings to epoch milliseconds', () => {
    expect(parseTimestamp('2026-01-01T00:00:00.000Z')).toBe(Date.UTC(2026, 0, 1));
    expect(parseTimestamp('2026-01-01T00:00:00Z')).toBe(Date.UTC(2026, 0, 1));
  });

  it('parses epoch milliseconds, as number or numeric string', () => {
    const ms = Date.UTC(2026, 0, 1);
    expect(parseTimestamp(ms)).toBe(ms);
    expect(parseTimestamp(String(ms))).toBe(ms);
  });

  it('treats small epoch values as seconds', () => {
    const ms = Date.UTC(2026, 0, 1);
    expect(parseTimestamp(ms / 1000)).toBe(ms);
    expect(parseTimestamp(String(ms / 1000))).toBe(ms);
  });

  it('returns null for missing or unparseable values', () => {
    expect(parseTimestamp(undefined)).toBeNull();
    expect(parseTimestamp(null)).toBeNull();
    expect(parseTimestamp('')).toBeNull();
    expect(parseTimestamp('  ')).toBeNull();
    expect(parseTimestamp('not a date')).toBeNull();
    expect(parseTimestamp(NaN)).toBeNull();
    expect(parseTimestamp(0)).toBeNull();
  });
});

describe('isSessionUnread', () => {
  const viewedAt = Date.UTC(2026, 0, 2);

  it('is unread when the last message is newer than the last view', () => {
    expect(isSessionUnread('2026-01-03T00:00:00Z', viewedAt)).toBe(true);
  });

  it('is read when the last message is older than or equal to the last view', () => {
    expect(isSessionUnread('2026-01-01T00:00:00Z', viewedAt)).toBe(false);
    expect(isSessionUnread('2026-01-02T00:00:00Z', viewedAt)).toBe(false);
  });

  it('treats a session with no stored timestamp as read', () => {
    expect(isSessionUnread('2026-01-03T00:00:00Z', undefined)).toBe(false);
  });

  it('treats a session with no last message as read', () => {
    expect(isSessionUnread(undefined, viewedAt)).toBe(false);
    expect(isSessionUnread('garbage', viewedAt)).toBe(false);
  });
});

describe('localStorage-backed map', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty map when nothing is stored', () => {
    expect(loadLastViewedMap()).toEqual({});
  });

  it('returns an empty map for corrupt or wrongly-shaped data', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json');
    expect(loadLastViewedMap()).toEqual({});
    window.localStorage.setItem(STORAGE_KEY, '[1,2]');
    expect(loadLastViewedMap()).toEqual({});
  });

  it('drops non-numeric entries when loading', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 1, b: 'x', c: null }));
    expect(loadLastViewedMap()).toEqual({ a: 1 });
  });

  it('markSessionViewed persists across loads', () => {
    markSessionViewed('s1', 123);
    expect(loadLastViewedMap()).toEqual({ s1: 123 });
    markSessionViewed('s1', 456);
    markSessionViewed('s2', 789);
    expect(loadLastViewedMap()).toEqual({ s1: 456, s2: 789 });
  });

  it('syncLastViewedMap seeds first-seen sessions as viewed now', () => {
    const map = syncLastViewedMap(['s1', 's2'], 1000);
    expect(map).toEqual({ s1: 1000, s2: 1000 });
    expect(loadLastViewedMap()).toEqual({ s1: 1000, s2: 1000 });
  });

  it('syncLastViewedMap keeps existing timestamps and prunes departed sessions', () => {
    markSessionViewed('s1', 111);
    markSessionViewed('gone', 222);
    const map = syncLastViewedMap(['s1', 's3'], 1000);
    expect(map).toEqual({ s1: 111, s3: 1000 });
    expect(loadLastViewedMap()).toEqual({ s1: 111, s3: 1000 });
  });
});
