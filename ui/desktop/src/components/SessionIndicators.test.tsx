import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IntlTestWrapper } from '../i18n/test-utils';
import { SessionIndicators } from './SessionIndicators';

const renderIndicators = (props: {
  isStreaming?: boolean;
  hasUnread?: boolean;
  hasError?: boolean;
  isLive?: boolean;
}) =>
  render(
    <IntlTestWrapper>
      <SessionIndicators
        isStreaming={props.isStreaming ?? false}
        hasUnread={props.hasUnread ?? false}
        hasError={props.hasError ?? false}
        isLive={props.isLive ?? false}
      />
    </IntlTestWrapper>
  );

describe('SessionIndicators', () => {
  it('shows nothing for a session that is not loaded', () => {
    const { container } = renderIndicators({});

    expect(container).toBeEmptyDOMElement();
  });

  it('marks a loaded session that is doing nothing', () => {
    renderIndicators({ isLive: true });

    expect(screen.getByLabelText('Loaded — holding an agent open')).toBeInTheDocument();
  });

  it('prefers the running turn over the loaded marker', () => {
    renderIndicators({ isLive: true, isStreaming: true });

    expect(screen.getByLabelText('Streaming')).toBeInTheDocument();
    expect(screen.queryByLabelText('Loaded — holding an agent open')).not.toBeInTheDocument();
  });

  it('prefers unread activity over the loaded marker', () => {
    renderIndicators({ isLive: true, hasUnread: true });

    expect(screen.getByLabelText('Has new activity')).toBeInTheDocument();
  });

  it('prefers an error over everything else', () => {
    renderIndicators({ isLive: true, isStreaming: true, hasUnread: true, hasError: true });

    expect(screen.getByLabelText('Session encountered an error')).toBeInTheDocument();
  });
});
