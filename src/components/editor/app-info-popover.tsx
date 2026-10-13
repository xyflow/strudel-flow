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
          Connect instruments, sounds, and effects to build repeating patterns,
          then change them while they play.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>Tap the pads, then press play.</li>
          <li>
            Click +, or right-click empty canvas space. Choose a category, then
            a node.
          </li>
          <li>
            Drag between round jacks to connect nodes. Drop a cable on empty
            space to add a connected node.
          </li>
          <li>
            Drag a dial up or down to change effects . Hold Shift for fine
            control.
          </li>
        </ul>
        <p className="mt-4 border-t pt-3 text-muted-foreground">
          Powered by{' '}
          <a href="https://strudel.cc" className="text-foreground underline">
            Strudel
          </a>{' '}
          and made by the creators of{' '}
          <a href="https://reactflow.dev" className="text-foreground underline">
            React Flow
          </a>
          .
        </p>
        <a
          href="https://github.com/xyflow/strudel-flow"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-foreground underline underline-offset-2"
        >
          Contribute on GitHub
        </a>
      </PopoverContent>
    </Popover>
  );
}
