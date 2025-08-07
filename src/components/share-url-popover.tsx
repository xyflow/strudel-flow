import { useState } from 'react';
import { Link, Check, Copy } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app-context';

import { generateShareableUrl } from '@/lib/state-serialization';

export function ShareUrlPopover() {
  const [isCopied, setIsCopied] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { nodes, edges, theme, colorMode } = useAppStore((state) => state);

  const handleCopyUrl = async () => {
    try {
      const shareableUrl = generateShareableUrl(nodes, edges, theme, colorMode);
      await navigator.clipboard.writeText(shareableUrl);
      setIsCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // Generate URL for display - this is just for preview
  const displayUrl = generateShareableUrl(nodes, edges, theme, colorMode);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
          title="Share URL"
        >
          <Link className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">Share Your Patterns</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Copy this URL to share your workflow with others.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={displayUrl}
              readOnly
              className="text-xs font-mono"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              size="sm"
              onClick={handleCopyUrl}
              className={`shrink-0 ${isCopied ? 'bg-primary' : ''}`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
