import { describe, expect, it } from 'vitest';
import { filePathCandidate, filePathFromHref } from './filePathCandidate';

describe('filePathCandidate', () => {
  it.each([
    '~/claude-handoffs/plan.md',
    '/Users/me/Library/Application Support/Goose/logs/main.log',
    '/tmp/report.txt:42',
    'crates/goose/src/acp/provider.rs:120:8',
    'README.md',
    './notes/todo.md',
    '../sibling/Makefile',
  ])('treats %s as a possible file path', (text) => {
    expect(filePathCandidate(text)).toBe(text);
  });

  it.each([
    'x',
    'useState',
    'Array<T>',
    'git status',
    'npm run build && npm test',
    'foo.bar()',
    'https://example.com/a.md',
    '//example.com/a.md',
    '~/dev/goose/',
    'src/**/*.ts',
    '$HOME/notes.md',
    'KEY=value',
    'line one\nline two',
  ])('ignores %s', (text) => {
    expect(filePathCandidate(text)).toBeNull();
  });
});

describe('filePathFromHref', () => {
  it('converts file URLs to decoded paths', () => {
    expect(filePathFromHref('file:///Users/me/My%20Notes/plan.md')).toBe(
      '/Users/me/My Notes/plan.md'
    );
    expect(filePathFromHref('file:///C:/Users/me/plan.md')).toBe('C:/Users/me/plan.md');
  });

  it('keeps absolute, home-relative, and relative targets, dropping fragments', () => {
    expect(filePathFromHref('/tmp/plan.md#summary')).toBe('/tmp/plan.md');
    expect(filePathFromHref('~/claude-handoffs/plan.md')).toBe('~/claude-handoffs/plan.md');
    expect(filePathFromHref('docs/adr/0001.md')).toBe('docs/adr/0001.md');
  });

  it.each(['https://example.com/plan.md', 'mailto:me@example.com', 'vscode://file/x', '#top', ''])(
    'leaves %s to the external link handler',
    (href) => {
      expect(filePathFromHref(href)).toBeNull();
    }
  );
});
