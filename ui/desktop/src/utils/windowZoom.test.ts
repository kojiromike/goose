import { describe, expect, it } from 'vitest';
import type { BrowserWindow } from 'electron';
import { keepZoomAcrossNavigation, type ZoomStore } from './windowZoom';

type Listener = (...args: unknown[]) => void;

// Model Chromium's zoom map: one level per full URL, defaulting to 0.
function createWindow(levels: Map<string, number>, initialUrl: string) {
  const listeners = new Map<string, Listener[]>();
  let url = initialUrl;
  const on = (event: string, listener: Listener) => {
    listeners.set(event, [...(listeners.get(event) ?? []), listener]);
  };
  const emit = (event: string, ...args: unknown[]) =>
    (listeners.get(event) ?? []).forEach((listener) => listener(...args));

  const webContents = {
    on,
    isDestroyed: () => false,
    getZoomLevel: () => levels.get(url) ?? 0,
    setZoomLevel: (level: number) => levels.set(url, level),
  };
  const window = { webContents, on } as unknown as BrowserWindow;

  return {
    window,
    zoom: (level: number) => levels.set(url, level),
    level: () => webContents.getZoomLevel(),
    load: (next: string = url) => {
      emit('did-start-navigation', { isMainFrame: true, isSameDocument: false });
      url = next;
      emit('did-finish-load');
    },
    navigateInPage: (next: string) => {
      emit('did-start-navigation', { isMainFrame: true, isSameDocument: true });
      url = next;
      emit('did-navigate-in-page', {}, next, true);
    },
    close: () => emit('close'),
  };
}

function createStore(initial = 0): ZoomStore & { level: () => number } {
  let level = initial;
  return {
    get: () => level,
    set: (next) => {
      level = next;
    },
    level: () => level,
  };
}

describe('keepZoomAcrossNavigation', () => {
  it('carries the zoom level to another route', () => {
    const store = createStore();
    const win = createWindow(new Map(), '#/pair');
    keepZoomAcrossNavigation(win.window, store);
    win.load();

    win.zoom(1.5);
    win.navigateInPage('#/pair?resumeSessionId=a');
    expect(win.level()).toBe(1.5);

    win.navigateInPage('#/pair?resumeSessionId=b');
    expect(win.level()).toBe(1.5);
    expect(store.level()).toBe(1.5);
  });

  it('applies the saved level to a new window', () => {
    const store = createStore(1);
    const win = createWindow(new Map(), '#/');
    keepZoomAcrossNavigation(win.window, store);
    win.load();

    expect(win.level()).toBe(1);
    expect(store.level()).toBe(1);
  });

  it('keeps a level changed just before a reload or close', () => {
    const store = createStore();
    const win = createWindow(new Map(), '#/pair');
    keepZoomAcrossNavigation(win.window, store);
    win.load();

    win.zoom(0.5);
    win.load();
    expect(win.level()).toBe(0.5);

    win.zoom(-1);
    win.close();
    expect(store.level()).toBe(-1);
  });

  it('lets a reset to 100% stick over a zoom saved for the next URL', () => {
    const store = createStore(1.5);
    const win = createWindow(new Map([['#/pair?resumeSessionId=a', 1.5]]), '#/pair');
    keepZoomAcrossNavigation(win.window, store);
    win.load();

    win.zoom(0);
    win.navigateInPage('#/pair?resumeSessionId=a');
    expect(win.level()).toBe(0);
  });

  it('picks up a level set in another window on the next navigation', () => {
    const store = createStore();
    const levels = new Map<string, number>();
    const first = createWindow(levels, '#/pair?resumeSessionId=a');
    const second = createWindow(levels, '#/pair?resumeSessionId=b');
    keepZoomAcrossNavigation(first.window, store);
    keepZoomAcrossNavigation(second.window, store);
    first.load();
    second.load();

    second.zoom(2);
    second.navigateInPage('#/pair?resumeSessionId=c');
    first.navigateInPage('#/pair?resumeSessionId=d');
    expect(first.level()).toBe(2);
  });
});
