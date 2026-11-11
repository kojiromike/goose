import { memo, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { defineMessages, useIntl } from '../i18n';

const i18n = defineMessages({
  showCode: {
    id: 'mermaidDiagram.showCode',
    defaultMessage: 'Show code',
  },
  showDiagram: {
    id: 'mermaidDiagram.showDiagram',
    defaultMessage: 'Show diagram',
  },
  renderFailed: {
    id: 'mermaidDiagram.renderFailed',
    defaultMessage: 'Could not render diagram: {error}',
  },
});

// Wait this long after the source stops changing before rendering, so a
// diagram streaming in is not re-parsed on every token.
const RENDER_DEBOUNCE_MS = 250;

type MermaidTheme = 'dark' | 'default';

// Load mermaid on first use: it is large and most messages never need it.
let mermaidModule: Promise<typeof import('mermaid').default> | null = null;
function loadMermaid() {
  mermaidModule ??= import('mermaid').then((m) => m.default);
  return mermaidModule;
}

// mermaid's config is global, so serialize initialize+render pairs to keep a
// render from picking up another diagram's theme.
let renderQueue: Promise<unknown> = Promise.resolve();
let renderCounter = 0;

async function renderMermaid(code: string, theme: MermaidTheme): Promise<string> {
  const mermaid = await loadMermaid();
  const run = renderQueue.then(async () => {
    mermaid.initialize({
      startOnLoad: false,
      // Diagram source comes from the model: sanitize labels and disable
      // click handlers and embedded scripts.
      securityLevel: 'strict',
      theme,
    });
    // Parse first: a failed render leaves error nodes behind in document.body.
    await mermaid.parse(code);
    renderCounter += 1;
    const { svg } = await mermaid.render(`goose-mermaid-${renderCounter}`, code);
    return svg;
  });
  renderQueue = run.catch(() => undefined);
  return run;
}

function subscribeToThemeClass(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function getThemeFromDocument(): MermaidTheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'default';
}

// Read the theme from the document rather than ThemeContext, because markdown
// also renders outside the ThemeProvider (modals, tests).
function useMermaidTheme(): MermaidTheme {
  return useSyncExternalStore(subscribeToThemeClass, getThemeFromDocument, () => 'default');
}

type RenderState =
  { status: 'pending' } | { status: 'rendered'; svg: string } | { status: 'failed'; error: string };

// Render a mermaid fence as a diagram. `children` is the source view, shown
// until the first render succeeds, when rendering fails, and on request.
export const MermaidDiagram = memo(function MermaidDiagram({
  code,
  children,
}: {
  code: string;
  children: ReactNode;
}) {
  const intl = useIntl();
  const theme = useMermaidTheme();
  const [state, setState] = useState<RenderState>({ status: 'pending' });
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    let canceled = false;
    const timer = window.setTimeout(() => {
      renderMermaid(code, theme).then(
        (svg) => {
          if (!canceled) setState({ status: 'rendered', svg });
        },
        (err: unknown) => {
          if (canceled) return;
          const error = err instanceof Error ? err.message : String(err);
          setState({ status: 'failed', error });
        }
      );
    }, RENDER_DEBOUNCE_MS);
    return () => {
      canceled = true;
      window.clearTimeout(timer);
    };
  }, [code, theme]);

  // Keep showing the last good diagram while a newer version is pending, so
  // a streaming diagram does not flash back to source between renders.
  if (state.status !== 'rendered' || showCode) {
    return (
      <div className="w-full" dir="ltr">
        {state.status === 'rendered' && (
          <ToggleButton
            label={intl.formatMessage(i18n.showDiagram)}
            onClick={() => setShowCode(false)}
          />
        )}
        {children}
        {state.status === 'failed' && (
          <p className="mt-1 text-xs text-text-secondary">
            {intl.formatMessage(i18n.renderFailed, { error: state.error.split('\n')[0] })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative group w-full" dir="ltr" data-testid="mermaid-diagram">
      <ToggleButton label={intl.formatMessage(i18n.showCode)} onClick={() => setShowCode(true)} />
      <div
        className="w-full overflow-x-auto flex justify-center py-2 [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: state.svg }}
      />
    </div>
  );
});

function ToggleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="mb-1 px-2 py-0.5 rounded text-xs text-text-secondary hover:text-text-primary hover:bg-background-secondary"
      >
        {label}
      </button>
    </div>
  );
}
