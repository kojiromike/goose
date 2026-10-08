import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import MarkdownContent from '../MarkdownContent';
import { IntlTestWrapper } from '../../i18n/test-utils';
import { FilePreviewBaseDirContext, FilePreviewProvider } from './FilePreviewContext';
import { FilePreviewPanel } from './FilePreviewPanel';

vi.mock('../icons', () => ({
  Check: () => <div />,
  Copy: () => <div />,
}));

const resolveFilePreview = vi.fn();
const readFilePreview = vi.fn();
const openExternal = vi.fn();

const renderChat = (content: string) =>
  render(
    <IntlTestWrapper>
      <FilePreviewProvider>
        <FilePreviewBaseDirContext.Provider value="/work/repo">
          <MarkdownContent content={content} />
        </FilePreviewBaseDirContext.Provider>
        <FilePreviewPanel />
      </FilePreviewProvider>
    </IntlTestWrapper>
  );

describe('file preview', () => {
  beforeEach(() => {
    resolveFilePreview.mockReset().mockResolvedValue(null);
    readFilePreview.mockReset();
    openExternal.mockReset().mockResolvedValue('opened');
    Object.assign(window.electron, { resolveFilePreview, readFilePreview, openExternal });
    localStorage.clear();
  });

  it('opens an existing file named in inline code and renders its markdown', async () => {
    resolveFilePreview.mockImplementation(async (rawPath: string) =>
      rawPath === '~/handoffs/plan-a.md' ? '/home/me/handoffs/plan-a.md' : null
    );
    readFilePreview.mockResolvedValue({
      status: 'ok',
      filePath: '/home/me/handoffs/plan-a.md',
      content: '# The Plan\n\nShip it.',
    });

    renderChat('Wrote `~/handoffs/plan-a.md` and ran `git status`.');

    const link = await screen.findByRole('link', { name: '~/handoffs/plan-a.md' });
    expect(resolveFilePreview).toHaveBeenCalledWith('~/handoffs/plan-a.md', '/work/repo');
    expect(resolveFilePreview).toHaveBeenCalledTimes(1);

    fireEvent.click(link);

    expect(await screen.findByRole('heading', { name: 'The Plan' })).toBeInTheDocument();
    expect(readFilePreview).toHaveBeenCalledWith('/home/me/handoffs/plan-a.md');
    expect(screen.getByTitle('/home/me/handoffs/plan-a.md')).toHaveTextContent('plan-a.md');
  });

  it('leaves inline code alone when no such file exists', async () => {
    renderChat('See `docs/absent-b.md` for details.');

    await waitFor(() =>
      expect(resolveFilePreview).toHaveBeenCalledWith('docs/absent-b.md', '/work/repo')
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('collapses to a rail, expands again, and closes', async () => {
    resolveFilePreview.mockResolvedValue('/work/repo/notes-c.md');
    readFilePreview.mockResolvedValue({
      status: 'ok',
      filePath: '/work/repo/notes-c.md',
      content: 'Body text',
    });

    renderChat('Open `notes-c.md`.');
    fireEvent.click(await screen.findByRole('link', { name: 'notes-c.md' }));
    expect(await screen.findByText('Body text')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse file preview' }));
    expect(screen.queryByText('Body text')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show file preview: notes-c.md' }));
    expect(await screen.findByText('Body text')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close file preview' }));
    expect(screen.queryByText('Body text')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /file preview/ })).not.toBeInTheDocument();
  });

  it('explains why a file cannot be shown', async () => {
    resolveFilePreview.mockResolvedValue('/work/repo/blob-d.bin');
    readFilePreview.mockResolvedValue({ status: 'binary', filePath: '/work/repo/blob-d.bin' });

    renderChat('Open `blob-d.bin`.');
    fireEvent.click(await screen.findByRole('link', { name: 'blob-d.bin' }));

    expect(
      await screen.findByText('This file is not text, so it cannot be previewed.')
    ).toBeInTheDocument();
  });

  it('previews a markdown link to a local file instead of opening it externally', async () => {
    resolveFilePreview.mockImplementation(async (rawPath: string) =>
      rawPath === '/work/repo/linked-e.md' ? rawPath : null
    );
    readFilePreview.mockResolvedValue({
      status: 'ok',
      filePath: '/work/repo/linked-e.md',
      content: 'Linked body',
    });

    renderChat(
      'Read [the notes](file:///work/repo/linked-e.md) or [the site](https://example.com).'
    );

    fireEvent.click(screen.getByText('the notes'));
    expect(await screen.findByText('Linked body')).toBeInTheDocument();
    expect(openExternal).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('the site'));
    await waitFor(() => expect(openExternal).toHaveBeenCalledWith('https://example.com'));
  });
});
