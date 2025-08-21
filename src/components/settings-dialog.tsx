import { Settings2, Moon, Sun, Palette, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/app-context';
import { useThemeCss } from '@/hooks/use-theme-css';

// Theme configurations with colors and descriptions
const themes = [
  {
    value: 'supabase',
    label: 'Supabase',
    color: 'oklch(0.8348 0.1302 160.9080)',
  },
  {
    value: 'sunset-horizon',
    label: 'Sunset Horizon',
    color: 'oklch(0.7686 0.1647 70.0804)',
  },
  {
    value: 'bold-tech',
    label: 'Bold Tech',
    color: 'oklch(0.6489 0.237 200)',
  },
  {
    value: 'catppuccin',
    label: 'Catppuccin',
    color: 'oklch(0.7647 0.1596 267.8947)',
  },
  {
    value: 'claymorphism',
    label: 'Claymorphism',
    color: 'oklch(0.8 0.15 25)',
  },
  {
    value: 'cosmic-night',
    label: 'Cosmic Night',
    color: 'oklch(0.5417 0.179 288.0332)',
  },
  {
    value: 'doom-64',
    label: 'Doom 64',
    color: 'oklch(0.4 0.2 0)',
  },
  {
    value: 'mono',
    label: 'Mono',
    color: 'oklch(0.5 0 0)',
  },
  {
    value: 'neo-brutalism',
    label: 'Neo Brutalism',
    color: 'oklch(0.6489 0.237 26.9728)',
  },
  {
    value: 'pastel-dreams',
    label: 'Pastel Dreams',
    color: 'oklch(0.8 0.1 330)',
  },
  {
    value: 'quantum-rose',
    label: 'Quantum Rose',
    color: 'oklch(0.6002 0.2414 0.1348)',
  },
  {
    value: 'soft-pop',
    label: 'Soft Pop',
    color: 'oklch(0.7 0.15 280)',
  },
];

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
        relative p-3 rounded-lg border-2 transition-all duration-200 text-left
        hover:shadow-md hover:scale-[1.02] group
        ${
          isSelected
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-border hover:border-primary/50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
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

export function SettingsDialog() {
  const theme = useAppStore((state) => state.theme);
  const colorMode = useAppStore((state) => state.colorMode);
  const setTheme = useAppStore((state) => state.setTheme);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);

  useThemeCss(theme);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 w-full rounded-md p-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Settings2 className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </button>
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
              <div className="p-2 rounded-lg bg-primary/10">
                {colorMode === 'dark' ? (
                  <Moon className="w-4 h-4 text-primary" />
                ) : (
                  <Sun className="w-4 h-4 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark modes
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span className="text-sm">Light</span>
                </div>
                <Switch
                  checked={colorMode === 'dark'}
                  onCheckedChange={toggleDarkMode}
                />
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span className="text-sm">Dark</span>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
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
