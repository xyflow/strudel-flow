import { useCopyText } from '@/hooks/use-copy-text';
import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useMemo } from 'react';
import { useAppStore } from '@/store/app-store';
import { generateOutput } from '@/lib/strudel';
import { useVisibleGraph } from '@/collab/use-visible-graph';
import { useCollabStore } from '@/collab/session';

export function PatternPanel() {
  const fullPattern = useAppStore((s) => s.pattern);
  const cpm = useAppStore((s) => s.cpm);
  const bpc = useAppStore((s) => s.bpc);
  const privateRoom = useCollabStore(
    (s) => s.room !== null && s.view === 'private',
  );
  const { nodes, edges } = useVisibleGraph();
  // In a private jam room, show only the code for your own part.
  const ownPattern = useMemo(
    () => (privateRoom ? generateOutput(nodes, edges, cpm, bpc) : null),
    [privateRoom, nodes, edges, cpm, bpc],
  );
  const pattern = (ownPattern ?? fullPattern) || 'No pattern.';
  const { copy: handleCopy, status } = useCopyText(pattern);

  return (
    <div className="flex w-full min-w-0 flex-col ">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">
          {privateRoom ? 'Your Strudel code' : 'Strudel code'}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              aria-label="Copy code"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
            >
              <Copy className="size-4" />
            </Button>
          </PopoverTrigger>
          {status === 'copied' && (
            <PopoverContent
              align="center"
              sideOffset={10}
              className="w-auto p-2 text-sm"
            >
              Copied!
            </PopoverContent>
          )}
        </Popover>
      </div>
      <pre className="max-h-[30vh] min-h-16 overflow-auto whitespace-pre-wrap rounded border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground">
        {pattern}
      </pre>
    </div>
  );
}
