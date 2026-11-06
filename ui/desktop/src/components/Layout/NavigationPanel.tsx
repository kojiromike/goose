import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import {
  AppWindow,
  Archive,
  ChevronDown,
  ChevronRight,
  MessageSquarePlus,
  Bell,
  BellOff,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import type { IntlShape } from 'react-intl';
import { useNavigationContext } from './NavigationContext';
import { useConfig } from '../ConfigContext';
import { useNavigationSessions } from '../../hooks/useNavigationSessions';
import {
  isSessionBusy,
  useSessionBusy,
  useSessionBusyElsewhere,
} from '../../hooks/useSessionBusyElsewhere';
import { dispatchSessionLifecycleEvent } from '../../sessionLifecycleBridge';
import {
  NAV_ITEMS,
  SETTINGS_NAV_ITEM,
  getNavItemLabel,
  type NavItem,
} from '../../hooks/useNavigationItems';
import { AppEvents } from '../../constants/events';
import { InlineEditText } from '../common/InlineEditText';
import { describeSessionActivity, SessionIndicators } from '../SessionIndicators';
import { SessionSwitcher } from '../SessionSwitcher';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { formatShortcutCompact } from '../settings/keyboard/KeyboardShortcutsSection';
import type { KeyboardShortcuts } from '../../utils/settings';
import { useFrozenWhile } from '../../hooks/useFrozenWhile';
import { matchesAccelerator } from '../../utils/acceleratorMatch';
import {
  adjacentSessionId,
  noteSessionOpened,
  rankSwitcherEntries,
} from '../../utils/sessionSwitcher';
import {
  acpArchiveSession,
  acpCloseSession,
  acpDeleteSession,
  acpRenameSession,
  type SessionListItem,
} from '../../acp/sessions';
import type { LiveSession } from '../../acp/liveSessions';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
import { formatMessageTimestamp } from '../../utils/timeUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { snoozeChoices } from '../snoozeChoices';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { errorMessage } from '../../utils/conversionUtils';
import {
  isSessionUnread,
  loadLastViewedMap,
  markSessionViewed,
  syncLastViewedMap,
  type LastViewedMap,
} from '../../utils/sessionUnread';
import {
  isSessionSnoozed,
  loadSnoozedMap,
  pruneSnoozedMap,
  snoozeSession,
  unsnoozeSession,
  type SessionSnooze,
  type SnoozedMap,
} from '../../utils/sessionSnooze';
import { cn } from '../../utils';
import type { ProjectGroup } from '../../utils/projectSessions';
import { defineMessages, useIntl } from '../../i18n';
import {
  deriveSessionActivity,
  logStuckTransition,
  type LocalStreamState,
} from '../../utils/sessionActivity';

type StreamState = LocalStreamState;

const LIVE_REFRESH_INTERVAL_MS = 5000;

/** Freezes the chat list's order until the returned release is called. */
type HoldLayout = () => () => void;

interface SessionStatus {
  streamState: StreamState;
  hasUnreadActivity: boolean;
}

const i18n = defineMessages({
  chats: {
    id: 'navigationPanel.chats',
    defaultMessage: 'Chats',
  },
  noChats: {
    id: 'navigationPanel.noChats',
    defaultMessage: 'No recent chats',
  },
  untitledSession: {
    id: 'navigationPanel.untitledSession',
    defaultMessage: 'Untitled session',
  },
  metaModel: {
    id: 'navigationPanel.metaModel',
    defaultMessage: 'Model',
  },
  metaDirectory: {
    id: 'navigationPanel.metaDirectory',
    defaultMessage: 'Directory',
  },
  metaStatus: {
    id: 'navigationPanel.metaStatus',
    defaultMessage: 'Status',
  },
  metaCreated: {
    id: 'navigationPanel.metaCreated',
    defaultMessage: 'Created',
  },
  metaUpdated: {
    id: 'navigationPanel.metaUpdated',
    defaultMessage: 'Updated',
  },
  sessionActions: {
    id: 'navigationPanel.sessionActions',
    defaultMessage: 'Session actions',
  },
  rename: {
    id: 'navigationPanel.rename',
    defaultMessage: 'Rename',
  },
  archive: {
    id: 'navigationPanel.archive',
    defaultMessage: 'Archive',
  },
  snooze: {
    id: 'navigationPanel.snooze',
    defaultMessage: 'Snooze',
  },
  unsnooze: {
    id: 'navigationPanel.unsnooze',
    defaultMessage: 'Unsnooze',
  },
  delete: {
    id: 'navigationPanel.delete',
    defaultMessage: 'Delete',
  },
  archiveSuccess: {
    id: 'navigationPanel.archiveSuccess',
    defaultMessage: 'Archived “{name}”',
  },
  archiveFailed: {
    id: 'navigationPanel.archiveFailed',
    defaultMessage: 'Failed to archive session: {error}',
  },
  deleteTitle: {
    id: 'navigationPanel.deleteTitle',
    defaultMessage: 'Delete chat',
  },
  deleteMessage: {
    id: 'navigationPanel.deleteMessage',
    defaultMessage: 'Are you sure you want to delete “{name}”? This cannot be undone.',
  },
  deleteConfirm: {
    id: 'navigationPanel.deleteConfirm',
    defaultMessage: 'Delete',
  },
  deleteCancel: {
    id: 'navigationPanel.deleteCancel',
    defaultMessage: 'Cancel',
  },
  deleteSuccess: {
    id: 'navigationPanel.deleteSuccess',
    defaultMessage: 'Chat deleted',
  },
  deleteFailed: {
    id: 'navigationPanel.deleteFailed',
    defaultMessage: 'Failed to delete session: {error}',
  },
  endSession: {
    id: 'navigationPanel.endSession',
    defaultMessage: 'End session',
  },
  endSuccess: {
    id: 'navigationPanel.endSuccess',
    defaultMessage: 'Ended “{name}”',
  },
  endFailed: {
    id: 'navigationPanel.endFailed',
    defaultMessage: 'Failed to end session: {error}',
  },
  notLive: {
    id: 'navigationPanel.notLive',
    defaultMessage: '“{name}” has no running agent to end',
  },
  stillBusy: {
    id: 'navigationPanel.stillBusy',
    defaultMessage: '“{name}” is still working; stop it first',
  },
  projectActions: {
    id: 'navigationPanel.projectActions',
    defaultMessage: 'Actions for {project}',
  },
  projectNewChat: {
    id: 'navigationPanel.projectNewChat',
    defaultMessage: 'New chat in this project',
  },
  projectNewChatWindow: {
    id: 'navigationPanel.projectNewChatWindow',
    defaultMessage: 'New chat in this project (new window)',
  },
});

async function archiveSession(intl: IntlShape, session: SessionListItem): Promise<boolean> {
  try {
    await acpArchiveSession(session.id);
  } catch (error) {
    toast.error(
      intl.formatMessage(i18n.archiveFailed, { error: errorMessage(error, 'Unknown error') })
    );
    return false;
  }
  dispatchSessionLifecycleEvent(AppEvents.SESSION_ARCHIVED, {
    sessionId: session.id,
    archived: true,
  });
  toast.success(intl.formatMessage(i18n.archiveSuccess, { name: session.name }));
  return true;
}

const navItemClass = (active: boolean) =>
  cn(
    'flex flex-row items-center gap-3 outline-none no-drag w-full',
    'rounded-full px-3 py-2 text-sm font-medium transition-colors',
    active
      ? 'bg-background-tertiary text-text-primary'
      : 'text-text-primary hover:bg-background-tertiary/60'
  );

interface NavRowProps {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}

const NavRow: React.FC<NavRowProps> = ({ item, active, onClick }) => {
  const intl = useIntl();
  const Icon = item.icon;
  return (
    <button onClick={onClick} className={navItemClass(active)}>
      <Icon className="w-5 h-5 flex-shrink-0 text-text-secondary" />
      <span className="text-left flex-1 truncate">{getNavItemLabel(item, intl)}</span>
      {item.getTag && (
        <span className="text-xs font-mono text-text-secondary">{item.getTag()}</span>
      )}
    </button>
  );
};

interface SessionRowProps {
  session: SessionListItem;
  active: boolean;
  status: SessionStatus | undefined;
  /** Present when the server is holding an agent open for this session. */
  /** Present when the server is holding an agent open for this session. */
  live: LiveSession | undefined;
  /** Present while the user's snooze holds. */
  snooze: SessionSnooze | undefined;
  onSnooze: (until?: number) => void;
  onUnsnooze: () => void;
  onClick: () => void;
  onRenamed: () => void;
  onRequestDelete: (session: SessionListItem) => void;
  onEnded: () => void;
  holdLayout: HoldLayout;
  /** Present on the open chat's row, which the end and archive shortcuts act on. */
  shortcuts?: Pick<KeyboardShortcuts, 'endSession' | 'archiveSession'>;
}

const ShortcutHint: React.FC<{ accelerator: string | null | undefined }> = ({ accelerator }) =>
  accelerator ? (
    <span className="ml-auto pl-4 text-xs text-text-secondary">
      {formatShortcutCompact(accelerator)}
    </span>
  ) : null;

const formatTimestamp = (value?: string): string | null => {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return formatMessageTimestamp(parsed / 1000);
};

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="text-text-inverse/60 flex-shrink-0">{label}</span>
    <span className="text-right ml-auto break-all">{value}</span>
  </div>
);

