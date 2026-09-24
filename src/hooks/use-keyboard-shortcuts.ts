import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.code !== 'Space' || event.repeat || event.defaultPrevented ||
        event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (target instanceof Element && target.closest(
        'input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="slider"], [role="combobox"], [role="menuitem"], [role="dialog"]',
      )) return;
      event.preventDefault();
      useAppStore.getState().toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
