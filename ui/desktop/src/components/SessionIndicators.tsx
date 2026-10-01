import { AlertCircle, AlertTriangle, Hand, Loader2 } from 'lucide-react';
import React from 'react';
import type { IntlShape } from 'react-intl';
import { defineMessages, useIntl } from '../i18n';
import type { SessionActivity } from '../utils/sessionActivity';

const i18n = defineMessages({
  working: {
    id: 'sessionIndicators.working',
    defaultMessage: 'Working',
  },
  workingInBackground: {
    id: 'sessionIndicators.workingInBackground',
    defaultMessage:
      '{count, plural, =0 {Working in the background} one {Working in the background (# background command)} other {Working in the background (# background commands)}}',
  },
  needsApproval: {
    id: 'sessionIndicators.needsApproval',
    defaultMessage: 'Needs your approval',
  },
  waitingForYou: {
    id: 'sessionIndicators.waitingForYou',
    defaultMessage: 'Waiting for you',
  },
  waitingForYouUnread: {
    id: 'sessionIndicators.waitingForYouUnread',
    defaultMessage: 'Waiting for you (new reply)',
  },
  stalled: {
    id: 'sessionIndicators.stalled',
    defaultMessage: 'Stuck: no progress for {minutes, plural, one {# minute} other {# minutes}}',
  },
  exited: {
    id: 'sessionIndicators.exited',
    defaultMessage: 'Stuck: the agent process exited',
  },
  failed: {
    id: 'sessionIndicators.failed',
    defaultMessage: 'Last turn failed',
  },
  failing: {
    id: 'sessionIndicators.failing',
    defaultMessage: 'Stuck: {count} turns failed in a row',
  },
  withError: {
    id: 'sessionIndicators.withError',
    defaultMessage: '{label}: {error}',
  },
  idle: {
    id: 'sessionIndicators.idle',
    defaultMessage: 'Idle',
  },
});

const MAX_ERROR_LENGTH = 160;

function truncate(text: string): string {
  return text.length > MAX_ERROR_LENGTH ? `${text.slice(0, MAX_ERROR_LENGTH - 1)}…` : text;
}

/** A one-line description of what the session is doing, for labels and tooltips. */
export function describeSessionActivity(
  intl: IntlShape,
  activity: SessionActivity,
  now: number
): string {
  switch (activity.reason) {
    case 'turn':
      return intl.formatMessage(i18n.working);
    case 'background':
      return intl.formatMessage(i18n.workingInBackground, {
        count: activity.backgroundTasks ?? 0,
      });
    case 'approval':
      return intl.formatMessage(i18n.needsApproval);
    case 'turnEnded':
      return intl.formatMessage(activity.unread ? i18n.waitingForYouUnread : i18n.waitingForYou);
    case 'stalled':
      return intl.formatMessage(i18n.stalled, {
        minutes: Math.max(1, Math.floor((now - (activity.since ?? now)) / 60_000)),
      });
    case 'exited':
      return intl.formatMessage(i18n.exited);
    case 'failed':
    case 'failing': {
      const label =
        activity.reason === 'failing'
          ? intl.formatMessage(i18n.failing, { count: activity.failedTurns ?? 2 })
          : intl.formatMessage(i18n.failed);
      return activity.error
        ? intl.formatMessage(i18n.withError, { label, error: truncate(activity.error) })
        : label;
    }
    case 'none':
      return intl.formatMessage(i18n.idle);
  }
}

interface SessionIndicatorsProps {
  activity: SessionActivity;
  now: number;
}

/**
 * One marker per session state: a spinner while it works (slower while the
 * work is in the background), amber when it needs the user, red when it is
 * stuck, nothing when idle.
 */
export const SessionIndicators = React.memo<SessionIndicatorsProps>(({ activity, now }) => {
  const intl = useIntl();
  const label = describeSessionActivity(intl, activity, now);

  const marker = (() => {
    switch (activity.reason) {
      case 'turn':
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" aria-label={label} />;
      case 'background':
        return (
          <Loader2
            className="w-3 h-3 text-blue-400 animate-spin [animation-duration:2.5s] opacity-70"
            aria-label={label}
          />
        );
      case 'approval':
        return <Hand className="w-3.5 h-3.5 text-amber-500" aria-label={label} />;
      case 'turnEnded':
        return activity.unread ? (
          <div className="w-2 h-2 bg-amber-500 rounded-full" aria-label={label} />
        ) : (
          <div className="w-2 h-2 rounded-full border border-amber-500/70" aria-label={label} />
        );
      case 'stalled':
      case 'exited':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-500" aria-label={label} />;
      case 'failed':
      case 'failing':
        return <AlertCircle className="w-3.5 h-3.5 text-red-500" aria-label={label} />;
      case 'none':
        return null;
    }
  })();

  if (!marker) return null;
  return (
    <div className="flex items-center gap-1" data-session-state={activity.state}>
      {marker}
    </div>
  );
});

SessionIndicators.displayName = 'SessionIndicators';
