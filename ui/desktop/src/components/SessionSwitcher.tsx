import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search } from 'lucide-react';
import { defineMessages, useIntl } from '../i18n';
import { cn } from '../utils';
import { getProjectLabel } from '../utils/projectSessions';
import { filterSwitcherEntries, type SwitcherEntry } from '../utils/sessionSwitcher';
import { describeSessionActivity, SessionIndicators } from './SessionIndicators';

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
    defaultMessage: '↑↓ to move · ↵ to open · esc to close',
  },
});

interface SessionSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Already ranked; the first entry is the default choice. */
  entries: readonly SwitcherEntry[];
  onSelect: (sessionId: string) => void;
}

export const SessionSwitcher: React.FC<SessionSwitcherProps> = ({
  open,
  onOpenChange,
  entries,
  onSelect,
}) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  // Selection follows a session, not a row, so a refresh that reorders the
  // list while it is open cannot change what Enter opens.
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const listRef = useRef<HTMLDivElement>(null);
  const now = Date.now();

  const matches = useMemo(() => filterSwitcherEntries(entries, query), [entries, query]);
  const foundIndex = matches.findIndex(({ session }) => session.id === selectedId);
  const selectedIndex = foundIndex === -1 ? 0 : foundIndex;

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedId(entries[0]?.session.id);
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
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
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={handleKeyDown}
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
                setSelectedId(filterSwitcherEntries(entries, nextQuery)[0]?.session.id);
              }}
              placeholder={intl.formatMessage(i18n.placeholder)}
              aria-label={intl.formatMessage(i18n.placeholder)}
              className="h-11 w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
            />
          </div>
          <div ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-1">
            {matches.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-secondary">
                {intl.formatMessage(i18n.noMatches)}
              </div>
            ) : (
              matches.map(({ session, activity }, index) => (
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
                    {activity.state !== 'idle' && (
                      <span className="text-xs text-text-secondary">
                        {describeSessionActivity(intl, activity, now)}
                      </span>
                    )}
                    <SessionIndicators activity={activity} now={now} />
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border-secondary px-3 py-1.5 text-xs text-text-tertiary">
            {intl.formatMessage(i18n.hint)}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
