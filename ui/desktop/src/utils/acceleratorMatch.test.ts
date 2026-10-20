import { describe, expect, it } from 'vitest';
import { matchesAccelerator } from './acceleratorMatch';

function keydown(init: Partial<KeyboardEvent> & Pick<KeyboardEvent, 'key' | 'code'>) {
  return { metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...init };
}

describe('matchesAccelerator', () => {
  it('maps CommandOrControl to Command on macOS and Control elsewhere', () => {
    const cmdK = keydown({ key: 'k', code: 'KeyK', metaKey: true });
    const ctrlK = keydown({ key: 'k', code: 'KeyK', ctrlKey: true });
    expect(matchesAccelerator(cmdK, 'CommandOrControl+K', true)).toBe(true);
    expect(matchesAccelerator(ctrlK, 'CommandOrControl+K', true)).toBe(false);
    expect(matchesAccelerator(ctrlK, 'CommandOrControl+K', false)).toBe(true);
    expect(matchesAccelerator(cmdK, 'CommandOrControl+K', false)).toBe(false);
  });

  it('keeps Control literal on macOS', () => {
    const ctrlTab = keydown({ key: 'Tab', code: 'Tab', ctrlKey: true });
    expect(matchesAccelerator(ctrlTab, 'Control+Tab', true)).toBe(true);
    expect(matchesAccelerator({ ...ctrlTab, shiftKey: true }, 'Control+Tab', true)).toBe(false);
    expect(matchesAccelerator({ ...ctrlTab, shiftKey: true }, 'Control+Shift+Tab', true)).toBe(
      true
    );
  });

  it('requires the exact set of modifiers', () => {
    const cmdShiftK = keydown({ key: 'K', code: 'KeyK', metaKey: true, shiftKey: true });
    expect(matchesAccelerator(cmdShiftK, 'CommandOrControl+K', true)).toBe(false);
    expect(matchesAccelerator(cmdShiftK, 'CommandOrControl+Shift+K', true)).toBe(true);
  });

  it('matches letters by physical key so Option and layouts do not change them', () => {
    const optionK = keydown({ key: '˚', code: 'KeyK', metaKey: true, altKey: true });
    expect(matchesAccelerator(optionK, 'CommandOrControl+Alt+K', true)).toBe(true);
  });

  it('matches shifted punctuation by physical key', () => {
    const cmdShiftBracket = keydown({
      key: '}',
      code: 'BracketRight',
      metaKey: true,
      shiftKey: true,
    });
    expect(matchesAccelerator(cmdShiftBracket, 'CommandOrControl+Shift+]', true)).toBe(true);
  });

  it('matches named keys through their Electron aliases', () => {
    const altUp = keydown({ key: 'ArrowUp', code: 'ArrowUp', altKey: true });
    expect(matchesAccelerator(altUp, 'Alt+Up', true)).toBe(true);
  });

  it('never matches a disabled shortcut', () => {
    const cmdK = keydown({ key: 'k', code: 'KeyK', metaKey: true });
    expect(matchesAccelerator(cmdK, null, true)).toBe(false);
    expect(matchesAccelerator(cmdK, '', true)).toBe(false);
  });
});
