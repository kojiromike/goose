import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search } from 'lucide-react';
import { defineMessages, useIntl } from '../i18n';
import { cn } from '../utils';
import { getProjectLabel } from '../utils/projectSessions';
import { filterSwitcherEntries, type SwitcherEntry } from '../utils/sessionSwitcher';
import { describeSessionActivity, SessionIndicators } from './SessionIndicators';
import { snoozeChoices } from './snoozeChoices';

const i18n = defineMessages({
  title: {
    id: 'sessionSwitcher.title',
    defaultMessage: 'Switch chat',
  },
  placeholder: {
    id: 'sessionSwitcher.placeholder',
    defaultMessage: 'Jump to a chat…',
  },
  noMatches: {
    id: 'sessionSwitcher.noMatches',
    defaultMessage: 'No matching chats',
  },
  untitledSession: {
    id: 'sessionSwitcher.untitledSession',
    defaultMessage: 'Untitled session',
  },
  hint: {
    id: 'sessionSwitcher.hint',
    defaultMessage:
      '↑↓ to move · ↵ to open · {snoozeKey} to snooze ({snoozeUntilKey} for a time) · esc to close',
  },
  snoozeTitle: {
    id: 'sessionSwitcher.snoozeTitle',
    defaultMessage: 'Snooze “{name}”',
  },
  snoozeHint: {
    id: 'sessionSwitcher.snoozeHint',
    defaultMessage: '↑↓ to move · ↵ to snooze · esc to go back',
  },
});

interface SessionSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Already ranked; the first entry is the default choice. */
  entries: readonly SwitcherEntry[];
  onSelect: (sessionId: string) => void;
  /** Snooze the session, or wake it if it is snoozed. */
  onToggleSnooze: (sessionId: string) => void;
  /** Snooze the session until new activity or, given `until`, that time. */
  onSnooze: (sessionId: string, until?: number) => void;
}

const isMac = () => window.electron.platform === 'darwin';