interface SessionTooltipContentProps {
  session: SessionListItem;
  statusLabel: string;
}

const SessionTooltipContent: React.FC<SessionTooltipContentProps> = ({ session, statusLabel }) => {
  const intl = useIntl();
  const model = session.modelId
    ? session.providerId
      ? `${session.modelId} (${session.providerId})`
      : session.modelId
    : session.providerId;
  const created = formatTimestamp(session.createdAt);
  const updated = formatTimestamp(session.lastMessageAt ?? session.updatedAt);

  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="font-medium break-words">
        {session.name || intl.formatMessage(i18n.untitledSession)}
      </div>
      <div className="flex flex-col gap-0.5">
        {model && <MetaRow label={intl.formatMessage(i18n.metaModel)} value={model} />}
        {session.workingDir && (
          <MetaRow label={intl.formatMessage(i18n.metaDirectory)} value={session.workingDir} />
        )}
        <MetaRow label={intl.formatMessage(i18n.metaStatus)} value={statusLabel} />
        {created && <MetaRow label={intl.formatMessage(i18n.metaCreated)} value={created} />}
        {updated && <MetaRow label={intl.formatMessage(i18n.metaUpdated)} value={updated} />}
      </div>
    </div>
  );
};

const SessionRow: React.FC<SessionRowProps> = ({
  session,
  active,
  status,
  live,
  snooze,
  onSnooze,
  onUnsnooze,
  onClick,
  onRenamed,
  onRequestDelete,
  onEnded,
  holdLayout,
  shortcuts,
}) => {
  const intl = useIntl();
  const [isEditing, setIsEditing] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const holdingLayout = menuOpen || isEditing;
  useEffect(() => (holdingLayout ? holdLayout() : undefined), [holdingLayout, holdLayout]);
  const [editSignal, setEditSignal] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const renameRequested = useRef(false);
  const isStreaming = live?.runningTurn ?? false;
  // Archive and delete both drop the loaded agent without cancelling an active
  // run: mid-load the server can re-register the agent afterwards, and
  // streaming or waiting-on-user-input prompts would resume into a session that
  // is gone. Gate all three states — including runs owned by other windows.
  const busyElsewhere = useSessionBusyElsewhere(session.id);
  const isBusy =
    isStreaming ||
    status?.streamState === 'loading' ||
    status?.streamState === 'waiting' ||
    busyElsewhere;
  const isLive = live !== undefined;
  // The panel re-renders on every live-session poll, which keeps `now` fresh
  // enough for the stall and background-age thresholds.
  const now = Date.now();
  const activity = deriveSessionActivity({
    live,
    localStreamState: status?.streamState,
    hasUnread: status?.hasUnreadActivity ?? false,
    now,
  });
  const statusLabel = describeSessionActivity(intl, activity, now, snooze);
  const localStreamState = status?.streamState;
  const listedActiveRun = session.activeRun;
  useEffect(() => {
    logStuckTransition(session.id, activity, { live, localStreamState, listedActiveRun });
  });

  const handleEnd = async () => {
    setIsEnding(true);
    try {
      await acpCloseSession(session.id);
      onEnded();
    } finally {
      setIsEnding(false);
    }
  };

  const handleArchive = useCallback(() => archiveSession(intl, session), [intl, session]);

  return (
    <Tooltip
      open={tooltipOpen && !isEditing && !menuOpen}
      onOpenChange={setTooltipOpen}
      delayDuration={400}
    >
      <TooltipTrigger asChild>
        <div
          onClick={() => !isEditing && onClick()}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuOpen(true);
          }}
          className={cn(
            'group flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer text-sm',
            'hover:bg-background-tertiary/60 transition-colors',
            active && 'bg-background-tertiary'
          )}
        >
          <InlineEditText
            value={session.name}
            onSave={async (newName) => {
              await acpRenameSession(session.id, newName);
              window.dispatchEvent(
                new CustomEvent(AppEvents.SESSION_RENAMED, {
                  detail: { sessionId: session.id, newName, userInitiated: true },
                })
              );
              onRenamed();
            }}
            placeholder={intl.formatMessage(i18n.untitledSession)}
            singleClickEdit={false}
            editRequestSignal={editSignal}
            className="truncate text-text-primary flex-1 !px-0 !py-0 hover:bg-transparent"
            editClassName="!text-sm"
            onEditStart={() => setIsEditing(true)}
            onEditEnd={() => setIsEditing(false)}
          />
          <SessionIndicators activity={activity} now={now} snooze={snooze} />
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={intl.formatMessage(i18n.sessionActions)}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'flex-shrink-0 rounded p-0.5 text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-opacity',
                  'opacity-0 group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100'
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
              onCloseAutoFocus={(e) => {
                // Keep focus on the rename input we are about to reveal instead of
                // letting Radix return focus to the trigger.
                if (renameRequested.current) {
                  e.preventDefault();
                  renameRequested.current = false;
                }
              }}
            >
              <DropdownMenuItem
                onSelect={() => {
                  renameRequested.current = true;
                  setEditSignal((v) => v + 1);
                }}
              >
                <Pencil className="w-4 h-4" />
                {intl.formatMessage(i18n.rename)}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <BellOff className="w-4 h-4" />
                  {intl.formatMessage(i18n.snooze)}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent onClick={(e) => e.stopPropagation()}>
                  {menuOpen &&
                    snoozeChoices(intl, now).map((choice) => (
                      <DropdownMenuItem key={choice.key} onSelect={() => onSnooze(choice.until)}>
                        {choice.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {snooze && (
                <DropdownMenuItem onSelect={onUnsnooze}>
                  <Bell className="w-4 h-4" />
                  {intl.formatMessage(i18n.unsnooze)}
                </DropdownMenuItem>
              )}
              {isLive && (
                <DropdownMenuItem disabled={isBusy || isEnding} onSelect={() => void handleEnd()}>
                  <Power className="w-4 h-4" />
                  {intl.formatMessage(i18n.endSession)}
                  <ShortcutHint accelerator={shortcuts?.endSession} />
                </DropdownMenuItem>
              )}
              <DropdownMenuItem disabled={isBusy} onSelect={() => void handleArchive()}>
                <Archive className="w-4 h-4" />
                {intl.formatMessage(i18n.archive)}
                <ShortcutHint accelerator={shortcuts?.archiveSession} />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={isBusy}
                onSelect={() => onRequestDelete(session)}
              >
                <Trash2 className="w-4 h-4" />
                {intl.formatMessage(i18n.delete)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" align="start" className="max-w-xs text-left">
        <SessionTooltipContent session={session} statusLabel={statusLabel} />
      </TooltipContent>
    </Tooltip>
  );
};

interface ProjectHeaderProps {
  group: ProjectGroup;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNewChat: () => void;
  onNewChatWindow: () => void;
  holdLayout: HoldLayout;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  group,
  collapsed,
  onToggleCollapsed,
  onNewChat,
  onNewChatWindow,
  holdLayout,
}) => {
  const intl = useIntl();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => (menuOpen ? holdLayout() : undefined), [menuOpen, holdLayout]);

  return (
    <div
      className="group flex items-center gap-1 px-3 pt-2 pb-0.5"
      onContextMenu={(event) => {
        event.preventDefault();
        setMenuOpen(true);
      }}
    >
      <button
        onClick={onToggleCollapsed}
        aria-expanded={!collapsed}
        className="flex items-center gap-1 min-w-0 flex-1 text-[10px] uppercase tracking-wider text-text-tertiary hover:text-text-secondary transition-colors"
        title={group.path}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-3 h-3 flex-shrink-0" />
        )}
        <span className="truncate">{group.label}</span>
      </button>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={intl.formatMessage(i18n.projectActions, { project: group.label })}
            className={cn(
              'flex-shrink-0 rounded p-0.5 text-text-tertiary hover:text-text-primary hover:bg-background-tertiary transition-opacity',
              'opacity-0 group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100'
            )}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onNewChat}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            {intl.formatMessage(i18n.projectNewChat)}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onNewChatWindow}>
            <AppWindow className="mr-2 h-4 w-4" />
            {intl.formatMessage(i18n.projectNewChatWindow)}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const Navigation: React.FC<{ className?: string }> = ({ className }) => {
  const intl = useIntl();
  const { isNavExpanded } = useNavigationContext();
  const location = useLocation();
  const { extensionsList } = useConfig();

  const appsExtensionEnabled = !!extensionsList?.find((ext) => ext.name === 'apps')?.enabled;

  const visibleItems = useMemo<NavItem[]>(() => {
    return NAV_ITEMS.filter((item) => {
      if (item.path === '/apps') return appsExtensionEnabled;
      return true;
    });
  }, [appsExtensionEnabled]);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const {
    recentSessions,
    visibleSessions: liveVisibleSessions,
    visibleSessionsByProject: liveVisibleSessionsByProject,
    liveSessions,
    activeSessionId,
    fetchSessions,
    refreshLiveSessions,
    handleNavClick,
    handleSessionClick,
    handleProjectNewChat,
  } = useNavigationSessions();

  // Polls and status events reorder the list (recency) and add or drop rows
  // (the recent window), which slides an open menu's row, and the menu with it,
  // out from under the pointer. Hold the order while a menu or rename is open
  // and catch up when it closes; activity indicators keep updating in place.
  const [layoutHolds, setLayoutHolds] = useState(0);
  const holdLayout = useCallback<HoldLayout>(() => {
    setLayoutHolds((n) => n + 1);
    // Release a frame late so handoffs (menu → rename, one row's menu to
    // another's) do not let the list jump in between.
    return () => requestAnimationFrame(() => setLayoutHolds((n) => n - 1));
  }, []);
  const liveLayout = useMemo(
    () => ({
      visibleSessions: liveVisibleSessions,
      visibleSessionsByProject: liveVisibleSessionsByProject,
    }),
    [liveVisibleSessions, liveVisibleSessionsByProject]
  );
  const { visibleSessions, visibleSessionsByProject } = useFrozenWhile(liveLayout, layoutHolds > 0);

  const [sessionStatuses, setSessionStatuses] = useState<Map<string, SessionStatus>>(new Map());
  const [lastViewed, setLastViewed] = useState<LastViewedMap>(loadLastViewedMap);
  const [snoozes, setSnoozes] = useState<SnoozedMap>(loadSnoozedMap);

  const activeSessionIdRef = useRef<string | undefined>(activeSessionId);
  activeSessionIdRef.current = activeSessionId;

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const { sessionId, streamState } = (event as CustomEvent).detail;
      // The active session's chat is mounted and visible, so its activity
      // counts as read continuously.
      if (sessionId === activeSessionIdRef.current) {
        setLastViewed(markSessionViewed(sessionId));
      }
      setSessionStatuses((prev) => {
        const existing = prev.get(sessionId);
        const shouldMarkUnread =
          (existing?.streamState === 'streaming' || existing?.streamState === 'waiting') &&
          streamState === 'idle' &&
          sessionId !== activeSessionIdRef.current;
        const next = new Map(prev);
        next.set(sessionId, {
          streamState,
          hasUnreadActivity: existing?.hasUnreadActivity || shouldMarkUnread,
        });
        return next;
      });
    };

    window.addEventListener(AppEvents.SESSION_STATUS_UPDATE, handleStatusUpdate);
    return () => window.removeEventListener(AppEvents.SESSION_STATUS_UPDATE, handleStatusUpdate);
  }, []);

  // A chat view only reports the sessions this window has open, so poll the
  // server for the rest. Turn boundaries are re-read immediately so the
  // spinner does not wait out the interval.
  useEffect(() => {
    if (!isNavExpanded) return undefined;

    void refreshLiveSessions();
    const onStatusUpdate = () => void refreshLiveSessions();
    window.addEventListener(AppEvents.SESSION_STATUS_UPDATE, onStatusUpdate);
    const interval = window.setInterval(() => void refreshLiveSessions(), LIVE_REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener(AppEvents.SESSION_STATUS_UPDATE, onStatusUpdate);
      window.clearInterval(interval);
    };
  }, [isNavExpanded, refreshLiveSessions]);

  // Seed first-seen sessions as read and prune entries for sessions that
  // left the list, so the stored map stays bounded.
  useEffect(() => {
    if (recentSessions.length === 0) return;
    setLastViewed(syncLastViewedMap(recentSessions.map((s) => s.id)));
  }, [recentSessions]);

  // Forget sessions that left the list or woke up, and pick up snoozes made
  // in other windows.
  useEffect(() => {
    if (recentSessions.length === 0) return;
    setSnoozes(pruneSnoozedMap(recentSessions));
  }, [recentSessions]);

  useEffect(() => {
    const onStorage = () => setSnoozes(loadSnoozedMap());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // A timed snooze runs out between polls; the panel re-renders on every
  // live-session poll, so reading the clock here keeps the expiry current.
  const activeSnooze = useCallback(
    (session: SessionListItem): SessionSnooze | undefined => {
      const snooze = snoozes[session.id];
      return isSessionSnoozed(session.lastMessageAt, snooze) ? snooze : undefined;
    },
    [snoozes]
  );

  const snooze = useCallback((sessionId: string, until?: number) => {
    setSnoozes(snoozeSession(sessionId, until));
  }, []);

  const unsnooze = useCallback((sessionId: string) => {
    setSnoozes(unsnoozeSession(sessionId));
  }, []);

  const toggleSnooze = useCallback(
    (sessionId: string) => {
      const session = recentSessions.find(({ id }) => id === sessionId);
      if (session && activeSnooze(session)) {
        unsnooze(sessionId);
      } else {
        snooze(sessionId);
      }
    },
    [recentSessions, activeSnooze, snooze, unsnooze]
  );

  // Opening a session marks it viewed, however the user navigated to it.
  useEffect(() => {
    if (!activeSessionId) return;
    setLastViewed(markSessionViewed(activeSessionId));
  }, [activeSessionId]);

  const clearUnread = useCallback((sessionId: string) => {
    setLastViewed(markSessionViewed(sessionId));
    setSessionStatuses((prev) => {
      const status = prev.get(sessionId);
      if (status?.hasUnreadActivity) {
        const next = new Map(prev);
        next.set(sessionId, { ...status, hasUnreadActivity: false });
        return next;
      }
      return prev;
    });
  }, []);

  const getSessionStatus = useCallback(
    (session: SessionListItem): SessionStatus | undefined => {
      // Live in-window status events win; until one arrives for a session
      // (e.g. right after a renderer reload), fall back to the backend's
      // activeRun flag from the fetched session list. That flag is as old as
      // the last fetch, and a session this window never opens gets no event to
      // replace it, so deriveSessionActivity believes it only for sessions the
      // server does not report.
      const live =
        sessionStatuses.get(session.id) ??
        (session.activeRun
          ? { streamState: 'streaming' as StreamState, hasUnreadActivity: false }
          : undefined);
      if (session.id === activeSessionId) {
        if (!live?.hasUnreadActivity) return live;
        return { ...live, hasUnreadActivity: false };
      }
      const persistedUnread = isSessionUnread(session.lastMessageAt, lastViewed[session.id]);
      if (!persistedUnread) return live;
      return {
        streamState: live?.streamState ?? 'idle',
        hasUnreadActivity: true,
      };
    },
    [sessionStatuses, lastViewed, activeSessionId]
  );

  const navFocusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNavExpanded) {
      fetchSessions();
      requestAnimationFrame(() => navFocusRef.current?.focus());
    }
  }, [isNavExpanded, fetchSessions]);

  // The switcher and next/previous chat work with the sidebar hidden, so load
  // the list once even when the sidebar starts out closed.
  const startedCollapsed = useRef(!isNavExpanded);
  useEffect(() => {
    if (startedCollapsed.current) fetchSessions();
  }, [fetchSessions]);

  const [isChatsExpanded, setIsChatsExpanded] = useState(true);
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());

  const openSession = useCallback(
    (sessionId: string) => {
      clearUnread(sessionId);
      handleSessionClick(sessionId);
    },
    [clearUnread, handleSessionClick]
  );

  const [recentlyOpened, setRecentlyOpened] = useState<string[]>([]);
  useEffect(() => {
    if (activeSessionId) setRecentlyOpened((prev) => noteSessionOpened(prev, activeSessionId));
  }, [activeSessionId]);

  const [switcherOpen, setSwitcherOpen] = useState(false);

  const switcherEntries = useMemo(() => {
    if (!switcherOpen) return [];
    const now = Date.now();
    const entries = visibleSessions.map((session) => {
      const status = getSessionStatus(session);
      return {
        session,
        snooze: activeSnooze(session),
        activity: deriveSessionActivity({
          live: liveSessions.get(session.id),
          localStreamState: status?.streamState,
          hasUnread: status?.hasUnreadActivity ?? false,
          now,
        }),
      };
    });
    return rankSwitcherEntries(entries, activeSessionId, recentlyOpened);
  }, [
    switcherOpen,
    visibleSessions,
    getSessionStatus,
    activeSnooze,
    liveSessions,
    activeSessionId,
    recentlyOpened,
  ]);

  // Next and previous chat follow the sidebar as drawn, skipping collapsed
  // projects, so the keys move through what the user can see.
  const sidebarOrder = useMemo(
    () =>
      visibleSessionsByProject.length > 1
        ? visibleSessionsByProject
            .filter((group) => !collapsedProjects.has(group.path))
            .flatMap((group) => group.sessions.map((session) => session.id))
        : visibleSessions.map((session) => session.id),
    [visibleSessions, visibleSessionsByProject, collapsedProjects]
  );

  // Act on a chat from the keyboard. Archiving tears down the loaded agent the
  // same way ending does, so it needs no separate end first.
  const endOrArchive = useCallback(
    async (action: 'end' | 'archive', sessionId: string | undefined) => {
      const session = recentSessions.find(({ id }) => id === sessionId);
      if (!session) return;
      const name = session.name || intl.formatMessage(i18n.untitledSession);
      const live = liveSessions.get(session.id);
      if (isSessionBusy(session.id) || live?.runningTurn) {
        toast.info(intl.formatMessage(i18n.stillBusy, { name }));
        return;
      }
      if (action === 'archive') {
        // Archiving the open chat leaves its route; land on the next one instead.
        const next =
          session.id === activeSessionId
            ? adjacentSessionId(sidebarOrder, session.id, 1)
            : undefined;
        if ((await archiveSession(intl, session)) && next && next !== session.id) {
          openSession(next);
        }
        return;
      }
      if (!live) {
        toast.info(intl.formatMessage(i18n.notLive, { name }));
        return;
      }
      try {
        await acpCloseSession(session.id);
      } catch (error) {
        toast.error(
          intl.formatMessage(i18n.endFailed, { error: errorMessage(error, 'Unknown error') })
        );
        return;
      }
      toast.success(intl.formatMessage(i18n.endSuccess, { name }));
      void refreshLiveSessions();
    },
    [
      recentSessions,
      activeSessionId,
      liveSessions,
      sidebarOrder,
      intl,
      openSession,
      refreshLiveSessions,
    ]
  );

  const shortcuts = useKeyboardShortcuts();
  useEffect(() => {
    const isMac = window.electron.platform === 'darwin';
    const handleKeyDown = (event: KeyboardEvent) => {
      // A shortcut being recorded in settings must reach the recorder instead.
      if (event.target instanceof Element && event.target.closest('[data-recording-shortcut]')) {
        return;
      }
      if (matchesAccelerator(event, shortcuts.sessionSwitcher, isMac)) {
        event.preventDefault();
        if (!switcherOpen) {
          void refreshLiveSessions();
          void fetchSessions();
        }
        setSwitcherOpen(!switcherOpen);
        return;
      }
      if (switcherOpen) return;
      const action = matchesAccelerator(event, shortcuts.endSession, isMac)
        ? 'end'
        : matchesAccelerator(event, shortcuts.archiveSession, isMac)
          ? 'archive'
          : undefined;
      if (action) {
        event.preventDefault();
        void endOrArchive(action, activeSessionId);
        return;
      }
      const step = matchesAccelerator(event, shortcuts.nextSession, isMac)
        ? 1
        : matchesAccelerator(event, shortcuts.previousSession, isMac)
          ? -1
          : 0;
      if (step === 0) return;
      event.preventDefault();
      const target = adjacentSessionId(sidebarOrder, activeSessionId, step);
      if (target && target !== activeSessionId) openSession(target);
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    shortcuts,
    switcherOpen,
    sidebarOrder,
    activeSessionId,
    openSession,
    refreshLiveSessions,
    fetchSessions,
    endOrArchive,
  ]);

  const toggleProjectCollapsed = useCallback((path: string) => {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const [sessionPendingDelete, setSessionPendingDelete] = useState<SessionListItem | null>(null);

  const handleRequestDelete = useCallback((session: SessionListItem) => {
    setSessionPendingDelete(session);
  }, []);

  // The dialog can sit open while the session starts a run elsewhere, so
  // re-check instead of trusting the state the menu item was disabled on.
  const pendingDeleteBusy = useSessionBusy(sessionPendingDelete?.id ?? '');

  const handleConfirmDelete = useCallback(async () => {
    if (!sessionPendingDelete) return;
    const { id, name } = sessionPendingDelete;
    if (isSessionBusy(id)) return;
    setSessionPendingDelete(null);
    try {
      await acpDeleteSession(id);
      // App's SESSION_DELETED handler runs the ACP cleanup for every window.
      dispatchSessionLifecycleEvent(AppEvents.SESSION_DELETED, { sessionId: id });
      toast.success(intl.formatMessage(i18n.deleteSuccess));
    } catch (error) {
      toast.error(
        intl.formatMessage(i18n.deleteFailed, {
          name,
          error: errorMessage(error, 'Unknown error'),
        })
      );
    }
  }, [sessionPendingDelete, intl]);

  const switcher = (
    <SessionSwitcher
      open={switcherOpen}
      onOpenChange={setSwitcherOpen}
      entries={switcherEntries}
      onSelect={openSession}
      onToggleSnooze={toggleSnooze}
      onSnooze={snooze}
      shortcuts={shortcuts}
      onEnd={(sessionId) => void endOrArchive('end', sessionId)}
      onArchive={(sessionId) => void endOrArchive('archive', sessionId)}
    />
  );

  if (!isNavExpanded) return switcher;

  return (
    <motion.div
      ref={navFocusRef}
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn('bg-background-primary outline-none flex flex-col h-full', className)}
    >
      <div className="h-[48px] no-drag" />

      <div className="px-2 flex flex-col gap-0.5">
        {visibleItems.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            active={isActive(item.path)}
            onClick={() => handleNavClick(item.path)}
          />
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col mt-3">
        <button
          onClick={() => setIsChatsExpanded((v) => !v)}
          className="flex items-center gap-1 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors self-start"
        >
          {isChatsExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          <span>{intl.formatMessage(i18n.chats)}</span>
        </button>
        {isChatsExpanded && (
          <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 mt-1">
            {visibleSessions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-text-secondary">
                {intl.formatMessage(i18n.noChats)}
              </div>
            ) : visibleSessionsByProject.length > 1 ? (
              visibleSessionsByProject.map((group: ProjectGroup) => {
                const isCollapsed = collapsedProjects.has(group.path);
                return (
                  <React.Fragment key={group.path}>
                    <ProjectHeader
                      group={group}
                      collapsed={isCollapsed}
                      onToggleCollapsed={() => toggleProjectCollapsed(group.path)}
                      onNewChat={() => handleProjectNewChat(group.path)}
                      onNewChatWindow={() => window.electron.createChatWindow({ dir: group.path })}
                      holdLayout={holdLayout}
                    />
                    {!isCollapsed &&
                      group.sessions.map((session) => (
                        <SessionRow
                          key={session.id}
                          session={session}
                          active={session.id === activeSessionId}
                          status={getSessionStatus(session)}
                          live={liveSessions.get(session.id)}
                          snooze={activeSnooze(session)}
                          onSnooze={(until) => snooze(session.id, until)}
                          onUnsnooze={() => unsnooze(session.id)}
                          onClick={() => openSession(session.id)}
                          onRenamed={fetchSessions}
                          onRequestDelete={handleRequestDelete}
                          onEnded={refreshLiveSessions}
                          holdLayout={holdLayout}
                          shortcuts={session.id === activeSessionId ? shortcuts : undefined}
                        />
                      ))}
                  </React.Fragment>
                );
              })
            ) : (
              visibleSessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  active={session.id === activeSessionId}
                  status={getSessionStatus(session)}
                  live={liveSessions.get(session.id)}
                  snooze={activeSnooze(session)}
                  onSnooze={(until) => snooze(session.id, until)}
                  onUnsnooze={() => unsnooze(session.id)}
                  onClick={() => openSession(session.id)}
                  onRenamed={fetchSessions}
                  onRequestDelete={handleRequestDelete}
                  onEnded={refreshLiveSessions}
                  holdLayout={holdLayout}
                  shortcuts={session.id === activeSessionId ? shortcuts : undefined}
                />
              ))
            )}
          </div>
        )}
      </div>

      <div className="px-2 pt-2 pb-2 border-t border-border-secondary">
        <NavRow
          item={SETTINGS_NAV_ITEM}
          active={isActive(SETTINGS_NAV_ITEM.path)}
          onClick={() => handleNavClick(SETTINGS_NAV_ITEM.path)}
        />
      </div>

      <ConfirmationModal
        isOpen={sessionPendingDelete !== null}
        title={intl.formatMessage(i18n.deleteTitle)}
        message={intl.formatMessage(i18n.deleteMessage, { name: sessionPendingDelete?.name ?? '' })}
        confirmLabel={intl.formatMessage(i18n.deleteConfirm)}
        cancelLabel={intl.formatMessage(i18n.deleteCancel)}
        confirmVariant="destructive"
        confirmDisabled={pendingDeleteBusy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSessionPendingDelete(null)}
      />
      {switcher}
    </motion.div>
  );
};
