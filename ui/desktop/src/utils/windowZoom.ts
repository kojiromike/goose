import type { BrowserWindow } from 'electron';

export interface ZoomStore {
  get(): number;
  set(level: number): void;
}

/**
 * Keep one zoom level for the whole app.
 *
 * Chromium remembers page zoom per host, and per full URL for pages that have
 * no host. The renderer loads from file:// under a HashRouter, so the route and
 * the session id are part of that key: opening another session, or a new chat
 * receiving its session id, lands on a URL with no saved zoom and the page
 * snaps back to 100%.
 *
 * Read the level just before each navigation, while it still belongs to the
 * old URL, and put it back once the new URL commits.
 */
export function keepZoomAcrossNavigation(window: BrowserWindow, store: ZoomStore): void {
  const webContents = window.webContents;
  let loaded = false;
  let applied = store.get();

  // Record a level the user picked since this window last applied one.
  const capture = () => {
    if (!loaded || webContents.isDestroyed()) {
      return;
    }
    const level = webContents.getZoomLevel();
    if (level !== applied) {
      applied = level;
      store.set(level);
    }
  };

  const apply = () => {
    applied = store.get();
    if (webContents.getZoomLevel() !== applied) {
      webContents.setZoomLevel(applied);
    }
  };

  webContents.on('did-start-navigation', (details) => {
    if (details.isMainFrame) {
      capture();
    }
  });
  webContents.on('did-navigate-in-page', (_event, _url, isMainFrame) => {
    if (isMainFrame) {
      apply();
    }
  });
  webContents.on('did-finish-load', () => {
    loaded = true;
    apply();
  });
  window.on('close', capture);
}
