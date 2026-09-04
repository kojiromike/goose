import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router';
import { useChatContext } from '../contexts/ChatContext';
import { getSessionDisplayName } from '../sessions';
import { AppEvents } from '../constants/events';
import type { Session } from '../types/session';
import {
  acpGetSessionListItem,
  acpListRecentSessions,
  type SessionListItem,
} from '../acp/sessions';
import { acpListLiveSessions, type LiveSession } from '../acp/liveSessions';
import { groupSessionsByProject } from '../utils/projectSessions';

const MAX_RECENT_SESSIONS = 25;

/** Recency key, matching the order the server lists sessions in. */
function sessionOrder(session: SessionListItem): number {
  return Date.parse(session.lastMessageAt ?? session.updatedAt) || 0;
}

/**
 * The sessions to show: the recency window plus any session the server is
 * still holding open. A live session that has aged out of the window keeps its
 * place in recency order rather than jumping the list — it just stops being
 * invisible, which is the only way to see or end the agent it is holding.
 */
export function mergeVisibleSessions(
  recent: SessionListItem[],
  pinned: SessionListItem[],
  live: Map<string, LiveSession>
): SessionListItem[] {
  const recentIds = new Set(recent.map((session) => session.id));
  const stillLive = pinned.filter(
    (session) => live.has(session.id) && !recentIds.has(session.id)
  );
  return [...recent, ...stillLive].sort((a, b) => sessionOrder(b) - sessionOrder(a));
}

function pairSessionPath(sessionId: string): string {
  const searchParams = new URLSearchParams({ resumeSessionId: sessionId });
  return `/pair?${searchParams.toString()}`;
}

export function prependUnique(
  prev: SessionListItem[],
  session: SessionListItem
): SessionListItem[] {
  if (prev.some((s) => s.id === session.id)) return prev;
  return [session, ...prev].slice(0, MAX_RECENT_SESSIONS);
}

function mergeWithEmptyLocals(
  prev: SessionListItem[],
  listed: SessionListItem[]
): SessionListItem[] {
  const emptyLocals = prev.filter(
    (local) => local.messageCount === 0 && !listed.some((s) => s.id === local.id)
  );
  return [...emptyLocals, ...listed].slice(0, MAX_RECENT_SESSIONS);
}

export function sessionToListItem(s: Session): SessionListItem {
  return {
    id: s.id,
    name: getSessionDisplayName(s),
    workingDir: s.working_dir,
    updatedAt: s.updated_at,
    messageCount: s.message_count,
    lastMessageAt: s.last_message_at ?? undefined,
    createdAt: s.created_at,
    archivedAt: s.archived_at ?? undefined,
    projectId: s.project_id ?? undefined,
    providerId: s.provider_name ?? undefined,
    modelId: s.model_config?.model_name ?? undefined,
    userSetName: s.user_set_name ?? undefined,
    hasRecipe: !!s.recipe,
  };
}

