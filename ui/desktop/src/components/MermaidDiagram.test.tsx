import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import MarkdownContent from './MarkdownContent';
import { IntlTestWrapper } from '../i18n/test-utils';

const mermaidMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  parse: vi.fn(),
  render: vi.fn(),
}));

vi.mock('mermaid', () => ({ default: mermaidMock }));

vi.mock('./icons', () => ({
  Check: () => <div data-testid="check-icon">✓</div>,
  Copy: () => <div data-testid="copy-icon">📋</div>,
}));

const renderMarkdown = (content: string) =>
  render(<MarkdownContent content={content} />, { wrapper: IntlTestWrapper });

const fence = (source: string) => '```mermaid\n' + source + '\n```';

describe('MermaidDiagram', () => {
  beforeEach(() => {
    mermaidMock.initialize.mockReset();
    mermaidMock.parse.mockReset().mockResolvedValue({ diagramType: 'flowchart' });
    mermaidMock.render
      .mockReset()
      .mockResolvedValue({ svg: '<svg data-testid="mermaid-svg"><text>A to B</text></svg>' });
    document.documentElement.classList.remove('dark');
  });

  it('renders a mermaid fence as a diagram', async () => {
    renderMarkdown(fence('flowchart LR\n  A --> B'));

    expect(await screen.findByTestId('mermaid-svg')).toBeInTheDocument();
    expect(mermaidMock.render).toHaveBeenCalledWith(
      expect.stringMatching(/^goose-mermaid-\d+$/),
      'flowchart LR\n  A --> B'
    );
    expect(mermaidMock.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ securityLevel: 'strict', theme: 'default' })
    );
  });

  it('uses the dark theme when the document is dark', async () => {
    document.documentElement.classList.add('dark');
    renderMarkdown(fence('flowchart LR\n  A --> B'));

    await screen.findByTestId('mermaid-svg');
    expect(mermaidMock.initialize).toHaveBeenLastCalledWith(
      expect.objectContaining({ theme: 'dark' })
    );
  });

  it('shows the source and the error when the diagram is invalid', async () => {
    mermaidMock.parse.mockRejectedValue(new Error('Parse error on line 2:\n...details'));
    const { container } = renderMarkdown(fence('flowchart LR\n  A -->'));

    expect(
      await screen.findByText('Could not render diagram: Parse error on line 2:')
    ).toBeInTheDocument();
    expect(container.textContent).toContain('A -->');
    expect(mermaidMock.render).not.toHaveBeenCalled();
  });

  it('toggles between the diagram and its source', async () => {
    const { container } = renderMarkdown(fence('flowchart LR\n  A --> B'));
    await screen.findByTestId('mermaid-svg');

    fireEvent.click(screen.getByText('Show code'));
    expect(screen.queryByTestId('mermaid-svg')).not.toBeInTheDocument();
    expect(container.textContent).toContain('A --> B');

    fireEvent.click(screen.getByText('Show diagram'));
    expect(screen.getByTestId('mermaid-svg')).toBeInTheDocument();
  });

  it('leaves other code fences alone', async () => {
    renderMarkdown('```js\nconst x = 1;\n```');

    await waitFor(() => expect(screen.getByText(/const/)).toBeInTheDocument());
    expect(mermaidMock.render).not.toHaveBeenCalled();
  });
});