export const SessionSwitcher: React.FC<SessionSwitcherProps> = ({
  open,
  onOpenChange,
  entries,
  onSelect,
  onToggleSnooze,
  onSnooze,
}) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  // The session whose wake time is being picked, while the picker is up.
  const [snoozeTarget, setSnoozeTarget] = useState<SwitcherEntry | undefined>();
  const [choiceIndex, setChoiceIndex] = useState(0);
  // Selection follows a session, not a row, so a refresh that reorders the
  // list while it is open cannot change what Enter opens.
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const listRef = useRef<HTMLDivElement>(null);
  const now = Date.now();

  const matches = useMemo(() => filterSwitcherEntries(entries, query), [entries, query]);
  const foundIndex = matches.findIndex(({ session }) => session.id === selectedId);
  const selectedIndex = foundIndex === -1 ? 0 : foundIndex;
  const choices = useMemo(
    () => (snoozeTarget ? snoozeChoices(intl, Date.now()) : []),
    [snoozeTarget, intl]
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedId(entries[0]?.session.id);
      setSnoozeTarget(undefined);
    }
    // Only the entries at the moment of opening pick the default.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${selectedIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const choose = (sessionId: string) => {
    onOpenChange(false);
    onSelect(sessionId);
  };

  // A snoozed or woken row moves to its new rank; keep the cursor where it was.
  const stepPastSelected = () => {
    const neighbor = matches[selectedIndex + 1] ?? matches[selectedIndex - 1];
    if (neighbor) setSelectedId(neighbor.session.id);
  };

  const handlePickerKeyDown = (event: React.KeyboardEvent, target: SwitcherEntry) => {
    const down = event.key === 'ArrowDown' || (event.ctrlKey && event.key === 'n');
    const up = event.key === 'ArrowUp' || (event.ctrlKey && event.key === 'p');
    if (down || up) {
      event.preventDefault();
      setChoiceIndex((index) => (index + (down ? 1 : -1) + choices.length) % choices.length);
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      setSnoozeTarget(undefined);
      stepPastSelected();
      onSnooze(target.session.id, choices[choiceIndex]?.until);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (snoozeTarget) {
      handlePickerKeyDown(event, snoozeTarget);
      return;
    }
    const down = event.key === 'ArrowDown' || (event.ctrlKey && event.key === 'n');
    const up = event.key === 'ArrowUp' || (event.ctrlKey && event.key === 'p');
    if (down || up) {
      event.preventDefault();
      if (matches.length === 0) return;
      const next = (selectedIndex + (down ? 1 : -1) + matches.length) % matches.length;
      setSelectedId(matches[next].session.id);
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      const match = matches[selectedIndex];
      if (match) choose(match.session.id);
    } else if (event.key.toLowerCase() === 's' && (isMac() ? event.metaKey : event.ctrlKey)) {
      event.preventDefault();
      const match = matches[selectedIndex];
      if (!match) return;
      if (event.shiftKey) {
        setChoiceIndex(0);
        setSnoozeTarget(match);
        return;
      }
      stepPastSelected();
      onToggleSnooze(match.session.id);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={handleKeyDown}
          onEscapeKeyDown={(event) => {
            if (!snoozeTarget) return;
            event.preventDefault();
            setSnoozeTarget(undefined);
          }}
          className={cn(
            'fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2',
            'flex flex-col overflow-hidden rounded-xl border border-border-primary',
            'bg-background-primary shadow-lg'
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {intl.formatMessage(i18n.title)}
          </DialogPrimitive.Title>
          <div className="flex items-center gap-2 border-b border-border-secondary px-3">
            <Search className="h-4 w-4 flex-shrink-0 text-text-secondary" />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                setSnoozeTarget(undefined);
                setSelectedId(filterSwitcherEntries(entries, nextQuery)[0]?.session.id);
              }}
              placeholder={intl.formatMessage(i18n.placeholder)}
              aria-label={intl.formatMessage(i18n.placeholder)}
              className="h-11 w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
            />
          </div>
          <div ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-1">
            {snoozeTarget ? (
              <>
                <div className="truncate px-3 py-1.5 text-xs text-text-secondary">
                  {intl.formatMessage(i18n.snoozeTitle, {
                    name: snoozeTarget.session.name || intl.formatMessage(i18n.untitledSession),
                  })}
                </div>
                {choices.map((choice, index) => (
                  <div
                    key={choice.key}
                    role="option"
                    aria-selected={index === choiceIndex}
                    onMouseMove={() => setChoiceIndex(index)}
                    onClick={() => {
                      setSnoozeTarget(undefined);
                      stepPastSelected();
                      onSnooze(snoozeTarget.session.id, choice.until);
                    }}
                    className={cn(
                      'cursor-pointer rounded-lg px-3 py-1.5 text-sm text-text-primary',
                      index === choiceIndex && 'bg-background-tertiary'
                    )}
                  >
                    {choice.label}
                  </div>
                ))}
              </>
            ) : matches.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-secondary">
                {intl.formatMessage(i18n.noMatches)}
              </div>
            ) : (
              matches.map(({ session, activity, snooze }, index) => (
                <div
                  key={session.id}
                  data-index={index}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onMouseMove={() => setSelectedId(session.id)}
                  onClick={() => choose(session.id)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm',
                    index === selectedIndex && 'bg-background-tertiary'
                  )}
                >
                  <span className="truncate text-text-primary">
                    {session.name || intl.formatMessage(i18n.untitledSession)}
                  </span>
                  {session.workingDir && (
                    <span className="flex-shrink-0 text-xs text-text-tertiary">
                      {getProjectLabel(session.workingDir)}
                    </span>
                  )}
                  <span className="ml-auto flex flex-shrink-0 items-center gap-2">
                    {(activity.state !== 'idle' || snooze) && (
                      <span className="text-xs text-text-secondary">
                        {describeSessionActivity(intl, activity, now, snooze)}
                      </span>
                    )}
                    <SessionIndicators activity={activity} now={now} snooze={snooze} />
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border-secondary px-3 py-1.5 text-xs text-text-tertiary">
            {snoozeTarget
              ? intl.formatMessage(i18n.snoozeHint)
              : intl.formatMessage(i18n.hint, {
                  snoozeKey: isMac() ? '⌘S' : 'Ctrl+S',
                  snoozeUntilKey: isMac() ? '⌘⇧S' : 'Ctrl+Shift+S',
                })}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
