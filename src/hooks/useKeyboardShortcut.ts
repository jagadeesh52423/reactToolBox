'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutOptions {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: ShortcutOptions = { ctrl: true }
) {
  const { ctrl = false, shift = false, alt = false } = options;

  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (ctrl && !(e.ctrlKey || e.metaKey)) return;
      if (shift && !e.shiftKey) return;
      if (alt && !e.altKey) return;
      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      // Don't fire if user is typing in an input/textarea (unless it's a global shortcut)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isInput && key.toLowerCase() !== 'k') return;

      e.preventDefault();
      callback();
    },
    [key, ctrl, shift, alt, callback]
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
