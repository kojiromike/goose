import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  FolderOpen,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  SquarePen,
  X,
} from 'lucide-react';
import { defineMessages, useIntl } from '../../i18n';
import type { FilePreviewResult } from '../../filePreview';
import { Button } from '../ui/button';
import MarkdownContent, { CodeBlock } from '../MarkdownContent';
import { FilePreviewBaseDirContext, useFilePreview } from './FilePreviewContext';

const i18n = defineMessages({
  expand: {
    id: 'filePreview.expand',
    defaultMessage: 'Show file preview',
  },
  collapse: {
    id: 'filePreview.collapse',
    defaultMessage: 'Collapse file preview',
  },
  close: {
    id: 'filePreview.close',
    defaultMessage: 'Close file preview',
  },
  reload: {
    id: 'filePreview.reload',
    defaultMessage: 'Reload file',
  },
  copyPath: {
    id: 'filePreview.copyPath',
    defaultMessage: 'Copy path',
  },
  reveal: {
    id: 'filePreview.reveal',
    defaultMessage: 'Show in folder',
  },
  openInEditor: {
    id: 'filePreview.openInEditor',
    defaultMessage: 'Open in text editor',
  },
  loading: {
    id: 'filePreview.loading',
    defaultMessage: 'Loading…',
  },
  missing: {
    id: 'filePreview.missing',
    defaultMessage: 'This file no longer exists.',
  },
  notFile: {
    id: 'filePreview.notFile',
    defaultMessage: 'This path is not a regular file.',
  },
  tooLarge: {
    id: 'filePreview.tooLarge',
    defaultMessage: 'This file is too large to preview.',
  },
  binary: {
    id: 'filePreview.binary',
    defaultMessage: 'This file is not text, so it cannot be previewed.',
  },
  error: {
    id: 'filePreview.error',
    defaultMessage: 'This file could not be read.',
  },
});

const COLLAPSED_WIDTH = 44;
const MAX_HIGHLIGHTED_CHARS = 200_000;
const MARKDOWN_EXTENSIONS = ['md', 'markdown', 'mdown', 'mdx'];
const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  cjs: 'javascript',
  htm: 'html',
  js: 'javascript',
  log: 'text',
  mjs: 'javascript',
  patch: 'diff',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  sh: 'bash',
  ts: 'typescript',
  txt: 'text',
  yml: 'yaml',
  zsh: 'bash',
};

const FAILURE_MESSAGES = {
  'invalid-path': i18n.missing,
  missing: i18n.missing,
  'not-file': i18n.notFile,
  'too-large': i18n.tooLarge,
  binary: i18n.binary,
  error: i18n.error,
} as const;

const baseName = (filePath: string) => filePath.slice(filePath.search(/[^\\/]*$/));
const directoryName = (filePath: string) => filePath.replace(/[\\/][^\\/]*$/, '');
const extension = (filePath: string) => {
  const match = /\.([\w-]+)$/.exec(baseName(filePath));
  return match ? match[1].toLowerCase() : '';
};

const FileContent: React.FC<{ filePath: string; content: string }> = ({ filePath, content }) => {
  const fileExtension = extension(filePath);
  if (MARKDOWN_EXTENSIONS.includes(fileExtension)) {
    return (
      <FilePreviewBaseDirContext.Provider value={directoryName(filePath)}>
        <MarkdownContent content={content} />
      </FilePreviewBaseDirContext.Provider>
    );
  }
  if (content.length > MAX_HIGHLIGHTED_CHARS) {
    return (
      <pre dir="ltr" className="whitespace-pre-wrap break-all font-mono text-sm text-text-primary">
        {content}
      </pre>
    );
  }
  return (
    <CodeBlock language={LANGUAGE_BY_EXTENSION[fileExtension] ?? (fileExtension || 'text')}>
      {content}
    </CodeBlock>
  );
};

