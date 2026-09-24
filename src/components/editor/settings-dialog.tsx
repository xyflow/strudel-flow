import { Settings2, Moon, Sun, Palette, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppStore } from '@/store/app-store';

import { themes } from '@/data/css/themes';

function ThemeCard({
  theme,
  isSelected,
  onClick,
}: {
  theme: (typeof themes)[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-3 rounded-md border-2 transition-all duration-200 text-left
          group
        ${
          isSelected
            ? 'border-primary bg-primary/5 '
            : 'border-border hover:border-primary/50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-white  flex-shrink-0"
          style={{ backgroundColor: theme.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{theme.label}</div>
        </div>
        {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
      </div>
    </button>
  );
}

type SettingsDialogProps = {
  children?: React.ReactNode;
};

export function SettingsDialog({ children }: SettingsDialogProps) {
  const theme = useAppStore((state) => state.theme);
  const colorMode = useAppStore((state) => state.colorMode);
  const setTheme = useAppStore((state) => state.setTheme);
  const setColorMode = useAppStore((state) => state.setColorMode);


  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <button
            className="rounded p-2 transition-colors bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
            title="Settings"
          >
            <Settings2 className="size-5" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings2 className="w-5 h-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dark Mode Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10">
                {colorMode === 'dark' ? (
                  <Moon className="w-4 h-4 text-primary" />
                ) : (
                  <Sun className="w-4 h-4 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                  Follow your system or choose a light or dark appearance
                </p>
              </div>
            </div>
            <div role="group" aria-label="Color mode" className="flex gap-2">
              {(['system', 'light', 'dark'] as const).map(mode => (
                <button key={mode} type="button" aria-pressed={colorMode === mode}
                  onClick={() => setColorMode(mode)}
                  className="flex-1 rounded-md border px-3 py-2 text-sm capitalize hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10">
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10">
                <Palette className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Theme</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color scheme
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((themeOption) => (
                <ThemeCard
                  key={themeOption.value}
                  theme={themeOption}
                  isSelected={themeOption.value === theme}
                  onClick={() => setTheme(themeOption.value)}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
