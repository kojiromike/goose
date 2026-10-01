import { describe, expect, it, vi } from 'vitest';
import {
  BACKGROUND_TASK_MAX_AGE_MS,
  deriveSessionActivity,
  logStuckTransition,
  STALL_AFTER_MS,
  UNPROMPTED_WORK_WINDOW_MS,
  type LiveSessionSignals,
} from './sessionActivity';

const NOW = 1_800_000_000_000;

function activity(
  live: LiveSessionSignals | undefined,
  extra: Partial<Parameters<typeof deriveSessionActivity>[0]> = {}
) {
  return deriveSessionActivity({
    live,
    localStreamState: undefined,
    hasUnread: false,
    now: NOW,
    ...extra,
  });
}

describe('deriveSessionActivity', () => {
  it('is working while a turn makes progress', () => {
    expect(activity({ runningTurn: true, lastActivityAt: NOW - 30_000 })).toMatchObject({
      state: 'working',
      reason: 'turn',
    });
  });

  it('is stuck when a running turn has been silent past the stall threshold', () => {
    const lastActivityAt = NOW - STALL_AFTER_MS;
    expect(activity({ runningTurn: true, lastActivityAt })).toMatchObject({
      state: 'stuck',
      reason: 'stalled',
      since: lastActivityAt,
    });
  });

  it('waits on the user while a permission request is open, however long it has been', () => {
    expect(
      activity({ runningTurn: true, awaitingInput: true, lastActivityAt: NOW - 3 * STALL_AFTER_MS })
    ).toMatchObject({ state: 'waiting', reason: 'approval' });
  });

  it('treats an approval pending in this window as waiting too', () => {
    expect(activity(undefined, { localStreamState: 'waiting' })).toMatchObject({
      state: 'waiting',
      reason: 'approval',
    });
  });

  it('is stuck when the agent process has exited', () => {
    expect(activity({ runningTurn: true, agentExited: true })).toMatchObject({
      state: 'stuck',
      reason: 'exited',
    });
  });

  it('distinguishes one failed turn from a session failing every turn', () => {
    expect(
      activity({ runningTurn: false, consecutiveFailedTurns: 1, lastTurnError: 'overloaded' })
    ).toMatchObject({ state: 'stuck', reason: 'failed', error: 'overloaded' });
    expect(
      activity({
        runningTurn: false,
        consecutiveFailedTurns: 3,
        lastTurnError: 'API Error: 400 does not support this model',
      })
    ).toMatchObject({
      state: 'stuck',
      reason: 'failing',
      failedTurns: 3,
      error: 'API Error: 400 does not support this model',
    });
  });

  it('a new turn after failures is working, not stuck', () => {
    expect(activity({ runningTurn: true, consecutiveFailedTurns: 2 })).toMatchObject({
      state: 'working',
    });
  });

  it('is working in the background while a background command is believed to run', () => {
    expect(
      activity({ runningTurn: false, backgroundTasksStartedAt: [NOW - 5 * 60_000] })
    ).toMatchObject({ state: 'working', reason: 'background', backgroundTasks: 1 });
  });

  it('stops trusting a background command it never heard back about', () => {
    expect(
      activity({ runningTurn: false, backgroundTasksStartedAt: [NOW - BACKGROUND_TASK_MAX_AGE_MS] })
    ).toMatchObject({ state: 'waiting', reason: 'turnEnded' });
  });

  it('is working while the agent is producing output on its own', () => {
    expect(activity({ runningTurn: false, lastUnpromptedActivityAt: NOW - 5_000 })).toMatchObject({
      state: 'working',
      reason: 'background',
    });
    expect(
      activity({
        runningTurn: false,
        lastUnpromptedActivityAt: NOW - UNPROMPTED_WORK_WINDOW_MS,
      })
    ).toMatchObject({ state: 'waiting', reason: 'turnEnded' });
  });

  it('waits on the user once a loaded session’s turn ends, and flags it when unread', () => {
    expect(activity({ runningTurn: false })).toMatchObject({
      state: 'waiting',
      reason: 'turnEnded',
      unread: false,
    });
    expect(activity({ runningTurn: false }, { hasUnread: true })).toMatchObject({
      state: 'waiting',
      unread: true,
    });
  });

  it('shows nothing for an unloaded session with nothing new', () => {
    expect(activity(undefined)).toMatchObject({ state: 'idle', reason: 'none' });
    expect(activity(undefined, { hasUnread: true })).toMatchObject({ state: 'waiting' });
  });

  it('believes the server over this window about whether a turn is running', () => {
    // Nothing clears a window's "streaming" for a chat it is not showing, so a
    // session that finished long ago must not read as a turn that went silent.
    const finishedLongAgo = { runningTurn: false, lastActivityAt: NOW - 2 * STALL_AFTER_MS };
    expect(activity(finishedLongAgo, { localStreamState: 'streaming' })).toMatchObject({
      state: 'waiting',
      reason: 'turnEnded',
    });
    expect(
      activity(
        { runningTurn: false, lastActivityAt: NOW - 30_000 },
        { localStreamState: 'streaming' }
      )
    ).toMatchObject({ state: 'waiting', reason: 'turnEnded' });
  });

  it('settles to waiting once an unprompted run ends, however the session got there', () => {
    const afterUnpromptedRun = {
      runningTurn: false,
      lastActivityAt: NOW - 2 * STALL_AFTER_MS,
      lastUnpromptedActivityAt: null,
      backgroundTasksStartedAt: [],
    };
    for (const localStreamState of [undefined, 'idle', 'streaming'] as const) {
      expect(activity(afterUnpromptedRun, { localStreamState })).toMatchObject({
        state: 'waiting',
        reason: 'turnEnded',
      });
    }
  });

  it('falls back to what this window saw when the server has not reported yet', () => {
    expect(activity(undefined, { localStreamState: 'streaming' })).toMatchObject({
      state: 'working',
      reason: 'turn',
    });
    expect(activity(undefined, { localStreamState: 'error' })).toMatchObject({
      state: 'stuck',
      reason: 'failed',
    });
  });
});

