import { AlertCircle, Loader2 } from 'lucide-react';
import React from 'react';
import { defineMessages, useIntl } from '../i18n';

const i18n = defineMessages({
  error: {
    id: 'sessionIndicators.error',
    defaultMessage: 'Session encountered an error',
  },
  streaming: {
    id: 'sessionIndicators.streaming',
    defaultMessage: 'Streaming',
  },
  newActivity: {
    id: 'sessionIndicators.newActivity',
    defaultMessage: 'Has new activity',
  },
  live: {
    id: 'sessionIndicators.live',
    defaultMessage: 'Loaded — holding an agent open',
  },
});

interface SessionIndicatorsProps {
  isStreaming: boolean;
  hasUnread: boolean;
  hasError: boolean;
  isLive: boolean;
}

/**
 * Visual indicators for session status (priority order: error > streaming >
 * unread > live). `isStreaming` and `isLive` come from the server, so they
 * describe the session itself rather than what this window last saw.
 */
export const SessionIndicators = React.memo<SessionIndicatorsProps>(
  ({ isStreaming, hasUnread, hasError, isLive }) => {
    const intl = useIntl();

    if (hasError) {
      return (
        <div className="flex items-center gap-1">
          <AlertCircle
            className="w-3.5 h-3.5 text-red-500"
            aria-label={intl.formatMessage(i18n.error)}
          />
        </div>
      );
    }

    if (isStreaming) {
      return (
        <div className="flex items-center gap-1">
          <Loader2 className="w-3 h-3 text-blue-500 animate-spin" aria-label={intl.formatMessage(i18n.streaming)} />
        </div>
      );
    }

    if (hasUnread) {
      return (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" aria-label={intl.formatMessage(i18n.newActivity)} />
        </div>
      );
    }

    if (isLive) {
      return (
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full border border-text-secondary"
            aria-label={intl.formatMessage(i18n.live)}
          />
        </div>
      );
    }

    return null;
  }
);

SessionIndicators.displayName = 'SessionIndicators';
