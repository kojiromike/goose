import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IntlTestWrapper } from '../i18n/test-utils';
import type { SessionActivity } from '../utils/sessionActivity';
import { SessionIndicators } from './SessionIndicators';

const NOW = 1_800_000_000_000;

const renderIndicators = (activity: Partial<SessionActivity>) =>
  render(
    <IntlTestWrapper>
      <SessionIndicators
        activity={{ state: 'idle', reason: 'none', unread: false, ...activity }}
        now={NOW}
      />
    </IntlTestWrapper>
  );

describe('SessionIndicators', () => {
  it('shows nothing for an idle session', () => {
    const { container } = renderIndicators({});

    expect(container).toBeEmptyDOMElement();
  });

  it('marks a working session', () => {
    renderIndicators({ state: 'working', reason: 'turn' });

    expect(screen.getByLabelText('Working')).toBeInTheDocument();
  });

  it('counts background commands', () => {
    renderIndicators({ state: 'working', reason: 'background', backgroundTasks: 2 });

    expect(
      screen.getByLabelText('Working in the background (2 background commands)')
    ).toBeInTheDocument();
  });

  it('asks for approval', () => {
    renderIndicators({ state: 'waiting', reason: 'approval' });

    expect(screen.getByLabelText('Needs your approval')).toBeInTheDocument();
  });

  it('says whose turn it is, and whether there is something new', () => {
    const { unmount } = renderIndicators({ state: 'waiting', reason: 'turnEnded' });
    expect(screen.getByLabelText('Waiting for you')).toBeInTheDocument();
    unmount();

    renderIndicators({ state: 'waiting', reason: 'turnEnded', unread: true });
    expect(screen.getByLabelText('Waiting for you (new reply)')).toBeInTheDocument();
  });

  it('says how long a stalled turn has been silent', () => {
    renderIndicators({ state: 'stuck', reason: 'stalled', since: NOW - 12 * 60_000 });

    expect(screen.getByLabelText('Stuck: no progress for 12 minutes')).toBeInTheDocument();
  });

  it('shows why turns are failing', () => {
    renderIndicators({
      state: 'stuck',
      reason: 'failing',
      failedTurns: 3,
      error: 'API Error: 400',
    });

    expect(
      screen.getByLabelText('Stuck: 3 turns failed in a row: API Error: 400')
    ).toBeInTheDocument();
  });
});
