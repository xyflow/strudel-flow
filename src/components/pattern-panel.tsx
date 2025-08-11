import { useStrudelStore } from '@/store/strudel-store';
import { Copy } from 'lucide-react';
import { useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function PatternPanel({ isVisible }: { isVisible: boolean }) {
  const pattern = useStrudelStore((s) => s.pattern) || 'No pattern.';
  const [isCopied, setIsCopied] = useState(false);

  if (!isVisible) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pattern);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-card p-4 shadow rounded-md border w-[40vw] min-w-[300px] max-w-[60vw] md:min-w-[400px]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Generated Pattern</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
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
      <pre className="text-xs font-mono bg-muted p-3 rounded overflow-auto max-h-[30vh] min-h-[15vh] whitespace-pre-wrap">
        {pattern}
      </pre>
    </div>
  );
}
