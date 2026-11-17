import type { BrowserWindow } from 'electron';
import log from './logger';

const CRASH_LOOP_LIMIT = 3;
const CRASH_LOOP_WINDOW_MS = 60_000;

export function createCrashLoopGuard(
  limit = CRASH_LOOP_LIMIT,
  windowMs = CRASH_LOOP_WINDOW_MS
): (now: number) => boolean {
  let crashes: number[] = [];
  return (now) => {
    crashes = [...crashes.filter((at) => now - at < windowMs), now];
    return crashes.length <= limit;
  };
}

// Without this, a dead renderer leaves the window blank for good: Chromium never restarts it,
// and the window's own Cmd+R handler needs a live renderer to receive the keystroke.
export function recoverFromRendererCrashes(window: BrowserWindow, now: () => number = Date.now) {
  const allowReload = createCrashLoopGuard();
  let loadedAt = now();

  window.webContents.on('did-finish-load', () => {
    loadedAt = now();
  });

  window.webContents.on('render-process-gone', (_event, { reason, exitCode }) => {
    if (window.isDestroyed()) {
      return;
    }
    const reload = allowReload(now());
    const uptimeSeconds = Math.round((now() - loadedAt) / 1000);
    log.error(
      `Renderer for window ${window.id} is gone: reason=${reason} exitCode=${exitCode} ` +
        `uptime=${uptimeSeconds}s; ${reload ? 'reloading' : 'crash loop, not reloading'}`
    );
    if (reload) {
      window.webContents.reload();
    }
  });

  window.on('unresponsive', () => {
    log.warn(`Renderer for window ${window.id} is unresponsive`);
  });
  window.on('responsive', () => {
    log.info(`Renderer for window ${window.id} is responsive again`);
  });
}
