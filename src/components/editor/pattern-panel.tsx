import { useState } from 'react';
import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAppStore } from '@/store/app-store';

export function PatternPanel() {
  const pattern = useAppStore((s) => s.pattern) || 'No pattern.';
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(pattern); } catch { return; }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex w-full min-w-0 flex-col ">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Strudel code</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button aria-label="Copy code" variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="size-4" />
            </Button>
          </PopoverTrigger>
          {isCopied && (
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
