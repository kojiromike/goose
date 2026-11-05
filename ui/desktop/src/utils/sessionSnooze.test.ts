import { beforeEach, describe, expect, it } from 'vitest';
import {
  isSessionSnoozed,
  loadSnoozedMap,
  pruneSnoozedMap,
  snoozePresets,
  snoozeSession,
  unsnoozeSession,
} from './sessionSnooze';

const at = (minute: number) => Date.UTC(2026, 10, 5, 12, minute);
const iso = (minute: number) => new Date(at(minute)).toISOString();

describe('isSessionSnoozed', () => {
  it('is false for a session that was never snoozed', () => {
    expect(isSessionSnoozed(iso(0), undefined, at(10))).toBe(false);
  });

  it('stays snoozed until a message arrives after the snooze', () => {
    expect(isSessionSnoozed(iso(0), { at: at(5) }, at(10))).toBe(true);
    expect(isSessionSnoozed(iso(5), { at: at(5) }, at(10))).toBe(true);
    expect(isSessionSnoozed(iso(6), { at: at(5) }, at(10))).toBe(false);
  });

  it('stays snoozed when the session has no messages yet', () => {
    expect(isSessionSnoozed(undefined, { at: at(5) }, at(10))).toBe(true);
  });

  it('wakes a timed snooze when its time comes, or earlier on new activity', () => {
    const snooze = { at: at(5), until: at(30) };
    expect(isSessionSnoozed(iso(0), snooze, at(29))).toBe(true);
    expect(isSessionSnoozed(iso(0), snooze, at(30))).toBe(false);
    expect(isSessionSnoozed(iso(6), snooze, at(10))).toBe(false);
  });
});

describe('snoozePresets', () => {
  const until = (now: Date) =>
    Object.fromEntries(
      snoozePresets(now.getTime()).map(({ key, until }) => [key, new Date(until)])
    );

  it('offers an hour, three hours, tomorrow morning and Monday morning', () => {
    // Thursday afternoon, local time.
    const now = new Date(2026, 10, 5, 14, 6);
    const presets = until(now);
    expect(presets.oneHour).toEqual(new Date(2026, 10, 5, 15, 6));
    expect(presets.threeHours).toEqual(new Date(2026, 10, 5, 17, 6));
    expect(presets.tomorrow).toEqual(new Date(2026, 10, 6, 8, 0));
    expect(presets.monday).toEqual(new Date(2026, 10, 9, 8, 0));
  });

  it('means next Monday when it is already Monday', () => {
    expect(until(new Date(2026, 10, 9, 7, 0)).monday).toEqual(new Date(2026, 10, 16, 8, 0));
  });
});

describe('snooze storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('snoozes and wakes sessions', () => {
    snoozeSession('a', undefined, at(1));
    snoozeSession('b', at(60), at(2));
    expect(unsnoozeSession('a')).toEqual({ b: { at: at(2), until: at(60) } });
    expect(loadSnoozedMap()).toEqual({ b: { at: at(2), until: at(60) } });
  });

  it('reads snoozes stored as a bare timestamp', () => {
    window.localStorage.setItem('session_snoozed', JSON.stringify({ a: at(1) }));
    expect(loadSnoozedMap()).toEqual({ a: { at: at(1) } });
  });

  it('ignores corrupt storage', () => {
    window.localStorage.setItem('session_snoozed', '[1, 2]');
    expect(loadSnoozedMap()).toEqual({});
    window.localStorage.setItem('session_snoozed', JSON.stringify({ a: 'soon', b: { until: 1 } }));
    expect(loadSnoozedMap()).toEqual({});
  });

  it('prunes sessions that left the list, woke up, or ran out', () => {
    snoozeSession('asleep', undefined, at(5));
    snoozeSession('woke', undefined, at(5));
    snoozeSession('due', at(8), at(5));
    snoozeSession('gone', undefined, at(5));
    const map = pruneSnoozedMap(
      [
        { id: 'asleep', lastMessageAt: iso(4) },
        { id: 'woke', lastMessageAt: iso(6) },
        { id: 'due', lastMessageAt: iso(4) },
        { id: 'never', lastMessageAt: iso(6) },
      ],
      at(10)
    );
    expect(map).toEqual({ asleep: { at: at(5) } });
    expect(loadSnoozedMap()).toEqual({ asleep: { at: at(5) } });
  });
});
