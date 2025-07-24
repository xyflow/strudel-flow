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
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              🎛️ Getting Started
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Add Nodes:</strong> Drag nodes from the sidebar into
                your workspace.
              </div>
              <div>
                <strong>Connect Nodes:</strong> Drag from bottom handles to top
                handles.
              </div>
              <div>
                <strong>Create Patterns:</strong> Click buttons in nodes to
                build sequences.
              </div>
              <div>
                <strong>Control Playback:</strong> Use play/pause/mute in
                headers.
              </div>
            </div>
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
                <strong>Chain Effects:</strong> Connect multiple nodes for
                complex processing.
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