export const FilePreviewPanel: React.FC = () => {
  const intl = useIntl();
  const filePreview = useFilePreview();
  const [result, setResult] = useState<FilePreviewResult | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; width: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filePath = filePreview?.filePath ?? null;
  const openCount = filePreview?.openCount ?? 0;
  const isExpanded = filePreview?.isExpanded ?? false;
  const width = filePreview?.width ?? 0;
  const setWidth = filePreview?.setWidth;

  useEffect(() => {
    if (filePath === null) {
      setResult(null);
      return;
    }
    let isCurrent = true;
    void window.electron
      .readFilePreview(filePath)
      .catch((): FilePreviewResult => ({ status: 'error', filePath }))
      .then((next) => {
        if (isCurrent) setResult(next);
      });
    return () => {
      isCurrent = false;
    };
  }, [filePath, openCount, reloadCount]);

  // The agent keeps editing the file it pointed at, so pick up changes when the user returns.
  useEffect(() => {
    if (filePath === null) return;
    const reload = () => setReloadCount((count) => count + 1);
    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, [filePath]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [filePath]);

  useEffect(() => {
    if (!setWidth) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      setWidth(dragStart.current.width + (dragStart.current.x - e.clientX));
    };
    const handleMouseUp = () => {
      if (dragStart.current) {
        dragStart.current = null;
        setIsDragging(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setWidth]);

  const handleCopyPath = useCallback(async () => {
    if (filePath === null) return;
    await navigator.clipboard.writeText(filePath);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [filePath]);

  if (!filePreview) return null;

  const isOpen = filePath !== null;
  const targetWidth = isOpen ? (isExpanded ? width : COLLAPSED_WIDTH) : 0;
  const isCurrentResult = result !== null && result.filePath === filePath;
  const toolbarButton = (label: string, onClick: () => void, icon: React.ReactNode) => (
    <Button
      onClick={onClick}
      className="no-drag flex-shrink-0 hover:!bg-background-tertiary"
      variant="ghost"
      size="xs"
      title={label}
      aria-label={label}
    >
      {icon}
    </Button>
  );

  return (
    <motion.div
      initial={false}
      animate={{ width: targetWidth }}
      transition={isDragging ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 40 }}
      style={{ height: '100%', maxWidth: isExpanded ? '65%' : undefined }}
      className={`relative flex-shrink-0 overflow-hidden h-full ${isOpen ? 'py-2 pr-2' : ''}`}
      data-testid="file-preview-panel"
    >
      {isOpen && !isExpanded && (
        <div className="no-drag flex h-full w-full flex-col items-center rounded-xl border border-border-primary pt-2">
          {toolbarButton(
            `${intl.formatMessage(i18n.expand)}: ${baseName(filePath)}`,
            () => filePreview.setIsExpanded(true),
            <PanelRightOpen className="w-4 h-4" />
          )}
        </div>
      )}

      {isOpen && isExpanded && (
        <>
          <div
            className="absolute left-0 top-0 h-full w-2 -translate-x-1 cursor-col-resize hover:bg-border-primary/30 transition-colors"
            onMouseDown={(e) => {
              dragStart.current = { x: e.clientX, width };
              setIsDragging(true);
              e.preventDefault();
            }}
          />
          <div className="no-drag flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border-primary bg-background-primary">
            <div className="flex items-center gap-0.5 border-b border-border-primary px-2 py-1.5">
              <span
                className="min-w-0 flex-1 truncate px-1 text-sm text-text-primary"
                title={filePath}
                dir="ltr"
              >
                {baseName(filePath)}
              </span>
              {toolbarButton(
                intl.formatMessage(i18n.reload),
                () => setReloadCount((count) => count + 1),
                <RefreshCw className="w-4 h-4" />
              )}
              {toolbarButton(
                intl.formatMessage(i18n.copyPath),
                () => void handleCopyPath(),
                copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />
              )}
              {toolbarButton(
                intl.formatMessage(i18n.reveal),
                () => void window.electron.revealFilePreview(filePath),
                <FolderOpen className="w-4 h-4" />
              )}
              {window.electron.platform === 'darwin' &&
                toolbarButton(
                  intl.formatMessage(i18n.openInEditor),
                  () => void window.electron.openFilePreviewInEditor(filePath),
                  <SquarePen className="w-4 h-4" />
                )}
              {toolbarButton(
                intl.formatMessage(i18n.collapse),
                () => filePreview.setIsExpanded(false),
                <PanelRightClose className="w-4 h-4" />
              )}
              {toolbarButton(
                intl.formatMessage(i18n.close),
                filePreview.closeFile,
                <X className="w-4 h-4" />
              )}
            </div>
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {!isCurrentResult && (
                <p className="text-sm text-text-secondary">{intl.formatMessage(i18n.loading)}</p>
              )}
              {isCurrentResult && result.status === 'ok' && (
                <FileContent filePath={result.filePath} content={result.content} />
              )}
              {isCurrentResult && result.status !== 'ok' && (
                <p className="text-sm text-text-secondary">
                  {intl.formatMessage(FAILURE_MESSAGES[result.status])}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
