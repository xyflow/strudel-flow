import { Check, Settings2 } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { themes } from '@/data/css/themes';
import { useAppStore } from '@/store/app-store';
import { ControlButton } from './control-button';

const colorModes = ['system', 'light', 'dark'] as const;
type ColorMode = (typeof colorModes)[number];
const colorModeKey = 'strudel-flow:color-mode';

function loadColorMode(): ColorMode {
  try {
    const saved = window.localStorage.getItem(colorModeKey);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage may be unavailable in some browsing contexts.
  }
  return 'system';
}

export function AppearancePopover() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const [colorMode, setColorMode] = useState(loadColorMode);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (colorMode === 'system') {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = colorMode;
    }

    try {
      if (colorMode === 'system') {
        window.localStorage.removeItem(colorModeKey);
      } else {
        window.localStorage.setItem(colorModeKey, colorMode);
      }
    } catch {
      // The current selection still applies when storage is unavailable.
    }
  }, [colorMode]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ControlButton title="Appearance settings">
          <Settings2 className="size-4" />
        </ControlButton>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        aria-label="Appearance settings"
        className="nowheel max-h-[calc(100dvh-100px)] w-[min(420px,calc(100vw-24px))] overflow-y-auto rounded-lg p-4"
      >
        <h3 className="mb-3 text-sm font-medium">Color mode</h3>
        <div role="group" aria-label="Color mode" className="mb-4 flex gap-2">
          {colorModes.map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={colorMode === mode}
              onClick={() => setColorMode(mode)}
              className="flex-1 rounded-md border px-3 py-2 text-xs capitalize hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring aria-pressed:border-primary aria-pressed:bg-primary/10"
            >
              {mode}
            </button>
          ))}
        </div>
        <h3 className="mb-3 border-t pt-3 text-sm font-medium">Color theme</h3>
        <div
          role="group"
          aria-label="Color theme"
          className="grid grid-cols-2 gap-2"
        >
          {themes.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={theme === option.value}
              onClick={() => setTheme(option.value)}
              className="flex min-w-0 items-center gap-2 rounded-md border p-2 text-left text-xs transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring aria-pressed:border-primary aria-pressed:bg-primary/10"
            >
              <span
                aria-hidden="true"
                className="size-6 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: option.color }}
              />
              <span className="min-w-0 flex-1">{option.label}</span>
              {theme === option.value && (
                <Check
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-primary"
                />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
