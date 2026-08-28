import { describe, it, expect, vi, afterAll, beforeAll, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResumeProviderSessionModal } from './ResumeProviderSessionModal';
import { IntlTestWrapper } from '../../i18n/test-utils';

const listProviderSessions = vi.hoisted(() => vi.fn());

vi.mock('../../acp/sessions', () => ({
  acpListProviderSessions: listProviderSessions,
}));

// Radix ScrollArea measures its viewport with ResizeObserver, which jsdom lacks.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  providerId: 'claude-acp',
  workingDir: '/Users/dev/project',
  onSelect: vi.fn(),
  isResuming: false,
};

const renderModal = (props: Partial<typeof defaultProps> = {}) =>
  render(<ResumeProviderSessionModal {...defaultProps} {...props} />, { wrapper: IntlTestWrapper });

describe('ResumeProviderSessionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listProviderSessions.mockResolvedValue([
      {
        sessionId: 'claude-1',
        cwd: '/Users/dev/project',
        title: 'Refactor the parser',
        updatedAt: '2026-07-27T15:04:05Z',
      },
      { sessionId: 'claude-2', cwd: '/Users/dev/project', title: null, updatedAt: null },
    ]);
  });

  it('scopes the listing to the working directory', async () => {
    renderModal();

    await waitFor(() =>
      expect(listProviderSessions).toHaveBeenCalledWith('claude-acp', '/Users/dev/project')
    );
  });

  it('hands the chosen session id back', async () => {
    renderModal();

    await userEvent.click(await screen.findByText('Refactor the parser'));

    expect(defaultProps.onSelect).toHaveBeenCalledWith('claude-1');
  });

  it('labels a session that has no title', async () => {
    renderModal();

    expect(await screen.findByText('Untitled session')).toBeInTheDocument();
  });

  it('surfaces a listing failure instead of an empty list', async () => {
    listProviderSessions.mockRejectedValue(new Error('claude-agent-acp not found'));
    renderModal();

    expect(await screen.findByText('claude-agent-acp not found')).toBeInTheDocument();
  });

  it('reports when the directory has no sessions', async () => {
    listProviderSessions.mockResolvedValue([]);
    renderModal();

    expect(
      await screen.findByText('No Claude Code sessions found for this directory.')
    ).toBeInTheDocument();
  });

  // Listing spawns the provider's agent, which is expensive.
  it('does not query the agent while closed', () => {
    renderModal({ isOpen: false });

    expect(listProviderSessions).not.toHaveBeenCalled();
  });
});
