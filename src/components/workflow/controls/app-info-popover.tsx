import { Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ControlButton } from './control-button';

export function AppInfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ControlButton title="About Strudel Flow">
          <Info className="size-4" />
        </ControlButton>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-72 rounded-lg text-xs leading-relaxed"
      >
        <h3 className="mb-2 text-sm font-semibold">Strudel Flow</h3>
        <p className="mb-3 text-muted-foreground">
          A visual music playground. Connect instruments, sounds, and effects to
          build repeating patterns, then change them while they play.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>Tap the pads, then press play.</li>
          <li>Click + to add an instrument, sound, or effect.</li>
          <li>Connect the round jacks to build your patch.</li>
          <li>Drag a dial up or down. Hold Shift for fine control.</li>
          <li>Space plays or pauses. Shift-click pads to group notes.</li>
        </ul>
        <p className="mt-4 border-t pt-3 text-muted-foreground">
          Powered by{' '}
          <a href="https://reactflow.dev" className="text-foreground underline">
            React Flow
          </a>{' '}
          and{' '}
          <a href="https://strudel.cc" className="text-foreground underline">
            Strudel
          </a>
          .
        </p>
      </PopoverContent>
    </Popover>
  );
}
