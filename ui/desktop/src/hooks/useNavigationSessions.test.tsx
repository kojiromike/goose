import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateMock = vi.hoisted(() => vi.fn());
const routerState = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: '/pair', search: routerState.searchParams.toString() }),
  useSearchParams: () => [routerState.searchParams, vi.fn()],
}));

vi.mock('../acp/sessions', () => ({
  acpGetSessionListItem: vi.fn(() => new Promise(() => {})),
  acpListRecentSessions: vi.fn().mockResolvedValue([]),
}));

vi.mock('../contexts/ChatContext', () => ({
  useChatContext: () => ({ chat: { sessionId: undefined } }),
}));

import { acpListRecentSessions } from '../acp/sessions';
import type { SessionListItem } from '../acp/sessions';
import { useNavigationSessions } from './useNavigationSessions';

const listRecentSessionsMock = vi.mocked(acpListRecentSessions);

const DAY_MS = 24 * 60 * 60 * 1000;

function sessionAgedDays(id: string, days: number): SessionListItem {
  const lastMessageAt = new Date(Date.now() - days * DAY_MS).toISOString();
  return {
    id,
    name: id,
    workingDir: '/tmp/project',
    updatedAt: lastMessageAt,
    messageCount: 2,
    lastMessageAt,
    createdAt: lastMessageAt,
  };
}

async function listedSessionIds(sessions: SessionListItem[]) {
  listRecentSessionsMock.mockResolvedValue(sessions);
  const { result } = renderHook(() => useNavigationSessions());
  await act(async () => {
    await result.current.fetchSessions();
  });
  return result.current.recentSessions.map((session) => session.id);
}

const injectedSessionId = 'session-1&shouldStartAgent=true';

function expectSingleSessionParameter(target: string) {
  const url = new URL(target, 'http://localhost');
  expect(url.searchParams.get('resumeSessionId')).toBe(injectedSessionId);
  expect(url.searchParams.get('shouldStartAgent')).toBeNull();
}

describe('useNavigationSessions', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    routerState.searchParams = new URLSearchParams();
    listRecentSessionsMock.mockReset();
    listRecentSessionsMock.mockResolvedValue([]);
  });

  it('keeps a selected session ID in one query parameter', () => {
    const { result } = renderHook(() => useNavigationSessions());

    act(() => result.current.handleSessionClick(injectedSessionId));

    expectSingleSessionParameter(navigateMock.mock.calls[0][0]);
  });

  it('keeps a retained session ID in one query parameter', () => {
    routerState.searchParams = new URLSearchParams({ resumeSessionId: injectedSessionId });
    const { result } = renderHook(() => useNavigationSessions());

    act(() => result.current.handleNavClick('/pair'));

    expectSingleSessionParameter(navigateMock.mock.calls[0][0]);
  });

  it('drops sessions that have been idle past the recent window', async () => {
    expect(
      await listedSessionIds([sessionAgedDays('fresh', 1), sessionAgedDays('stale', 30)])
    ).toEqual(['fresh']);
  });

  it('keeps the open session listed however old it is', async () => {
    routerState.searchParams = new URLSearchParams({ resumeSessionId: 'stale' });

    expect(
      await listedSessionIds([sessionAgedDays('fresh', 1), sessionAgedDays('stale', 30)])
    ).toEqual(['fresh', 'stale']);
  });

  it('keeps a session whose activity timestamp cannot be parsed', async () => {
    const undated = { ...sessionAgedDays('undated', 0), lastMessageAt: 'not a date' };
    undated.updatedAt = 'not a date';

    expect(await listedSessionIds([undated])).toEqual(['undated']);
  });
});
