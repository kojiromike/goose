import { beforeEach, describe, expect, it } from 'vitest';
import {
  isSessionSnoozed,
  loadSnoozedMap,
  pruneSnoozedMap,
  snoozeSession,
  unsnoozeSession,
} from './sessionSnooze';

const at = (minute: number) => Date.UTC(2026, 10, 5, 12, minute);
const iso = (minute: number) => new Date(at(minute)).toISOString();

describe('isSessionSnoozed', () => {
  it('is false for a session that was never snoozed', () => {
    expect(isSessionSnoozed(iso(0), undefined)).toBe(false);
  });

  it('stays snoozed until a message arrives after the snooze', () => {
    expect(isSessionSnoozed(iso(0), at(5))).toBe(true);
    expect(isSessionSnoozed(iso(5), at(5))).toBe(true);
    expect(isSessionSnoozed(iso(6), at(5))).toBe(false);
  });

  it('stays snoozed when the session has no messages yet', () => {
    expect(isSessionSnoozed(undefined, at(5))).toBe(true);
  });
});

describe('snooze storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('snoozes and wakes sessions', () => {
    snoozeSession('a', at(1));
    snoozeSession('b', at(2));
    expect(unsnoozeSession('a')).toEqual({ b: at(2) });
    expect(loadSnoozedMap()).toEqual({ b: at(2) });
  });

  it('ignores corrupt storage', () => {
    window.localStorage.setItem('session_snoozed', '[1, 2]');
    expect(loadSnoozedMap()).toEqual({});
  });

  it('prunes sessions that left the list or woke up', () => {
    snoozeSession('asleep', at(5));
    snoozeSession('woke', at(5));
    snoozeSession('gone', at(5));
    const map = pruneSnoozedMap([
      { id: 'asleep', lastMessageAt: iso(4) },
      { id: 'woke', lastMessageAt: iso(6) },
      { id: 'never', lastMessageAt: iso(6) },
    ]);
    expect(map).toEqual({ asleep: at(5) });
    expect(loadSnoozedMap()).toEqual({ asleep: at(5) });
  });
});
