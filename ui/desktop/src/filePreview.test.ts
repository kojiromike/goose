import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  MAX_FILE_PREVIEW_BYTES,
  isPreviewableFile,
  readFilePreview,
  resolvePreviewPath,
} from './filePreview';

const tempDirectories: string[] = [];

function makeTempDirectory(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'goose-file-preview-'));
  tempDirectories.push(directory);
  return directory;
}

afterEach(() => {
  while (tempDirectories.length > 0) {
    fs.rmSync(tempDirectories.pop()!, { recursive: true, force: true });
  }
});

describe('resolvePreviewPath', () => {
  it('expands the home directory and strips line suffixes', () => {
    expect(resolvePreviewPath('~/notes/plan.md:12:3')).toBe(
      path.join(os.homedir(), 'notes', 'plan.md')
    );
    expect(resolvePreviewPath('/tmp/a/../plan.md:7')).toBe(path.normalize('/tmp/plan.md'));
  });

  it('resolves relative paths only against an absolute base directory', () => {
    expect(resolvePreviewPath('docs/plan.md', '/work/repo')).toBe(
      path.resolve('/work/repo', 'docs/plan.md')
    );
    expect(resolvePreviewPath('docs/plan.md')).toBeNull();
    expect(resolvePreviewPath('docs/plan.md', 'relative/base')).toBeNull();
  });

  it('rejects values that are not usable paths', () => {
    expect(resolvePreviewPath(undefined)).toBeNull();
    expect(resolvePreviewPath('   ')).toBeNull();
    expect(resolvePreviewPath('/tmp/a\0b')).toBeNull();
  });
});

describe('readFilePreview', () => {
  it('reads a text file', async () => {
    const filePath = path.join(makeTempDirectory(), 'plan.md');
    fs.writeFileSync(filePath, '# Plan\n');

    await expect(isPreviewableFile(filePath)).resolves.toBe(true);
    await expect(readFilePreview(filePath)).resolves.toEqual({
      status: 'ok',
      filePath,
      content: '# Plan\n',
    });
  });

  it('reports a missing file', async () => {
    const filePath = path.join(makeTempDirectory(), 'absent.md');

    await expect(isPreviewableFile(filePath)).resolves.toBe(false);
    await expect(readFilePreview(filePath)).resolves.toEqual({ status: 'missing', filePath });
  });

  it('refuses directories', async () => {
    const directory = makeTempDirectory();

    await expect(isPreviewableFile(directory)).resolves.toBe(false);
    await expect(readFilePreview(directory)).resolves.toEqual({
      status: 'not-file',
      filePath: directory,
    });
  });

  it('refuses binary content', async () => {
    const filePath = path.join(makeTempDirectory(), 'image.png');
    fs.writeFileSync(filePath, Buffer.from([0x89, 0x50, 0x00, 0x47]));

    await expect(readFilePreview(filePath)).resolves.toEqual({ status: 'binary', filePath });
  });

  it('refuses files over the size cap', async () => {
    const filePath = path.join(makeTempDirectory(), 'huge.log');
    fs.writeFileSync(filePath, Buffer.alloc(MAX_FILE_PREVIEW_BYTES + 1, 'a'));

    await expect(readFilePreview(filePath)).resolves.toEqual({ status: 'too-large', filePath });
  });
});
