import { useState } from 'react';
import { Link, Check, Copy } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import { useStrudelStore } from '@/store/strudel-store';
import { getShareUrl } from '@/lib/project-state';

import { ControlButton } from './control-button';

export function ShareUrlPopover() {
  const [isCopied, setIsCopied] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { nodes, edges, theme, colorMode } = useAppStore((state) => state);
  const { cpm, bpc } = useStrudelStore((state) => state);

  const displayUrl = getShareUrl({ nodes, edges, theme, colorMode, cpm, bpc });

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <ControlButton title="Share URL">
          <Link className="size-5" />
        </ControlButton>
      </PopoverTrigger>
      <PopoverContent className="w-[min(384px,calc(100vw-32px))] rounded-lg" align="end">
        <div className="space-y-3">
          <div>
            <h4 className="mb-2 text-sm font-medium">Share patch</h4>
            <p className="mb-3 text-xs text-muted-foreground">
              Anyone with this link can open your patch.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={displayUrl}
              readOnly
              className="font-mono text-xs"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              size="sm"
              onClick={handleCopyUrl}
              className={`shrink-0 ${isCopied ? 'bg-primary' : ''}`}
            >
              {isCopied ? (
                <>
                  <Check className="mr-1 size-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-1 size-4" />
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
