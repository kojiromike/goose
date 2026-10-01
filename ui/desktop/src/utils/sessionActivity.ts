/**
 * What a session in the sidebar is doing, from the user's point of view:
 *
 * - `working`: the agent is making progress and needs nothing from the user —
 *   answering a prompt, or running background work that will bring it back.
 * - `waiting`: the agent needs the user — a permission request is open, or its
 *   turn ended and it is the user's move.
 * - `stuck`: the session claims to be running but is not making progress, its
 *   agent process is gone, or its turns are failing.
 * - `idle`: nothing to report (a session with no agent loaded and nothing new).
 */
export type SessionActivityState = 'working' | 'waiting' | 'stuck' | 'idle';

export type SessionActivityReason =
  | 'turn'
  | 'background'
  | 'approval'
  | 'turnEnded'
  | 'stalled'
  | 'exited'
  | 'failed'
  | 'failing'
  | 'none';

export interface SessionActivity {
  state: SessionActivityState;
  reason: SessionActivityReason;
  /** When the condition began, in Unix ms, where that is known. */
  since?: number;
  /** The latest turn's error, for `failed` and `failing`. */
  error?: string;
  /** Turns failed in a row, for `failing`. */
  failedTurns?: number;
  /** Background commands believed to be running, for `background`. */
  backgroundTasks?: number;
  /** New activity the user has not looked at yet. */
  unread: boolean;
}

/**
 * The server's report for a session it is holding open. Every field past
 * `runningTurn` is optional so an older server still yields a sensible state.
 */
export interface LiveSessionSignals {
  runningTurn: boolean;
  awaitingInput?: boolean;
  lastActivityAt?: number | null;
  lastUnpromptedActivityAt?: number | null;
  agentExited?: boolean;
  backgroundTasksStartedAt?: number[];
  lastTurnError?: string | null;
  consecutiveFailedTurns?: number;
}

/** What the window showing the chat, if any, last reported for it. */
export type LocalStreamState = 'idle' | 'loading' | 'streaming' | 'waiting' | 'error';

export interface SessionActivityInput {
  live: LiveSessionSignals | undefined;
  localStreamState: LocalStreamState | undefined;
  hasUnread: boolean;
  now: number;
}

/**
 * A running turn with no update from its agent for this long is treated as
 * stuck. claude-agent-acp reports streaming text and thinking, every tool call
 * a subagent makes, and periodic progress beats for running tools, so a
 * healthy turn is rarely silent for more than a minute or two; ten minutes
 * leaves room for a long silent think or API retry backoff.
 */
export const STALL_AFTER_MS = 10 * 60_000;

/**
 * How long a background command is assumed to still be running. Nothing tells
 * goose when one finishes except the agent resuming to report on it, so this
 * bounds a missed report instead of spinning forever.
 */
export const BACKGROUND_TASK_MAX_AGE_MS = 30 * 60_000;

/** An unprompted run with an update this recent is taken to be still going. */
export const UNPROMPTED_WORK_WINDOW_MS = 60_000;

export function deriveSessionActivity({
  live,
  localStreamState,
  hasUnread,
  now,
}: SessionActivityInput): SessionActivity {
  const unread = hasUnread;

  if (live?.awaitingInput || localStreamState === 'waiting') {
    return { state: 'waiting', reason: 'approval', unread };
  }

  if (live?.agentExited) {
    return {
      state: 'stuck',
      reason: 'exited',
      unread,
      ...(live.lastActivityAt ? { since: live.lastActivityAt } : {}),
    };
  }

  // The server knows whether a turn is running in a session it holds. What
  // this window last saw is only a stand-in until the server reports: nothing
  // clears it for a chat the window is not showing, so trusting it turned
  // sessions that had finished into "running, and silent for 10 minutes".
  const running = live ? live.runningTurn : localStreamState === 'streaming';
  if (running) {
    const lastActivityAt = live?.lastActivityAt;
    if (lastActivityAt && now - lastActivityAt >= STALL_AFTER_MS) {
      return { state: 'stuck', reason: 'stalled', since: lastActivityAt, unread };
    }
    return { state: 'working', reason: 'turn', unread };
  }

  const failedTurns = live?.consecutiveFailedTurns ?? 0;
  if (failedTurns > 0 || localStreamState === 'error') {
    const error = live?.lastTurnError ?? undefined;
    return {
      state: 'stuck',
      reason: failedTurns > 1 ? 'failing' : 'failed',
      unread,
      ...(error ? { error } : {}),
      ...(failedTurns > 1 ? { failedTurns } : {}),
    };
  }

  const backgroundStarts = (live?.backgroundTasksStartedAt ?? []).filter(
    (startedAt) => now - startedAt < BACKGROUND_TASK_MAX_AGE_MS
  );
  const unpromptedAt = live?.lastUnpromptedActivityAt;
  const workingUnprompted = !!unpromptedAt && now - unpromptedAt < UNPROMPTED_WORK_WINDOW_MS;
  if (backgroundStarts.length > 0 || workingUnprompted) {
    return {
      state: 'working',
      reason: 'background',
      unread,
      ...(backgroundStarts.length > 0
        ? { backgroundTasks: backgroundStarts.length, since: Math.min(...backgroundStarts) }
        : {}),
    };
  }

  if (live || unread) {
    return { state: 'waiting', reason: 'turnEnded', unread };
  }

  return { state: 'idle', reason: 'none', unread };
}

const MAX_LOGGED_SIGNALS_LENGTH = 4000;

const loggedStuckReasons = new Map<string, SessionActivityReason>();

/**
 * Record in the app log each time a session becomes stuck, with the signals
 * that decided it, and when it recovers. A stuck marker says only that
 * something is wrong; its tooltip is gone once the pointer moves, and the
 * server reports a session's signals only to the connection holding it, so
 * without this a false alarm leaves nothing to examine afterwards.
 */
export function logStuckTransition(
  sessionId: string,
  activity: SessionActivity,
  signals: Record<string, unknown>
): void {
  const previous = loggedStuckReasons.get(sessionId);
  if (activity.state !== 'stuck') {
    if (previous === undefined) return;
    loggedStuckReasons.delete(sessionId);
    window.electron.logInfo(
      `Session ${sessionId} is no longer stuck (was ${previous}): now ${activity.state}/${activity.reason}`
    );
    return;
  }
  if (previous === activity.reason) return;
  loggedStuckReasons.set(sessionId, activity.reason);
  // The main process drops messages over 10 KB, and a turn error can be long.
  const detail = JSON.stringify(signals).slice(0, MAX_LOGGED_SIGNALS_LENGTH);
  window.electron.logInfo(`Session ${sessionId} is stuck (${activity.reason}): ${detail}`);
}
