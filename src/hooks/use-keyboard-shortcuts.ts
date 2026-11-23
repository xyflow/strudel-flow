import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useGraphHistory } from './use-graph-history';

export function useKeyboardShortcuts() {
  const { undo, redo } = useGraphHistory();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.defaultPrevented || event.isComposing) return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="dialog"]',
        )
      )
        return;

      if ((event.metaKey || event.ctrlKey) && !event.altKey) {
        const key = event.key.toLowerCase();
        if (key === 'z') {
          event.preventDefault();
          if (event.shiftKey) redo();
          else undo();
        } else if (key === 'y' && !event.shiftKey) {
          event.preventDefault();
          redo();
        }

        return;
      }

      if (
        event.code !== 'Space' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      if (
        target instanceof Element &&
        target.closest(
          'button, a, [role="button"], [role="slider"], [role="menuitem"]',
        )
      )
        return;
      event.preventDefault();
      useAppStore.getState().toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);
}
