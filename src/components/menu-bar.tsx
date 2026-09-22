import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AudioLines, Clock3, Piano, Plus, SlidersHorizontal } from 'lucide-react';

import { DraggableNodeItem } from '@/components/draggable-node-item';
import nodesConfig, { type NodeConfig } from '@/components/nodes';
import { cn } from '@/lib/utils';

const nodesByCategory = Object.values(nodesConfig).reduce(
  (acc, node) => {
    (acc[node.category] ??= []).push(node);
    return acc;
  },
  {} as Record<string, NodeConfig[]>,
);

const MENU_CATEGORIES = [
  { label: 'Instruments', category: 'Instruments', icon: Piano },
  { label: 'Sounds', category: 'Synths', icon: AudioLines },
  { label: 'Effects', category: 'Audio Effects', icon: SlidersHorizontal },
  { label: 'Time', category: 'Time Effects', icon: Clock3 },
] as const;

export function MenuBar() {
  const [expanded, setExpanded] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const menuRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);

  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), []);
  const close = useCallback(() => {
    cancelClose();
    setExpanded(false);
    setOpenCategory(null);
  }, [cancelClose]);
  const reveal = () => {
    cancelClose();
    setExpanded(true);
  };

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('pointerdown', dismiss);
    return () => {
      cancelClose();
      document.removeEventListener('pointerdown', dismiss);
    };
  }, [cancelClose, close]);

  const activeCategory = MENU_CATEGORIES.find(
    ({ category }) => category === openCategory,
  );

  return (
    <nav
      ref={menuRef}
      aria-label="Add nodes"
      className="group/launcher absolute bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 text-foreground"
      data-expanded={expanded}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') reveal();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse' || dragging.current) return;
        cancelClose();
        closeTimer.current = setTimeout(close, 220);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          triggerRef.current?.focus();
          close();
        }
      }}
      onDragStartCapture={() => {
        dragging.current = true;
        cancelClose();
      }}
      onDragEndCapture={() => {
        dragging.current = false;
        close();
      }}
    >
      <div
        className={cn(
          'absolute bottom-full left-1/2 w-[min(344px,calc(100vw-24px))] origin-bottom -translate-x-1/2 pb-4 transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none',
          expanded
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible translate-y-3.5 scale-95 opacity-0',
        )}
        id="node-categories"
      >
        {activeCategory && (
          <section
            className="mb-2.5 rounded-lg border bg-card px-3.5 pt-4.5 pb-2.5   transition-[opacity,translate] duration-200 starting:translate-y-1.5 starting:opacity-0 motion-reduce:transition-none"
            id="node-category-items"
            aria-label={activeCategory.label}
          >
            <div className="mb-3.5 flex items-center justify-between px-1">
              <div>
                <h2 className="mt-0.5 text-[17px] font-semibold tracking-tight">
                  {activeCategory.label}
                </h2>
              </div>
              <span className="grid size-6.5 place-items-center rounded-md bg-muted text-[11px] text-muted-foreground">
                {nodesByCategory[activeCategory.category].length}
              </span>
            </div>
            <div
              className="grid max-h-[min(320px,calc(100dvh-300px))] grid-cols-3 gap-1.5 overflow-y-auto p-0.5"
              key={openCategory}
            >
              {nodesByCategory[activeCategory.category].map((item) => (
                <DraggableNodeItem
                  key={item.id}
                  {...item}
                  className="aspect-auto min-h-19 w-full gap-2 rounded-md border bg-muted transition-[transform,background-color,border-color] duration-150  hover:border-primary/45 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:w-full [&>span]:text-[11px]"
                  onAdd={() => {
                    triggerRef.current?.focus();
                    close();
                  }}
                />
              ))}
            </div>
          </section>
        )}
        <div className="grid grid-cols-4 gap-1 rounded-lg border bg-card p-2  ">
          {MENU_CATEGORIES.map(({ label, category, icon: Icon }) => (
            <button
              key={category}
              type="button"
              data-node-category
              className="group/category flex cursor-pointer flex-col items-center gap-1.5 rounded-lg px-0.5 py-2.5 text-[10px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-primary/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-expanded:bg-primary/10 aria-expanded:text-foreground motion-reduce:transition-none"
              aria-expanded={openCategory === category}
              aria-controls={
                openCategory === category ? 'node-category-items' : undefined
              }
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') setOpenCategory(category);
              }}
              onFocus={() => setOpenCategory(category)}
              onClick={() => setOpenCategory(category)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  menuRef.current
                    ?.querySelector<HTMLElement>('#node-category-items [role=button]')
                    ?.focus();
                }
              }}
            >
              <span className="transition-transform duration-150 group-hover/category:-translate-y-0.5 group-aria-expanded/category:text-ring motion-reduce:transition-none">
                <Icon size={21} strokeWidth={1.7} />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <button
        ref={triggerRef}
        type="button"
        className="grid size-14 cursor-pointer place-items-center rounded-md border border-primary/50 bg-primary text-primary-foreground  transition-colors duration-200   hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
        aria-label={expanded ? 'Close node menu' : 'Add a node'}
        aria-expanded={expanded}
        aria-controls="node-categories"
        onClick={() => (expanded ? close() : reveal())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            flushSync(reveal);
            menuRef.current
              ?.querySelector<HTMLButtonElement>('[data-node-category]')
              ?.focus();
          }
        }}
      >
        <Plus
          size={26}
          strokeWidth={1.7}
          className="transition-transform duration-200 group-data-[expanded=true]/launcher:rotate-45 motion-reduce:transition-none"
        />
      </button>
    </nav>
  );
}
