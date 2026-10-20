/**
 * Match a keydown against an Electron accelerator string such as
 * `CommandOrControl+K` or `Control+Shift+Tab`, for shortcuts the renderer
 * handles itself instead of registering them on the application menu.
 */

type KeyEventLike = Pick<
  KeyboardEvent,
  'key' | 'code' | 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'
>;

const KEY_ALIASES: Record<string, string> = {
  Space: ' ',
  Up: 'ArrowUp',
  Down: 'ArrowDown',
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
  Esc: 'Escape',
  Return: 'Enter',
  Plus: '+',
};

// Shift changes the character a punctuation key produces (`]` becomes `}`),
// so those keys compare by physical key instead.
const PUNCTUATION_CODES: Record<string, string> = {
  '-': 'Minus',
  '=': 'Equal',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  '\\': 'Backslash',
  ';': 'Semicolon',
  "'": 'Quote',
  ',': 'Comma',
  '.': 'Period',
  '/': 'Slash',
  '`': 'Backquote',
};

function keyMatches(event: KeyEventLike, key: string): boolean {
  if (PUNCTUATION_CODES[key]) return event.code === PUNCTUATION_CODES[key];
  if (/^[A-Z]$/i.test(key)) return event.code === `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return event.code === `Digit${key}`;
  return event.key.toLowerCase() === (KEY_ALIASES[key] ?? key).toLowerCase();
}

export function matchesAccelerator(
  event: KeyEventLike,
  accelerator: string | null | undefined,
  isMac: boolean
): boolean {
  if (!accelerator) return false;
  const parts = accelerator.split('+');
  const key = parts[parts.length - 1];
  const modifiers = new Set(parts.slice(0, -1));

  let wantMeta = modifiers.has('Command') || modifiers.has('Cmd') || modifiers.has('Super');
  let wantCtrl = modifiers.has('Control') || modifiers.has('Ctrl');
  if (modifiers.has('CommandOrControl') || modifiers.has('CmdOrCtrl')) {
    if (isMac) wantMeta = true;
    else wantCtrl = true;
  }
  const wantAlt = modifiers.has('Alt') || modifiers.has('Option');
  const wantShift = modifiers.has('Shift');

  return (
    event.metaKey === wantMeta &&
    event.ctrlKey === wantCtrl &&
    event.altKey === wantAlt &&
    event.shiftKey === wantShift &&
    keyMatches(event, key)
  );
}
