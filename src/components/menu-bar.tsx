import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { AudioLines, Clock3, Piano, Plus, SlidersHorizontal } from 'lucide-react';

import { DraggableNodeItem } from '@/components/draggable-node-item';
import nodesConfig, { type NodeConfig } from '@/components/nodes';
import { cn } from '@/lib/utils';

const nodesByCategory = Object.values(nodesConfig).reduce((groups, node) => {
  (groups[node.category] ??= []).push(node);
  return groups;
}, {} as Record<string, NodeConfig[]>);

const categories = [
  { label: 'Instruments', category: 'Instruments', icon: Piano },
  { label: 'Sounds', category: 'Synths', icon: AudioLines },
  { label: 'Effects', category: 'Audio Effects', icon: SlidersHorizontal },
  { label: 'Time', category: 'Time Effects', icon: Clock3 },
] as const;

function point(radius: number, angle: number) {
  const radians = angle * Math.PI / 180;
  return { x: 240 + radius * Math.cos(radians), y: 240 - radius * Math.sin(radians) };
}

function sector(index: number) {
  const start = 180 - index * 45 - 3;
  const end = start - 39;
  const at = (radius: number, angle: number) => {
    const { x, y } = point(radius, angle);
    return `${x} ${y}`;
  };
  // Round both the outside and inside corners of each soft wedge.
  return `M ${at(116, start)}
    Q ${at(128, start)} ${at(128, start - 6)}
    A 128 128 0 0 1 ${at(128, end + 6)}
    Q ${at(128, end)} ${at(116, end)}
    L ${at(74, end)}
    Q ${at(62, end)} ${at(62, end + 11)}
    A 62 62 0 0 0 ${at(62, start - 11)}
    Q ${at(62, start)} ${at(74, start)} Z`;
}

export function MenuBar() {
  const [expanded, setExpanded] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();
  const openedByHover = useRef(false);
  const dragging = useRef(false);

  const cancelHover = useCallback(() => clearTimeout(hoverTimer.current), []);
  const close = useCallback(() => {
    cancelHover();
    openedByHover.current = false;
    setExpanded(false);
    setOpenCategory(null);
  }, [cancelHover]);
  const selectCategory = (category: string) => {
    cancelHover();
    if (!dragging.current) setOpenCategory(category);
  };

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!dragging.current && !menuRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('pointerdown', dismiss);
    return () => {
      cancelHover();
      document.removeEventListener('pointerdown', dismiss);
    };
  }, [cancelHover, close]);

  const items = openCategory ? nodesByCategory[openCategory] : [];
  const categoryIndex = categories.findIndex(item => item.category === openCategory);
  const origin = point(95, 157.5 - Math.max(0, categoryIndex) * 45);

  return (
    <nav ref={menuRef} aria-label="Add nodes"
      className="group/launcher absolute bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 text-foreground"
      data-expanded={expanded}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          triggerRef.current?.focus();
        }
      }}
      onDragStartCapture={() => { dragging.current = true; cancelHover(); }}
      onDragEndCapture={() => { dragging.current = false; }}
    >
      <div id="node-categories"
        className={cn(
          'absolute bottom-7 left-1/2 aspect-[2/1] [container-type:inline-size] w-[min(480px,calc(100vw-16px))] -translate-x-1/2 transition-opacity duration-150 motion-reduce:transition-none',
          expanded ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      >
        <svg viewBox="0 0 480 240" className="absolute inset-0 size-full overflow-visible" aria-label="Node categories">
          {categories.map(({ label, category, icon: Icon }, index) => {
            const center = point(95, 157.5 - index * 45);
            return <g key={category} className="radial-category" data-active={openCategory === category}>
              <path d={sector(index)} role="button" tabIndex={expanded ? 0 : -1}
                aria-label={label} aria-expanded={openCategory === category} aria-controls="node-category-items"
                data-node-category
                className="cursor-pointer stroke-border transition-colors focus-visible:stroke-ring focus-visible:stroke-2 focus-visible:outline-none"
                fill={openCategory === category ? 'var(--accent)' : 'var(--card)'}
                onPointerEnter={event => {
                  if (event.pointerType !== 'mouse' || dragging.current) return;
                  cancelHover();
                  hoverTimer.current = setTimeout(() => setOpenCategory(category), 180);
                }}
                onPointerLeave={cancelHover}
                onClick={() => selectCategory(category)}
                onFocus={() => selectCategory(category)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectCategory(category);
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    menuRef.current?.querySelector<HTMLElement>('#node-category-items [role="button"]')?.focus();
                  }
                }}
              />
              <g className={cn('pointer-events-none', openCategory === category ? 'text-foreground' : 'text-muted-foreground')}>
                <Icon x={center.x - 10} y={center.y - 17} width={20} height={20} strokeWidth={1.7} />
                <text x={center.x} y={center.y + 17} textAnchor="middle" fill="currentColor" fontSize={10}>{label}</text>
              </g>
            </g>;
          })}
        </svg>
        {openCategory && <div key={openCategory} id="node-category-items" role="group" aria-label={`${openCategory} nodes`}>
          {items.map((item, index) => {
            const position = point(198, items.length === 1 ? 90 : 165 - index * 150 / (items.length - 1));
            return <div key={item.id} className="radial-node absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${position.x / 480 * 100}%`,
                top: `${position.y / 240 * 100}%`,
                '--reveal-x': `${(origin.x - position.x) / 480 * 100}cqw`,
                '--reveal-y': `${(origin.y - position.y) / 480 * 100}cqw`,
                '--reveal-delay': `${index * 32}ms`,
              } as CSSProperties}>
              <DraggableNodeItem {...item}
                className="size-12 gap-0 rounded-full border bg-card p-0 sm:size-14 [&>span:last-child]:absolute [&>span:last-child]:top-full [&>span:last-child]:mt-1 [&>span:last-child]:w-20 [&>span:last-child]:overflow-visible [&>span:last-child]:text-[10px] [&>span:last-child]:leading-tight"
              />
            </div>;
          })}
        </div>}
      </div>
      <button ref={triggerRef} type="button"
        className="relative grid size-14 cursor-pointer place-items-center rounded-md border border-primary/50 bg-primary text-primary-foreground transition-[border-radius,background-color,transform] duration-300 group-data-[expanded=true]/launcher:rounded-full hover:bg-primary/90 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={expanded ? 'Close node menu' : 'Add a node'} aria-expanded={expanded} aria-controls="node-categories"
        onPointerEnter={event => {
          if (event.pointerType === 'mouse' && !expanded) {
            openedByHover.current = true;
            setExpanded(true);
          }
        }}
        onClick={() => {
          if (expanded && !openedByHover.current) close();
          else { openedByHover.current = false; setExpanded(true); }
        }}
        onKeyDown={event => {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            flushSync(() => setExpanded(true));
            menuRef.current?.querySelector<SVGElement>('[data-node-category]')?.focus();
          }
        }}
      >
        <Plus size={26} strokeWidth={1.7} className="transition-transform duration-150 group-data-[expanded=true]/launcher:rotate-45 motion-reduce:transition-none" />
      </button>
    </nav>
  );
}