describe('logStuckTransition', () => {
  it('logs a session once when it becomes stuck and once when it recovers', () => {
    const logInfo = vi.fn();
    window.electron.logInfo = logInfo;
    const live = { runningTurn: true, lastActivityAt: NOW - STALL_AFTER_MS };
    const stuck = activity(live);
    const signals = { live, localStreamState: 'idle' };

    logStuckTransition('session-1', stuck, signals);
    logStuckTransition('session-1', stuck, signals);
    expect(logInfo).toHaveBeenCalledTimes(1);
    expect(logInfo.mock.calls[0][0]).toContain('Session session-1 is stuck (stalled)');
    expect(logInfo.mock.calls[0][0]).toContain(`"lastActivityAt":${live.lastActivityAt}`);
    expect(logInfo.mock.calls[0][0]).toContain('"localStreamState":"idle"');

    const failed = activity({ runningTurn: false, consecutiveFailedTurns: 1 });
    logStuckTransition('session-1', failed, signals);
    expect(logInfo).toHaveBeenCalledTimes(2);
    expect(logInfo.mock.calls[1][0]).toContain('is stuck (failed)');

    logStuckTransition('session-1', activity({ runningTurn: false }), signals);
    logStuckTransition('session-1', activity({ runningTurn: false }), signals);
    expect(logInfo).toHaveBeenCalledTimes(3);
    expect(logInfo.mock.calls[2][0]).toContain(
      'no longer stuck (was failed): now waiting/turnEnded'
    );
  });

  it('says nothing about a session that was never stuck', () => {
    const logInfo = vi.fn();
    window.electron.logInfo = logInfo;
    logStuckTransition('session-2', activity({ runningTurn: true, lastActivityAt: NOW }), {});
    expect(logInfo).not.toHaveBeenCalled();
  });
});
