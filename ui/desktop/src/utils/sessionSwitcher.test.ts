import { describe, expect, it } from 'vitest';
import type { SessionListItem } from '../acp/sessions';
import type { SessionActivity } from './sessionActivity';
import {
  adjacentSessionId,
  filterSwitcherEntries,
  noteSessionOpened,
  rankSwitcherEntries,
  type SwitcherEntry,
} from './sessionSwitcher';

function entry(
  id: string,
  minutesAgo: number,
  activity: Partial<SessionActivity> = {},
  session: Partial<SessionListItem> = {}
): SwitcherEntry {
  const at = new Date(Date.UTC(2026, 9, 20, 12) - minutesAgo * 60_000).toISOString();
  return {
    session: {
      id,
      name: `chat ${id}`,
      workingDir: '/work',
      updatedAt: at,
      lastMessageAt: at,
      messageCount: 1,
      ...session,
    } as SessionListItem,
    activity: { state: 'idle', reason: 'none', unread: false, ...activity },
  };
}

const ids = (entries: SwitcherEntry[]) => entries.map(({ session }) => session.id);

describe('rankSwitcherEntries', () => {
  it('lists approvals, then stuck, then unread, ahead of everything else', () => {
    const entries = [
      entry('idle', 0),
      entry('unread', 5, { state: 'waiting', reason: 'turnEnded', unread: true }),
      entry('stuck', 10, { state: 'stuck', reason: 'failed' }),
      entry('approval', 20, { state: 'waiting', reason: 'approval' }),
      entry('working', 1, { state: 'working', reason: 'turn' }),
    ];
    expect(ids(rankSwitcherEntries(entries, undefined, []))).toEqual([
      'approval',
      'stuck',
      'unread',
      'idle',
      'working',
    ]);
  });

  it('orders sessions within an attention tier by latest activity', () => {
    const entries = [entry('older', 30, { unread: true }), entry('newer', 3, { unread: true })];
    expect(ids(rankSwitcherEntries(entries, undefined, []))).toEqual(['newer', 'older']);
  });

  it('puts the chat opened before this one first when nothing needs attention', () => {
    const entries = [entry('a', 0), entry('b', 10), entry('c', 20)];
    expect(ids(rankSwitcherEntries(entries, 'a', ['a', 'c', 'b']))).toEqual(['c', 'b']);
  });

  it('leaves out the active session', () => {
    const entries = [entry('a', 0, { unread: true }), entry('b', 10)];
    expect(ids(rankSwitcherEntries(entries, 'a', []))).toEqual(['b']);
  });
});

describe('filterSwitcherEntries', () => {
  const entries = [
    entry('a', 0, {}, { name: 'Fix login bug', workingDir: '/dev/oce/portal' }),
    entry('b', 0, {}, { name: 'Release notes', workingDir: '/dev/goose' }),
  ];

  it('keeps every entry for an empty query', () => {
    expect(ids(filterSwitcherEntries(entries, '  '))).toEqual(['a', 'b']);
  });

  it('requires every word, matching name or directory case-insensitively', () => {
    expect(ids(filterSwitcherEntries(entries, 'LOGIN portal'))).toEqual(['a']);
    expect(ids(filterSwitcherEntries(entries, 'goose'))).toEqual(['b']);
    expect(ids(filterSwitcherEntries(entries, 'login goose'))).toEqual([]);
  });
});

describe('adjacentSessionId', () => {
  const order = ['a', 'b', 'c'];

  it('steps forward and back, wrapping at the ends', () => {
    expect(adjacentSessionId(order, 'a', 1)).toBe('b');
    expect(adjacentSessionId(order, 'c', 1)).toBe('a');
    expect(adjacentSessionId(order, 'a', -1)).toBe('c');
  });

  it('starts from the matching end when no listed session is active', () => {
    expect(adjacentSessionId(order, undefined, 1)).toBe('a');
    expect(adjacentSessionId(order, 'gone', -1)).toBe('c');
  });

  it('returns nothing for an empty sidebar', () => {
    expect(adjacentSessionId([], 'a', 1)).toBeUndefined();
  });
});

describe('noteSessionOpened', () => {
  it('moves the session to the front without duplicating it', () => {
    expect(noteSessionOpened(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });

  it('bounds the list', () => {
    expect(noteSessionOpened(['a', 'b'], 'c', 2)).toEqual(['c', 'a']);
  });
});
