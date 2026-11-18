import { render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { IntlTestWrapper } from '../i18n/test-utils';
import MentionPopover, { DisplayItem, DisplayItemWithMatch } from './MentionPopover';
import { listSlashCommandItems } from '../acp/autocomplete';

vi.mock('../acp/autocomplete', () => ({
  listAgentMentionItems: vi.fn().mockResolvedValue([]),
  listSlashCommandItems: vi.fn().mockResolvedValue([]),
}));

const props = {
  onClose: vi.fn(),
  onSelect: vi.fn(),
  position: { x: 0, y: 0 },
  isSlashCommand: true,
  selectedIndex: 0,
  onSelectedIndexChange: vi.fn(),
  workingDir: '/workspace',
};

const skill = (name: string, description: string): DisplayItem => ({
  name,
  extra: description,
  itemType: 'Skill',
  relativePath: name,
});

const rankedNames = async (query: string, items: DisplayItem[]): Promise<string[]> => {
  vi.mocked(listSlashCommandItems).mockResolvedValue(items);
  const ref = createRef<{
    getDisplayFiles: () => DisplayItemWithMatch[];
    selectFile: (index: number) => void;
  }>();
  render(<MentionPopover {...props} ref={ref} isOpen query={query} />, {
    wrapper: IntlTestWrapper,
  });
  await waitFor(() => expect(ref.current?.getDisplayFiles()).toHaveLength(items.length));
  return ref.current!.getDisplayFiles().map((item) => item.name);
};

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('MentionPopover slash command ranking', () => {
  it('ranks an exact command name above a longer one, whatever the descriptions hold', async () => {
    // A slash in a description used to count as path depth and cost the exact match its lead.
    const names = await rankedNames('next', [
      skill('nextgen-board', 'Read the board'),
      skill('next', 'Check Kind/Generation/Capability before closing'),
    ]);
    expect(names).toEqual(['next', 'nextgen-board']);
  });

  it('lists commands alphabetically when nothing is typed', async () => {
    const names = await rankedNames('', [skill('beta', 'no slashes'), skill('alpha', 'a/b/c/d')]);
    expect(names).toEqual(['alpha', 'beta']);
  });
});
