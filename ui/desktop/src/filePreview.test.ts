import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  MAX_FILE_PREVIEW_BYTES,
  MAX_IMAGE_PREVIEW_BYTES,
  isPreviewableFile,
  readFilePreview,
  resolvePreviewPath,
  sniffImageType,
} from './filePreview';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

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
    const filePath = path.join(makeTempDirectory(), 'archive.bin');
    fs.writeFileSync(filePath, Buffer.from([0x50, 0x4b, 0x00, 0x03]));

    await expect(readFilePreview(filePath)).resolves.toEqual({ status: 'binary', filePath });
  });

  it('reads an image as a data URL, whatever its name', async () => {
    const filePath = path.join(makeTempDirectory(), 'screenshot.dat');
    const png = Buffer.concat([PNG_SIGNATURE, Buffer.from([0x00, 0x00, 0x00, 0x0d, 0x49])]);
    fs.writeFileSync(filePath, png);

    await expect(readFilePreview(filePath)).resolves.toEqual({
      status: 'image',
      filePath,
      dataUrl: `data:image/png;base64,${png.toString('base64')}`,
    });
  });

  it('reads text named like an image as text', async () => {
    const filePath = path.join(makeTempDirectory(), 'notes.png');
    fs.writeFileSync(filePath, 'not really an image');

    await expect(readFilePreview(filePath)).resolves.toEqual({
      status: 'ok',
      filePath,
      content: 'not really an image',
    });
  });

  it('allows images past the text size cap up to the image cap', async () => {
    const directory = makeTempDirectory();
    const largeImage = path.join(directory, 'large.png');
    fs.writeFileSync(
      largeImage,
      Buffer.concat([PNG_SIGNATURE, Buffer.alloc(MAX_FILE_PREVIEW_BYTES)])
    );
    const hugeImage = path.join(directory, 'huge.png');
    fs.writeFileSync(
      hugeImage,
      Buffer.concat([PNG_SIGNATURE, Buffer.alloc(MAX_IMAGE_PREVIEW_BYTES)])
    );

    await expect(readFilePreview(largeImage)).resolves.toMatchObject({ status: 'image' });
    await expect(readFilePreview(hugeImage)).resolves.toEqual({
      status: 'too-large',
      filePath: hugeImage,
    });
  });

  it('refuses files over the size cap', async () => {
    const filePath = path.join(makeTempDirectory(), 'huge.log');
    fs.writeFileSync(filePath, Buffer.alloc(MAX_FILE_PREVIEW_BYTES + 1, 'a'));

    await expect(readFilePreview(filePath)).resolves.toEqual({ status: 'too-large', filePath });
  });
});

describe('sniffImageType', () => {
  it('recognizes common image formats by their leading bytes', () => {
    expect(sniffImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffImageType(Buffer.from('GIF89a', 'latin1'))).toBe('image/gif');
    expect(sniffImageType(Buffer.from('RIFF\x00\x00\x00\x00WEBPVP8 ', 'latin1'))).toBe(
      'image/webp'
    );
    expect(sniffImageType(Buffer.from('\x00\x00\x00\x1cftypavif', 'latin1'))).toBe('image/avif');
  });

  it('rejects look-alikes', () => {
    expect(sniffImageType(Buffer.from('XXXX\x00\x00\x00\x00WEBPVP8 ', 'latin1'))).toBeNull();
    expect(sniffImageType(Buffer.from('BMW service notes', 'latin1'))).toBeNull();
    expect(sniffImageType(Buffer.alloc(0))).toBeNull();
  });
});
