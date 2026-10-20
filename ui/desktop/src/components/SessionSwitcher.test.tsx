import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { SessionListItem } from '../acp/sessions';
import { IntlTestWrapper } from '../i18n/test-utils';
import type { SwitcherEntry } from '../utils/sessionSwitcher';
import { SessionSwitcher } from './SessionSwitcher';

function entry(id: string, name: string, workingDir = '/work'): SwitcherEntry {
  return {
    session: {
      id,
      name,
      workingDir,
      updatedAt: '2026-10-20T12:00:00Z',
      messageCount: 1,
    } as SessionListItem,
    activity: { state: 'idle', reason: 'none', unread: false },
  };
}

const entries = [entry('a', 'Fix login bug'), entry('b', 'Release notes'), entry('c', 'Triage')];

function renderSwitcher(
  props: Partial<React.ComponentProps<typeof SessionSwitcher>> & { entries?: SwitcherEntry[] } = {}
) {
  const onSelect = vi.fn();
  const onOpenChange = vi.fn();
  const view = render(
    <IntlTestWrapper>
      <SessionSwitcher
        open
        onOpenChange={onOpenChange}
        entries={entries}
        onSelect={onSelect}
        {...props}
      />
    </IntlTestWrapper>
  );
  return { ...view, onSelect, onOpenChange, input: screen.getByRole('textbox') };
}

describe('SessionSwitcher', () => {
  beforeAll(() => {
    // jsdom does not lay out, so it has no scrollIntoView.
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('opens the first entry on Enter', () => {
    const { input, onSelect, onOpenChange } = renderSwitcher();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('a');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('moves the selection with the arrow keys, wrapping around', () => {
    const { input, onSelect } = renderSwitcher();
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('c');
  });

  it('filters by what is typed and selects the first match', () => {
    const { input, onSelect } = renderSwitcher();
    fireEvent.change(input, { target: { value: 'notes' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('b');
  });

  it('keeps the selected session when the list reorders while open', () => {
    const { input, onSelect, rerender, onOpenChange } = renderSwitcher();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    rerender(
      <IntlTestWrapper>
        <SessionSwitcher
          open
          onOpenChange={onOpenChange}
          entries={[entries[2], entries[0], entries[1]]}
          onSelect={onSelect}
        />
      </IntlTestWrapper>
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('b');
  });

  it('says so when nothing matches', () => {
    const { input, onSelect } = renderSwitcher();
    fireEvent.change(input, { target: { value: 'zzz' } });
    expect(screen.getByText('No matching chats')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });
});
