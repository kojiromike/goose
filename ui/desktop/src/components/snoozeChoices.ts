import type { IntlShape } from 'react-intl';
import { defineMessages } from '../i18n';
import { snoozePresets, suggestedWakeTime, type SnoozePresetKey } from '../utils/sessionSnooze';
import { formatWakeTime } from './SessionIndicators';

const i18n = defineMessages({
  suggested: {
    id: 'snoozeChoices.suggested',
    defaultMessage: "Until {time} (session's check-back)",
  },
  untilActivity: {
    id: 'snoozeChoices.untilActivity',
    defaultMessage: 'Until new activity',
  },
  tenMinutes: {
    id: 'snoozeChoices.tenMinutes',
    defaultMessage: 'For 10 minutes ({time})',
  },
  thirtyMinutes: {
    id: 'snoozeChoices.thirtyMinutes',
    defaultMessage: 'For 30 minutes ({time})',
  },
  oneHour: {
    id: 'snoozeChoices.oneHour',
    defaultMessage: 'For 1 hour ({time})',
  },
  threeHours: {
    id: 'snoozeChoices.threeHours',
    defaultMessage: 'For 3 hours ({time})',
  },
  tomorrow: {
    id: 'snoozeChoices.tomorrow',
    defaultMessage: 'Until tomorrow ({time})',
  },
  monday: {
    id: 'snoozeChoices.monday',
    defaultMessage: 'Until Monday ({time})',
  },
});

const PRESET_MESSAGES: Record<SnoozePresetKey, (typeof i18n)[keyof typeof i18n]> = {
  tenMinutes: i18n.tenMinutes,
  thirtyMinutes: i18n.thirtyMinutes,
  oneHour: i18n.oneHour,
  threeHours: i18n.threeHours,
  tomorrow: i18n.tomorrow,
  monday: i18n.monday,
};

export interface SnoozeChoice {
  key: SnoozePresetKey | 'untilActivity' | 'suggested';
  label: string;
  /** Absent for a snooze that waits only for new activity. */
  until?: number;
}

/** The parts of a session that carry the agent's own check-back time. */
export interface SnoozeSuggestionSource {
  lastStatusLine?: string;
  lastMessageAt?: string;
}

/**
 * What a session can be snoozed until, as offered in menus. When the agent's
 * closing status line names a check-back time, that comes first, so the
 * default choice is the one the agent asked for.
 */
export function snoozeChoices(
  intl: IntlShape,
  now = Date.now(),
  session?: SnoozeSuggestionSource
): SnoozeChoice[] {
  const suggested = suggestedWakeTime(session?.lastStatusLine, session?.lastMessageAt, now);
  return [
    ...(suggested === undefined
      ? []
      : [
          {
            key: 'suggested' as const,
            until: suggested,
            label: intl.formatMessage(i18n.suggested, {
              time: formatWakeTime(intl, suggested, now),
            }),
          },
        ]),
    { key: 'untilActivity', label: intl.formatMessage(i18n.untilActivity) },
    ...snoozePresets(now).map(({ key, until }) => ({
      key,
      until,
      label: intl.formatMessage(PRESET_MESSAGES[key], { time: formatWakeTime(intl, until, now) }),
    })),
  ];
}
