import { useEffect, useState } from 'react';
import { defaultKeyboardShortcuts, type KeyboardShortcuts } from '../utils/settings';

/** The configured shortcuts, kept current as they are edited in any window. */
export function useKeyboardShortcuts(): KeyboardShortcuts {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcuts>(defaultKeyboardShortcuts);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const stored = await window.electron.getSetting('keyboardShortcuts');
      if (!cancelled) setShortcuts({ ...defaultKeyboardShortcuts, ...stored });
    };
    void load();
    const handleSettingsChanged = (_event: unknown, payload: unknown) => {
      if ((payload as { key?: string })?.key === 'keyboardShortcuts') void load();
    };
    window.electron.on('settings-changed', handleSettingsChanged);
    return () => {
      cancelled = true;
      window.electron.off('settings-changed', handleSettingsChanged);
    };
  }, []);

  return shortcuts;
}
