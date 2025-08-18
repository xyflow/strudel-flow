import { Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function AppInfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
          title="App Instructions"
        >
          <Info className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-96 overflow-y-auto" align="end">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">
              Strudel Flow
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Strudel Flow is built with{' '}
              <a
                href="https://reactflow.dev/"
                className="text-primary hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                React Flow
              </a>{' '}
              and powered by{' '}
              <a
                href="https://strudel.cc"
                className="text-primary hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Strudel
              </a>
              .
            </p>
          </div>

          {/* Getting Started */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              🎵 Getting Started
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono text-xs mt-0.5">
                  1.
                </span>
                <span>Drag nodes from the sidebar to your workspace.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono text-xs mt-0.5">
                  2.
                </span>
                <span>
                  Connect nodes using the handles to create complex patterns.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono text-xs mt-0.5">
                  3.
                </span>
                <span>Share your patterns with the world.</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              🚀 Advanced Features
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Multi-select:</strong>{' '}
                <kbd className="bg-background border px-1 rounded text-xs">
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

          <div className="pt-2 border-t text-left">
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
              </strong>
              •{' '}
              <strong>
                <a href="https://tweakcn.com" className="hover:underline">
                  tweakcn
                </a>
              </strong>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
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
