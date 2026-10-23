import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import path from 'node:path';
import { expandTilde } from './utils/pathUtils';

export const MAX_FILE_PREVIEW_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGE_PREVIEW_BYTES = 20 * 1024 * 1024;

export type FilePreviewFailure = 'invalid-path' | 'missing' | 'not-file' | 'too-large' | 'binary';

export type FilePreviewResult =
  | { status: 'ok'; filePath: string; content: string }
  | { status: 'image'; filePath: string; dataUrl: string }
  | { status: FilePreviewFailure | 'error'; filePath: string };

// Accept `path:line` and `path:line:col`, the way compilers and agents cite code.
const LINE_SUFFIX = /:\d+(?::\d+)?$/;

export function resolvePreviewPath(rawPath: unknown, baseDir?: unknown): string | null {
  if (typeof rawPath !== 'string') return null;
  const trimmed = rawPath.trim().replace(LINE_SUFFIX, '');
  if (trimmed === '' || trimmed.includes('\0')) return null;

  const expanded = expandTilde(trimmed);
  if (path.isAbsolute(expanded)) return path.normalize(expanded);

  if (typeof baseDir !== 'string' || baseDir === '') return null;
  const expandedBase = expandTilde(baseDir);
  if (!path.isAbsolute(expandedBase)) return null;
  return path.resolve(expandedBase, expanded);
}

// Identify images by their leading bytes, so a misnamed file still previews and a text
// file named `.png` still reads as text. BMP is left out: its `BM` magic also starts prose.
// Each signature lists [offset, bytes] pairs that must all match.
const IMAGE_SIGNATURES: ReadonlyArray<{
  mimeType: string;
  parts: ReadonlyArray<readonly [number, Buffer]>;
}> = [
  {
    mimeType: 'image/png',
    parts: [[0, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])]],
  },
  { mimeType: 'image/jpeg', parts: [[0, Buffer.from([0xff, 0xd8, 0xff])]] },
  { mimeType: 'image/gif', parts: [[0, Buffer.from('GIF87a', 'latin1')]] },
  { mimeType: 'image/gif', parts: [[0, Buffer.from('GIF89a', 'latin1')]] },
  {
    mimeType: 'image/webp',
    parts: [
      [0, Buffer.from('RIFF', 'latin1')],
      [8, Buffer.from('WEBP', 'latin1')],
    ],
  },
  { mimeType: 'image/avif', parts: [[4, Buffer.from('ftypavif', 'latin1')]] },
  { mimeType: 'image/x-icon', parts: [[0, Buffer.from([0x00, 0x00, 0x01, 0x00])]] },
];
const IMAGE_HEADER_BYTES = 16;

export function sniffImageType(header: Buffer): string | null {
  const signature = IMAGE_SIGNATURES.find(({ parts }) =>
    parts.every(([offset, bytes]) => header.subarray(offset, offset + bytes.length).equals(bytes))
  );
  return signature?.mimeType ?? null;
}

function failureForError(error: unknown): FilePreviewFailure | 'error' {
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 'ENOENT' || code === 'ENOTDIR') return 'missing';
  if (code === 'EISDIR') return 'not-file';
  return 'error';
}

export async function isPreviewableFile(filePath: string): Promise<boolean> {
  try {
    return (await fs.stat(filePath)).isFile();
  } catch {
    return false;
  }
}

export async function readFilePreview(filePath: string): Promise<FilePreviewResult> {
  // O_NONBLOCK keeps a FIFO or device node from hanging the open before fstat rejects it.
  const nonBlocking = process.platform === 'win32' ? 0 : fsConstants.O_NONBLOCK;
  let handle: fs.FileHandle;
  try {
    handle = await fs.open(filePath, fsConstants.O_RDONLY | nonBlocking);
  } catch (error) {
    return { status: failureForError(error), filePath };
  }

  try {
    const metadata = await handle.stat();
    if (!metadata.isFile()) return { status: 'not-file', filePath };

    // A positional read leaves the file position at 0 for the readFile below.
    const header = Buffer.alloc(IMAGE_HEADER_BYTES);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    const mimeType = sniffImageType(header.subarray(0, bytesRead));
    const maxBytes = mimeType === null ? MAX_FILE_PREVIEW_BYTES : MAX_IMAGE_PREVIEW_BYTES;
    if (metadata.size > maxBytes) return { status: 'too-large', filePath };

    const bytes = await handle.readFile();
    if (bytes.length > maxBytes) return { status: 'too-large', filePath };
    if (mimeType !== null) {
      return {
        status: 'image',
        filePath,
        dataUrl: `data:${mimeType};base64,${bytes.toString('base64')}`,
      };
    }
    if (bytes.includes(0)) return { status: 'binary', filePath };
    return { status: 'ok', filePath, content: bytes.toString('utf8') };
  } catch (error) {
    return { status: failureForError(error), filePath };
  } finally {
    await handle.close();
  }
}
