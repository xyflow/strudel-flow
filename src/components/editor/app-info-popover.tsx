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

const link = 'text-foreground underline underline-offset-2';

export function AppInfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ControlButton title="About Strudel Together">
          <Info className="size-4" />
        </ControlButton>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-72 rounded-lg text-xs leading-relaxed"
      >
        <h3 className="mb-2 text-sm font-semibold">Strudel Together</h3>
        <p className="mb-3 text-muted-foreground">
          Make music together from anywhere. Start a room with the people icon
          and send the link. Everyone hears the whole piece, but each of you
          only sees your own part.
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
            Drag a dial up or down to change effects. Hold Shift for fine
            control.
          </li>
        </ul>
        <p className="mt-4 border-t pt-3 text-muted-foreground">
          Powered by{' '}
          <a href="https://strudel.cc" className={link}>
            Strudel
          </a>
          . Built on{' '}
          <a href="https://github.com/xyflow/strudel-flow" className={link}>
            Strudel Flow
          </a>{' '}
          by xyflow, using{' '}
          <a href="https://reactflow.dev" className={link}>
            React Flow
          </a>
          . Free software under the AGPL-3.0.
        </p>
        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noreferrer"
          className={`mt-2 inline-flex ${link}`}
        >
          Source code
        </a>
      </PopoverContent>
    </Popover>
  );
}
