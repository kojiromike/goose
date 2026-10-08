const MAX_CANDIDATE_LENGTH = 1024;
const SHELL_OR_GLOB_CHARS = /[<>|*?"`$;&(){}[\]=,]/;
const RELATIVE_PATH = /^[\w.@+\-/~]+$/;
const HAS_SCHEME = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const LINE_SUFFIX = /:\d+(?::\d+)?$/;
const WINDOWS_DRIVE_PATHNAME = /^\/[A-Za-z]:\//;

/**
 * Decide whether inline code is worth asking the main process about. This only
 * filters out text that cannot be a path; the main process confirms the file exists.
 */
export function filePathCandidate(text: string): string | null {
  const candidate = text.trim();
  if (candidate.length < 2 || candidate.length > MAX_CANDIDATE_LENGTH) return null;
  if (candidate.includes('\n') || SHELL_OR_GLOB_CHARS.test(candidate)) return null;

  const withoutLine = candidate.replace(LINE_SUFFIX, '');
  if (withoutLine.endsWith('/')) return null;

  if (withoutLine.startsWith('~/')) return candidate;
  if (withoutLine.startsWith('/')) return withoutLine.startsWith('//') ? null : candidate;

  if (HAS_SCHEME.test(withoutLine) || !RELATIVE_PATH.test(withoutLine)) return null;
  const baseName = withoutLine.slice(withoutLine.lastIndexOf('/') + 1);
  const hasDirectory = withoutLine.includes('/');
  const hasExtension = /[^.]\.[A-Za-z][\w-]*$/.test(baseName);
  return hasDirectory || hasExtension ? candidate : null;
}

/** Map a link target to a path when it is not a URL another application should open. */
export function filePathFromHref(href: string): string | null {
  const target = href.trim();
  if (target === '' || target.startsWith('#')) return null;

  if (/^file:/i.test(target)) {
    try {
      const pathname = decodeURIComponent(new URL(target).pathname);
      return WINDOWS_DRIVE_PATHNAME.test(pathname) ? pathname.slice(1) : pathname;
    } catch {
      return null;
    }
  }
  if (target.startsWith('//') || HAS_SCHEME.test(target)) return null;

  const withoutFragment = target.replace(/[?#].*$/, '');
  try {
    return decodeURIComponent(withoutFragment);
  } catch {
    return withoutFragment;
  }
}
