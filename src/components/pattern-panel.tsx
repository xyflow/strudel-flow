import { useStrudelStore } from '@/store/strudel-store';
import { Copy } from 'lucide-react';
import { useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function PatternPanelWithCopy({ isVisible }: { isVisible: boolean }) {
  const pattern = useStrudelStore((s) => s.pattern) || 'No pattern.';
  const [isCopied, setIsCopied] = useState(false);

  if (!isVisible) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pattern);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-row  bg-card p-4 shadow mt-2 rounded-md border">
      <pre className="text-xs m-2 w-96 overflow-y-auto">{pattern}</pre>
      <div className="flex flex-row justify-between items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="p-2" onClick={handleCopy}>
              <Copy />
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
    </div>
  );
}
