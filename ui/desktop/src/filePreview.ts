import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import path from 'node:path';
import { expandTilde } from './utils/pathUtils';

export const MAX_FILE_PREVIEW_BYTES = 2 * 1024 * 1024;

export type FilePreviewFailure = 'invalid-path' | 'missing' | 'not-file' | 'too-large' | 'binary';

export type FilePreviewResult =
  | { status: 'ok'; filePath: string; content: string }
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
    if (metadata.size > MAX_FILE_PREVIEW_BYTES) return { status: 'too-large', filePath };

    const bytes = await handle.readFile();
    if (bytes.length > MAX_FILE_PREVIEW_BYTES) return { status: 'too-large', filePath };
    if (bytes.includes(0)) return { status: 'binary', filePath };
    return { status: 'ok', filePath, content: bytes.toString('utf8') };
  } catch (error) {
    return { status: failureForError(error), filePath };
  } finally {
    await handle.close();
  }
}