export function useNavigationSessions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const chatContext = useChatContext();

  const [recentSessions, setRecentSessions] = useState<SessionListItem[]>([]);
  const [liveSessions, setLiveSessions] = useState<Map<string, LiveSession>>(new Map());
  // Sessions the server is holding open that fell outside the recency window.
  // Their agent — and for a CLI agent, its subprocess — is still running, so
  // hiding them would hide the only place to see or end them.
  const [pinnedLiveSessions, setPinnedLiveSessions] = useState<SessionListItem[]>([]);

  const visibleSessions = useMemo(
    () => mergeVisibleSessions(recentSessions, pinnedLiveSessions, liveSessions),
    [recentSessions, pinnedLiveSessions, liveSessions]
  );

  const visibleSessionsByProject = useMemo(
    () => groupSessionsByProject(visibleSessions),
    [visibleSessions]
  );
  const lastSessionIdRef = useRef<string | null>(null);

  const activeSessionId = searchParams.get('resumeSessionId') ?? undefined;
  const currentSessionId =
    location.pathname === '/pair' ? searchParams.get('resumeSessionId') : null;

  useEffect(() => {
    if (currentSessionId) {
      lastSessionIdRef.current = currentSessionId;
    }
  }, [currentSessionId]);

  const refreshLiveSessions = useCallback(async () => {
    try {
      setLiveSessions(await acpListLiveSessions());
    } catch (error) {
      console.error('Failed to fetch live sessions:', error);
      setLiveSessions(new Map());
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const sessions = await acpListRecentSessions(MAX_RECENT_SESSIONS);
      setRecentSessions(sessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  }, []);

  useEffect(() => {
    const missing = [...liveSessions.keys()].filter(
      (sessionId) =>
        !recentSessions.some((session) => session.id === sessionId) &&
        !pinnedLiveSessions.some((session) => session.id === sessionId)
    );
    if (missing.length === 0) return;

    let cancelled = false;
    Promise.all(
      missing.map((sessionId) =>
        acpGetSessionListItem(sessionId).catch((error) => {
          console.error('Failed to fetch live session:', error);
          return null;
        })
      )
    ).then((items) => {
      const fetched = items.filter((item): item is SessionListItem => item !== null);
      if (cancelled || fetched.length === 0) return;
      setPinnedLiveSessions((prev) => [
        ...prev,
        ...fetched.filter((item) => !prev.some((session) => session.id === item.id)),
      ]);
    });

    return () => {
      cancelled = true;
    };
  }, [liveSessions, recentSessions, pinnedLiveSessions]);

  useEffect(() => {
    if (!activeSessionId) return;
    if (recentSessions.some((s) => s.id === activeSessionId)) return;

    acpGetSessionListItem(activeSessionId)
      .then((item) => {
        setRecentSessions((prev) => prependUnique(prev, item));
      })
      .catch((error) => {
        console.error('Failed to fetch active session:', error);
      });
  }, [activeSessionId, recentSessions]);

  useEffect(() => {
    let pollingTimeouts: ReturnType<typeof setTimeout>[] = [];
    let isPolling = false;

    const handleSessionCreated = (event: Event) => {
      const { session } = (event as CustomEvent<{ session?: Session }>).detail || {};
      if (session) {
        setRecentSessions((prev) => prependUnique(prev, sessionToListItem(session)));
      }

      if (isPolling) return;
      isPolling = true;

      const pollIntervalMs = 300;
      const maxPollDurationMs = 10000;
      const maxPolls = maxPollDurationMs / pollIntervalMs;
      let pollCount = 0;

      const pollForUpdates = async () => {
        pollCount++;
        try {
          const listed = await acpListRecentSessions(MAX_RECENT_SESSIONS);
          setRecentSessions((prev) => mergeWithEmptyLocals(prev, listed));
        } catch (error) {
          console.error('Failed to poll sessions:', error);
        }

        if (pollCount < maxPolls) {
          const timeout = setTimeout(pollForUpdates, pollIntervalMs);
          pollingTimeouts.push(timeout);
        } else {
          isPolling = false;
        }
      };

      pollForUpdates();
    };

    window.addEventListener(AppEvents.SESSION_CREATED, handleSessionCreated);
    return () => {
      window.removeEventListener(AppEvents.SESSION_CREATED, handleSessionCreated);
      pollingTimeouts.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    let fetchVersion = 0;

    const handleSessionDeleted = (event: Event) => {
      const { sessionId } = (event as CustomEvent<{ sessionId: string }>).detail;

      setRecentSessions((prev) => prev.filter((session) => session.id !== sessionId));

      if (lastSessionIdRef.current === sessionId) {
        lastSessionIdRef.current = null;
      }
      const version = ++fetchVersion;
      acpListRecentSessions(MAX_RECENT_SESSIONS)
        .then((sessions) => {
          if (version !== fetchVersion) return;
          setRecentSessions(sessions.filter((session) => session.id !== sessionId));
        })
        .catch((error) => console.error('Failed to fetch sessions:', error));
    };

    const handleSessionRenamed = (event: Event) => {
      const { sessionId, newName, userInitiated } = (
        event as CustomEvent<{ sessionId: string; newName: string; userInitiated?: boolean }>
      ).detail;

      setRecentSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, name: newName, ...(userInitiated && { user_set_name: true }) }
            : session
        )
      );
    };

    window.addEventListener(AppEvents.SESSION_DELETED, handleSessionDeleted);
    window.addEventListener(AppEvents.SESSION_RENAMED, handleSessionRenamed);

    return () => {
      window.removeEventListener(AppEvents.SESSION_DELETED, handleSessionDeleted);
      window.removeEventListener(AppEvents.SESSION_RENAMED, handleSessionRenamed);
    };
  }, []);

  const handleNavClick = useCallback(
    (path: string) => {
      if (path === '/pair') {
        const sessionId =
          currentSessionId || lastSessionIdRef.current || chatContext?.chat?.sessionId;
        if (sessionId && sessionId.length > 0) {
          navigate(pairSessionPath(sessionId));
        } else {
          navigate('/');
        }
      } else {
        navigate(path);
      }
    },
    [navigate, currentSessionId, chatContext?.chat?.sessionId]
  );

  const handleSessionClick = useCallback(
    (sessionId: string) => {
      navigate(pairSessionPath(sessionId));
    },
    [navigate]
  );

  return {
    visibleSessions,
    visibleSessionsByProject,
    liveSessions,
    activeSessionId,
    fetchSessions,
    refreshLiveSessions,
    handleNavClick,
    handleSessionClick,
  };
}
