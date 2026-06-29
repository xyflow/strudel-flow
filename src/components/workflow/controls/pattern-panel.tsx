import { useState } from 'react';
import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useStrudelStore } from '@/store/strudel-store';

type PatternPanelProps = {
  isVisible: boolean;
};

export function PatternPanel({ isVisible }: PatternPanelProps) {
  const pattern = useStrudelStore((s) => s.pattern) || 'No pattern.';
  const [isCopied, setIsCopied] = useState(false);

  if (!isVisible) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pattern);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex w-[40vw] min-w-[300px] max-w-[60vw] flex-col rounded-lg border bg-card p-4 md:min-w-[400px]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Generated Pattern</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
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
      <pre className="max-h-[30vh] min-h-[15vh] overflow-auto whitespace-pre-wrap rounded bg-muted p-3 font-mono text-xs">
        {pattern}
      </pre>
    </div>
  );
}
