import { Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ControlButton } from './control-button';

// AGPL-3.0: a hosted, modified version must offer its users its own source.
const SOURCE_URL =
  (import.meta.env.VITE_SOURCE_URL as string | undefined) ||
  'https://github.com/msandlerespi/strudel-flow-together';

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
        <p className="mt-3 text-muted-foreground">
          Strudel Together adds remote jam rooms to Strudel Flow. Free software
          under the AGPL-3.0.
        </p>
        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex text-foreground underline underline-offset-2"
        >
          Source code
        </a>
      </PopoverContent>
    </Popover>
  );
}
