import { Settings2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useAppStore } from '@/store/app-context';
import { useThemeCss } from '@/hooks/use-theme-css';
import { ReactNode } from 'react';

function SettingsItem({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-4 mb-2">
      <div className="space-y-0.5">
        <span className="text-base font-bold">{title}</span>
        <p>{description}.</p>
      </div>
      {control}
    </div>
  );
}

export function SettingsDialog() {
  const state = useAppStore((state) => state);
  useThemeCss(state.theme);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 w-full rounded-md p-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Settings2 className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-2">Settings</DialogTitle>
        </DialogHeader>
        <SettingsItem
          title="Dark Mode"
          description="Toggle to switch to dark mode"
          control={
            <Switch
              checked={state.colorMode === 'dark'}
              onCheckedChange={state.toggleDarkMode}
            />
          }
        />
        <SettingsItem
          title="Theme"
          description="Choose your UI theme"
          control={
            <Select value={state.theme} onValueChange={state.setTheme}>
              <SelectTrigger className="ml-2 w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amber-minimal">Amber</SelectItem>
                <SelectItem value="brutal">Brutal</SelectItem>
                <SelectItem value="cosmic-night">Cosmic Night</SelectItem>
                <SelectItem value="neo-brutalism">Neo Brutalism</SelectItem>
                <SelectItem value="quantum-rose">Quantum Rose</SelectItem>
                <SelectItem value="supabase">Supabase</SelectItem>
                {/* Add more themes here */}
              </SelectContent>
            </Select>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
