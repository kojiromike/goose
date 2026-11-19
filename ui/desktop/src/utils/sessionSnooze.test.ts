import { beforeEach, describe, expect, it } from 'vitest';
import {
  isSessionSnoozed,
  loadSnoozedMap,
  pruneSnoozedMap,
  snoozePresets,
  snoozeSession,
  suggestedWakeTime,
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

  it('offers ten minutes, thirty minutes, an hour, three hours, tomorrow morning and Monday morning', () => {
    // Thursday afternoon, local time.
    const now = new Date(2026, 10, 5, 14, 6);
    const presets = until(now);
    expect(presets.tenMinutes).toEqual(new Date(2026, 10, 5, 14, 16));
    expect(presets.thirtyMinutes).toEqual(new Date(2026, 10, 5, 14, 36));
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

describe('suggestedWakeTime', () => {
  const local = (day: number, hour: number, minute = 0) =>
    new Date(2026, 10, day, hour, minute).getTime();
  const written = local(19, 15, 42);
  const wake = (line: string, now = written) => suggestedWakeTime(line, written, now);

  it('reads the check-back time from a status line', () => {
    expect(wake('STATUS: waiting-external: CI is running; check back at 16:15')).toBe(
      local(19, 16, 15)
    );
    expect(wake('STATUS: waiting-external: check back at 4:15 pm; the run took 30 min')).toBe(
      local(19, 16, 15)
    );
    expect(wake('STATUS: needs-michael: review it; check back at 5pm for CodeRabbit')).toBe(
      local(19, 17)
    );
  });

  it('takes the first reading of a time without am or pm that is still ahead', () => {
    expect(wake('STATUS: waiting-external: check back at 4:15')).toBe(local(19, 16, 15));
    expect(wake('STATUS: waiting-external: check back at 3:30')).toBe(local(20, 3, 30));
  });

  it('rolls a time already past when written into the next day, and honors tomorrow', () => {
    expect(wake('STATUS: waiting-external: check back at 09:00')).toBe(local(20, 9));
    expect(wake('STATUS: waiting-external: check back tomorrow at 17:00')).toBe(local(20, 17));
    expect(
      suggestedWakeTime('STATUS: x: check back at 09:00 tomorrow', local(19, 1), local(19, 1))
    ).toBe(local(20, 9));
  });

  it('prefers the time after "check back" over earlier ones', () => {
    expect(
      wake('STATUS: waiting-external: the 15:00 export failed; check back at 18:30 after rerun')
    ).toBe(local(19, 18, 30));
  });

  it('ignores numbers that are not clock times', () => {
    expect(wake('STATUS: done: merged https://github.com/o/r/pull/854')).toBeUndefined();
    expect(wake('STATUS: blocked: 3 tests fail on 2026-11-19')).toBeUndefined();
    expect(wake('STATUS: waiting-external: CI, about 20 minutes')).toBeUndefined();
    expect(wake('STATUS: waiting-external: check back at 11:45 and retry')).toBe(local(19, 23, 45));
  });

  it('offers nothing once the time has passed or without a line', () => {
    expect(
      wake('STATUS: waiting-external: check back at 16:15', local(19, 16, 15))
    ).toBeUndefined();
    expect(suggestedWakeTime(undefined, written, written)).toBeUndefined();
  });
});
