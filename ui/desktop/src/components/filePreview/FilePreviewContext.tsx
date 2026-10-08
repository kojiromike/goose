import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { filePathCandidate } from '../../utils/filePathCandidate';

export const MIN_FILE_PREVIEW_WIDTH = 280;
export const MAX_FILE_PREVIEW_WIDTH = 1200;
const DEFAULT_FILE_PREVIEW_WIDTH = 520;
const WIDTH_STORAGE_KEY = 'file_preview_width';
const MISSING_FILE_RETRY_MS = 5000;

interface FilePreviewContextValue {
  filePath: string | null;
  /** Increments on every open so that re-opening the same file reloads it. */
  openCount: number;
  isExpanded: boolean;
  width: number;
  openFile: (filePath: string) => void;
  closeFile: () => void;
  setIsExpanded: (expanded: boolean) => void;
  setWidth: (width: number) => void;
}

const FilePreviewContext = createContext<FilePreviewContextValue | null>(null);

/** Directory that relative paths in the surrounding markdown resolve against. */
export const FilePreviewBaseDirContext = createContext<string | undefined>(undefined);

/** Returns null outside a FilePreviewProvider, where paths stay plain text. */
export const useFilePreview = () => useContext(FilePreviewContext);

export const FilePreviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [openCount, setOpenCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [width, setWidthState] = useState<number>(() => {
    const parsed = parseInt(localStorage.getItem(WIDTH_STORAGE_KEY) ?? '', 10);
    return parsed >= MIN_FILE_PREVIEW_WIDTH && parsed <= MAX_FILE_PREVIEW_WIDTH
      ? parsed
      : DEFAULT_FILE_PREVIEW_WIDTH;
  });

  const openFile = useCallback((nextFilePath: string) => {
    setFilePath(nextFilePath);
    setOpenCount((count) => count + 1);
    setIsExpanded(true);
  }, []);

  const closeFile = useCallback(() => {
    setFilePath(null);
    setIsExpanded(false);
  }, []);

  const setWidth = useCallback((nextWidth: number) => {
    const clamped = Math.min(MAX_FILE_PREVIEW_WIDTH, Math.max(MIN_FILE_PREVIEW_WIDTH, nextWidth));
    setWidthState(clamped);
    localStorage.setItem(WIDTH_STORAGE_KEY, String(clamped));
  }, []);

  const value = useMemo(
    () => ({
      filePath,
      openCount,
      isExpanded,
      width,
      openFile,
      closeFile,
      setIsExpanded,
      setWidth,
    }),
    [filePath, openCount, isExpanded, width, openFile, closeFile, setWidth]
  );

  return <FilePreviewContext.Provider value={value}>{children}</FilePreviewContext.Provider>;
};

interface Resolution {
  promise: Promise<string | null>;
  missingSince?: number;
}

const resolutions = new Map<string, Resolution>();

export function resolvePreviewableFile(
  rawPath: string,
  baseDir: string | undefined
): Promise<string | null> {
  const key = `${baseDir ?? ''}\0${rawPath}`;
  const cached = resolutions.get(key);
  // A file the agent is about to write does not exist yet, so let misses expire.
  const isStaleMiss =
    cached?.missingSince !== undefined && Date.now() - cached.missingSince > MISSING_FILE_RETRY_MS;
  if (cached && !isStaleMiss) return cached.promise;

  const resolution: Resolution = {
    promise: window.electron
      .resolveFilePreview(rawPath, baseDir)
      .catch(() => null)
      .then((resolved) => {
        if (resolved === null) resolution.missingSince = Date.now();
        return resolved;
      }),
  };
  resolutions.set(key, resolution);
  return resolution.promise;
}

/** Resolve inline code to an existing file path, or null when it is not one. */
export function usePreviewableFile(text: string | null): string | null {
  const isEnabled = useFilePreview() !== null;
  const baseDir = useContext(FilePreviewBaseDirContext);
  const candidate = useMemo(
    () => (isEnabled && text !== null ? filePathCandidate(text) : null),
    [isEnabled, text]
  );
  const [resolved, setResolved] = useState<{ candidate: string; filePath: string } | null>(null);

  useEffect(() => {
    if (candidate === null) return;
    let isCurrent = true;
    void resolvePreviewableFile(candidate, baseDir).then((filePath) => {
      if (isCurrent && filePath !== null) setResolved({ candidate, filePath });
    });
    return () => {
      isCurrent = false;
    };
  }, [candidate, baseDir]);

  return resolved !== null && resolved.candidate === candidate ? resolved.filePath : null;
}
