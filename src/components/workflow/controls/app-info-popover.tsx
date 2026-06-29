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
        <ControlButton title="App Instructions">
          <Info className="size-5" />
        </ControlButton>
      </PopoverTrigger>
      <PopoverContent className="max-h-96 w-96 overflow-y-auto" align="end">
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">
              Strudel Flow
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The Strudel Flow is built with{' '}
              <a
                href="https://reactflow.dev/"
                className="font-medium text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                React Flow
              </a>{' '}
              and powered by{' '}
              <a
                href="https://strudel.cc"
                className="font-medium text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Strudel
              </a>
              .
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-foreground">
              🎵 Getting Started
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-mono text-xs text-primary">1.</span>
                <span>Drag nodes from the menu bar to your workspace.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-mono text-xs text-primary">2.</span>
                <span>
                  Connect nodes using the handles to create complex patterns.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-mono text-xs text-primary">3.</span>
                <span>Share your patterns with the world.</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              🚀 Advanced Features
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Multi-select:</strong>{' '}
                <kbd className="rounded border bg-background px-1 text-xs">
                  Shift + click
                </kbd>{' '}
                to select multiple steps.
              </div>
              <div>
                <strong>Pattern Preview:</strong> Click notebook icon in
                headers.
              </div>
              <div>
                <strong>Add Modifiers:</strong> Right-click buttons for repeats
                & speed changes.
              </div>
              <div>
                <strong>Tempo Control:</strong> Use timer icon in top controls.
              </div>
            </div>
          </div>

          <div className="border-t pt-2 text-left">
            <p className="text-xs text-muted-foreground">
              Powered by{' '}
              <strong>
                <a href="https://strudel.cc" className="hover:underline">
                  Strudel
                </a>
              </strong>{' '}
              •{' '}
              <strong>
                <a href="https://reactflow.dev/" className="hover:underline">
                  React Flow
                </a>
              </strong>{' '}
              •{' '}
              <strong>
                <a href="https://ui.shadcn.com/" className="hover:underline">
                  shadcn
                </a>
              </strong>{' '}
              •{' '}
              <strong>
                <a href="https://tweakcn.com" className="hover:underline">
                  tweakcn
                </a>
              </strong>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Check out the source code on{' '}
              <strong>
                <a
                  href="https://github.com/xyflow/strudel-flow"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </strong>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
