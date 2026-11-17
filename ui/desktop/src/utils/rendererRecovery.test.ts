import { EventEmitter } from 'node:events';
import type { BrowserWindow } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import log from './logger';
import { createCrashLoopGuard, recoverFromRendererCrashes } from './rendererRecovery';

vi.mock('./logger', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

class FakeWindow extends EventEmitter {
  id = 7;
  destroyed = false;
  webContents = Object.assign(new EventEmitter(), { reload: vi.fn() });
  isDestroyed() {
    return this.destroyed;
  }
}

function crash(window: FakeWindow, reason = 'crashed', exitCode = 11) {
  window.webContents.emit('render-process-gone', {}, { reason, exitCode });
}

describe('createCrashLoopGuard', () => {
  it('allows reloads up to the limit within the window', () => {
    const allow = createCrashLoopGuard(2, 1000);
    expect(allow(0)).toBe(true);
    expect(allow(100)).toBe(true);
    expect(allow(200)).toBe(false);
  });

  it('forgets crashes older than the window', () => {
    const allow = createCrashLoopGuard(1, 1000);
    expect(allow(0)).toBe(true);
    expect(allow(1000)).toBe(true);
  });
});

describe('recoverFromRendererCrashes', () => {
  let window: FakeWindow;
  let clock: number;

  beforeEach(() => {
    vi.clearAllMocks();
    clock = 0;
    window = new FakeWindow();
    recoverFromRendererCrashes(window as unknown as BrowserWindow, () => clock);
  });

  it('logs the exit and reloads the window', () => {
    clock = 90_000;
    crash(window, 'oom', 5);

    expect(window.webContents.reload).toHaveBeenCalledOnce();
    expect(log.error).toHaveBeenCalledWith(
      'Renderer for window 7 is gone: reason=oom exitCode=5 uptime=90s; reloading'
    );
  });

  it('measures uptime from the latest load', () => {
    clock = 50_000;
    window.webContents.emit('did-finish-load');
    clock = 53_000;
    crash(window);

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('uptime=3s'));
  });

  it('stops reloading in a crash loop', () => {
    for (let i = 0; i < 4; i++) {
      crash(window);
    }

    expect(window.webContents.reload).toHaveBeenCalledTimes(3);
    expect(log.error).toHaveBeenLastCalledWith(
      expect.stringContaining('crash loop, not reloading')
    );
  });

  it('ignores a renderer that goes away with its window', () => {
    window.destroyed = true;
    crash(window, 'clean-exit', 0);

    expect(window.webContents.reload).not.toHaveBeenCalled();
    expect(log.error).not.toHaveBeenCalled();
  });
});
