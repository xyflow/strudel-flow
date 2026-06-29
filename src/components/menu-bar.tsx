import { useState, useCallback } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DraggableNodeItem } from '@/components/draggable-node-item';
import nodesConfig, { type NodeConfig } from '@/components/nodes';
import { cn } from '@/lib/utils';

const nodesByCategory = Object.values(nodesConfig).reduce(
  (acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  },
  {} as Record<string, NodeConfig[]>,
);

const MENU_CATEGORIES = [
  { label: 'Instruments', category: 'Instruments' as const },
  { label: 'Sounds', category: 'Synths' as const },
  { label: 'Effects', category: 'Audio Effects' as const },
  { label: 'Time', category: 'Time Effects' as const },
];

export function MenuBar() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleCategoryOpenChange = useCallback(
    (category: string, open: boolean) => {
      setOpenCategory(open ? category : null);
    },
    [],
  );

  const handleItemAdded = useCallback(() => {
    setOpenCategory(null);
  }, []);

  return (
    <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2">
      <nav className="pointer-events-auto flex items-center gap-0.5 rounded-full border bg-card/95 p-1 shadow-lg backdrop-blur-sm">
        {MENU_CATEGORIES.map(({ label, category }) => {
          const items = nodesByCategory[category] ?? [];
          const isOpen = openCategory === category;

          return (
            <Popover
              key={category}
              open={isOpen}
              onOpenChange={(open) => handleCategoryOpenChange(category, open)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant={isOpen ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'rounded-full px-3 text-xs sm:px-4 sm:text-sm',
                    isOpen && 'bg-accent',
                  )}
                >
                  {label}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="center"
                sideOffset={12}
                className="w-auto max-w-[min(calc(100vw-2rem),20rem)] p-2 max-h-80 overflow-y-auto"
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {items.map((item) => (
                    <DraggableNodeItem
                      key={item.title}
                      {...item}
                      onAdd={handleItemAdded}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </nav>
    </div>
  );
}
