import type { IntlShape } from 'react-intl';
import { defineMessages } from '../i18n';
import { snoozePresets, type SnoozePresetKey } from '../utils/sessionSnooze';
import { formatWakeTime } from './SessionIndicators';

const i18n = defineMessages({
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
  key: SnoozePresetKey | 'untilActivity';
  label: string;
  /** Absent for a snooze that waits only for new activity. */
  until?: number;
}

/** What a session can be snoozed until, as offered in menus. */
export function snoozeChoices(intl: IntlShape, now = Date.now()): SnoozeChoice[] {
  return [
    { key: 'untilActivity', label: intl.formatMessage(i18n.untilActivity) },
    ...snoozePresets(now).map(({ key, until }) => ({
      key,
      until,
      label: intl.formatMessage(PRESET_MESSAGES[key], { time: formatWakeTime(intl, until, now) }),
    })),
  ];
}
