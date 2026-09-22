import { useCallback, useEffect, useRef, useState } from 'react';
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

function sector(index: number, count = 4, outer = 138, inner = 58) {
  const slice = 180 / count;
  const start = 180 - index * slice - 3;
  const end = start - slice + 6;
  const corner = 12;
  const outerInset = corner / outer * 180 / Math.PI;
  const innerInset = corner / inner * 180 / Math.PI;
  const at = (radius: number, angle: number) => {
    const { x, y } = point(radius, angle);
    return `${x} ${y}`;
  };
  return `M ${at(outer - corner, start)}
    Q ${at(outer, start)} ${at(outer, start - outerInset)}
    A ${outer} ${outer} 0 0 1 ${at(outer, end + outerInset)}
    Q ${at(outer, end)} ${at(outer - corner, end)}
    L ${at(inner + corner, end)}
    Q ${at(inner, end)} ${at(inner, end + innerInset)}
    A ${inner} ${inner} 0 0 0 ${at(inner, start - innerInset)}
    Q ${at(inner, start)} ${at(inner + corner, start)} Z`;
}

export function MenuBar() {
  const [expanded, setExpanded] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const pointerInside = useRef(false);
  const openedByHover = useRef(false);
  const dragging = useRef(false);

  const cancelHover = useCallback(() => clearTimeout(hoverTimer.current), []);
  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), []);
  const close = useCallback(() => {
    cancelHover();
    cancelClose();
    openedByHover.current = false;
    setExpanded(false);
    setOpenCategory(null);
  }, [cancelHover, cancelClose]);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (!pointerInside.current && !dragging.current) close();
    }, 280);
  };
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
      cancelClose();
      document.removeEventListener('pointerdown', dismiss);
    };
  }, [cancelHover, cancelClose, close]);

  const items = openCategory ? nodesByCategory[openCategory] : [];

  return (
    <nav ref={menuRef} aria-label="Add nodes"
      className="group/launcher absolute bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 text-foreground [font-family:Arial,Helvetica,sans-serif] tracking-normal"
      data-expanded={expanded}
      onPointerEnter={event => {
        if (event.pointerType !== 'mouse') return;
        pointerInside.current = true;
        cancelClose();
      }}
      onPointerLeave={event => {
        if (event.pointerType !== 'mouse') return;
        pointerInside.current = false;
        cancelHover();
        if (!dragging.current) scheduleClose();
      }}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          triggerRef.current?.focus();
        }
      }}
      onDragStartCapture={() => { dragging.current = true; cancelHover(); cancelClose(); }}
      onDragEndCapture={() => { dragging.current = false; if (!pointerInside.current) scheduleClose(); }}
    >
      <div id="node-categories"
        className={cn(
          'absolute bottom-7 left-1/2 aspect-[2/1] [container-type:inline-size] w-[min(480px,calc(100vw-16px))] -translate-x-1/2 transition-opacity duration-150 motion-reduce:transition-none',
          expanded ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      >
        <svg viewBox="0 0 480 240" className="absolute inset-0 size-full overflow-visible" aria-label="Node categories">
          {categories.map(({ label, category, icon: Icon }, index) => {
            const center = point(100, 157.5 - index * 45);
            return <g key={category} className="radial-category" data-active={openCategory === category}>
              <path d={sector(index)} role="button" tabIndex={expanded ? 0 : -1}
                aria-label={label} aria-expanded={openCategory === category} aria-controls="node-category-items"
                data-node-category
                className="cursor-pointer stroke-border outline-none transition-colors focus-visible:stroke-ring focus-visible:stroke-2"
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
              <g className={cn('pointer-events-none', openCategory === category ? 'text-accent-foreground' : 'text-muted-foreground')}>
                <Icon x={center.x - 9} y={center.y - 16} width={18} height={18} strokeWidth={1.7} />
                <text x={center.x} y={center.y + 14} textAnchor="middle" fill="currentColor" fontSize={10} fontWeight={500} letterSpacing={0}>{label}</text>
              </g>
            </g>;
          })}
        </svg>
        {openCategory && <div key={openCategory} id="node-category-items" className="radial-node pointer-events-none absolute inset-0 origin-bottom" role="group" aria-label={`${openCategory} nodes`}>
          {items.map((item, index) => {
            const useArc = items.length <= 2;
            const position = useArc
              ? point(189, 180 - (index + 0.5) * 180 / items.length)
              : point(198, 165 - index * 150 / (items.length - 1));
            if (useArc) return <div key={item.id} className="pointer-events-none absolute inset-0">
              <DraggableNodeItem {...item} arc={{ path: sector(index, items.length, 224, 154), ...position }} />
            </div>;
            return <div key={item.id} className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${position.x / 480 * 100}%`, top: `${position.y / 240 * 100}%` }}>
              <DraggableNodeItem {...item}
                className="size-[14cqw] gap-1 rounded-full border bg-card p-1 sm:w-[14cqw] [&>svg]:size-[4cqw] [&>span:last-child]:overflow-visible [&>span:last-child]:text-[clamp(8px,2.1cqw,10px)] [&>span:last-child]:leading-tight [&>span:last-child]:tracking-normal"
              />
            </div>;
          })}
        </div>}
      </div>
      <button ref={triggerRef} type="button"
        className="relative grid size-14 cursor-pointer place-items-center rounded-full border border-primary/50 bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
