/**
 * Picks a session that lives on the provider's own agent — a Claude Code
 * conversation, not a goose one — so a new goose session can resume it with
 * the agent's context intact.
 */

import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { ProviderSessionEntry } from '@aaif/goose-sdk';
import { acpListProviderSessions } from '../../acp/sessions';
import { errorMessage } from '../../utils/conversionUtils';
import { currentLocale, defineMessages, useIntl } from '../../i18n';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

const i18n = defineMessages({
  title: { id: 'resumeProviderSession.title', defaultMessage: 'Resume a Claude Code session' },
  description: {
    id: 'resumeProviderSession.description',
    defaultMessage:
      'Continue a conversation from Claude Code in goose. Only sessions from the current directory are shown.',
  },
  empty: {
    id: 'resumeProviderSession.empty',
    defaultMessage: 'No Claude Code sessions found for this directory.',
  },
  untitled: { id: 'resumeProviderSession.untitled', defaultMessage: 'Untitled session' },
  cancel: { id: 'resumeProviderSession.cancel', defaultMessage: 'Cancel' },
  loading: { id: 'resumeProviderSession.loading', defaultMessage: 'Loading sessions…' },
});

function formatUpdatedAt(updatedAt: string | null | undefined): string | null {
  if (!updatedAt) return null;
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(currentLocale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface ResumeProviderSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  workingDir: string;
  onSelect: (sessionId: string) => void;
  isResuming: boolean;
}

export function ResumeProviderSessionModal({
  isOpen,
  onClose,
  providerId,
  workingDir,
  onSelect,
  isResuming,
}: ResumeProviderSessionModalProps) {
  const intl = useIntl();
  const [sessions, setSessions] = useState<ProviderSessionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setSessions(await acpListProviderSessions(providerId, workingDir));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [providerId, workingDir]);

  // Listing spawns the agent, so only pay for it while the modal is open.
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, loadSessions]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{intl.formatMessage(i18n.title)}</DialogTitle>
          <DialogDescription>{intl.formatMessage(i18n.description)}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-80">
          {isLoading && (
            <div className="space-y-2" aria-label={intl.formatMessage(i18n.loading)}>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}

          {!isLoading && error && <p className="text-sm text-text-error py-4">{error}</p>}

          {!isLoading && !error && sessions.length === 0 && (
            <p className="text-sm text-text-secondary py-4">{intl.formatMessage(i18n.empty)}</p>
          )}

          {!isLoading && !error && (
            <div className="space-y-2">
              {sessions.map((session) => {
                const updatedAt = formatUpdatedAt(session.updatedAt);
                return (
                  <button
                    key={session.sessionId}
                    type="button"
                    disabled={isResuming}
                    onClick={() => onSelect(session.sessionId)}
                    className="w-full text-left rounded-lg border border-border-subtle p-3 hover:bg-background-muted disabled:opacity-50"
                  >
                    <div className="text-sm text-text-primary truncate">
                      {session.title || intl.formatMessage(i18n.untitled)}
                    </div>
                    {updatedAt && <div className="text-xs text-text-secondary">{updatedAt}</div>}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isResuming}>
            {isResuming ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              intl.formatMessage(i18n.cancel)
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
