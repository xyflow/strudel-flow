import { Settings2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/app-context';

function CheckItem({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-4 mb-2">
      <div className="space-y-0.5">
        <span className="text-base font-bold">{title}</span>
        <p>{description}.</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function SettingsDialog() {
  const state = useAppStore((state) => state);

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
        <CheckItem
          title="Dark Mode"
          description="Toggle to switch to dark mode"
          checked={state.colorMode === 'dark'}
          onCheckedChange={state.toggleDarkMode}
        />
      </DialogContent>
    </Dialog>
  );
}
