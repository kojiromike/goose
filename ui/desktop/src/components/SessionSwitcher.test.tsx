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

const shortcuts = {
  endSession: 'CommandOrControl+Shift+E',
  archiveSession: 'CommandOrControl+Shift+A',
};

const entries = [entry('a', 'Fix login bug'), entry('b', 'Release notes'), entry('c', 'Triage')];

function renderSwitcher(
  props: Partial<React.ComponentProps<typeof SessionSwitcher>> & { entries?: SwitcherEntry[] } = {}
) {
  const onSelect = vi.fn();
  const onOpenChange = vi.fn();
  const onToggleSnooze = vi.fn();
  const onSnooze = vi.fn();
  const onEnd = vi.fn();
  const onArchive = vi.fn();
  const view = render(
    <IntlTestWrapper>
      <SessionSwitcher
        open
        onOpenChange={onOpenChange}
        entries={entries}
        onSelect={onSelect}
        onToggleSnooze={onToggleSnooze}
        onSnooze={onSnooze}
        shortcuts={shortcuts}
        onEnd={onEnd}
        onArchive={onArchive}
        {...props}
      />
    </IntlTestWrapper>
  );
  return {
    ...view,
    onSelect,
    onOpenChange,
    onToggleSnooze,
    onSnooze,
    onEnd,
    onArchive,
    input: screen.getByRole('textbox'),
  };
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
    const { input, onSelect, rerender, onOpenChange, onToggleSnooze } = renderSwitcher();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    rerender(
      <IntlTestWrapper>
        <SessionSwitcher
          open
          onOpenChange={onOpenChange}
          entries={[entries[2], entries[0], entries[1]]}
          onSelect={onSelect}
          onToggleSnooze={onToggleSnooze}
          onSnooze={vi.fn()}
          shortcuts={shortcuts}
          onEnd={vi.fn()}
          onArchive={vi.fn()}
        />
      </IntlTestWrapper>
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('b');
  });

  it('snoozes the selected session on ⌘S and keeps the cursor on the next row', () => {
    const { input, onSelect, onToggleSnooze, rerender, onOpenChange } = renderSwitcher();
    fireEvent.keyDown(input, { key: 's', metaKey: true });
    expect(onToggleSnooze).toHaveBeenCalledWith('a');
    expect(onOpenChange).not.toHaveBeenCalled();
    rerender(
      <IntlTestWrapper>
        <SessionSwitcher
          open
          onOpenChange={onOpenChange}
          entries={[entries[1], entries[2], { ...entries[0], snooze: { at: 0 } }]}
          onSelect={onSelect}
          onToggleSnooze={onToggleSnooze}
          onSnooze={vi.fn()}
          shortcuts={shortcuts}
          onEnd={vi.fn()}
          onArchive={vi.fn()}
        />
      </IntlTestWrapper>
    );
    expect(screen.getByText('Snoozed until there is new activity')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('b');
  });

  it('archives the selected session on ⌘⇧A without closing', () => {
    const { input, onArchive, onOpenChange } = renderSwitcher();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'A', code: 'KeyA', metaKey: true, shiftKey: true });
    expect(onArchive).toHaveBeenCalledWith('b');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('ends the selected session on ⌘⇧E without closing', () => {
    const { input, onEnd, onArchive, onOpenChange } = renderSwitcher();
    fireEvent.keyDown(input, { key: 'E', code: 'KeyE', metaKey: true, shiftKey: true });
    expect(onEnd).toHaveBeenCalledWith('a');
    expect(onArchive).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('lists the archive and end keys in the hint', () => {
    renderSwitcher();
    expect(screen.getByText('⌘⇧A to archive · ⌘⇧E to end')).toBeInTheDocument();
  });

  it('picks a wake time on ⌘⇧S, and esc backs out without closing', () => {
    const { input, onSnooze, onSelect, onOpenChange } = renderSwitcher();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'S', metaKey: true, shiftKey: true });
    expect(screen.getByText('Snooze “Release notes”')).toBeInTheDocument();
    expect(screen.getByText('Until new activity')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByText('Until new activity')).not.toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'S', metaKey: true, shiftKey: true });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSnooze).toHaveBeenCalledWith('b', expect.any(Number));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByText('Until new activity')).not.toBeInTheDocument();
  });

  it('says so when nothing matches', () => {
    const { input, onSelect } = renderSwitcher();
    fireEvent.change(input, { target: { value: 'zzz' } });
    expect(screen.getByText('No matching chats')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });
});
