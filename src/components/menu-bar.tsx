import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AudioLines, Clock3, Piano, Plus, SlidersHorizontal } from 'lucide-react';

import { DraggableNodeItem } from '@/components/draggable-node-item';
import nodesConfig from '@/components/nodes';
import { cn } from '@/lib/utils';

const categories = [
  { label: 'Instruments', category: 'Instruments', icon: Piano },
  { label: 'Sounds', category: 'Synths', icon: AudioLines },
  { label: 'Effects', category: 'Audio Effects', icon: SlidersHorizontal },
  { label: 'Time', category: 'Time Effects', icon: Clock3 },
].map(category => ({
  ...category,
  items: Object.values(nodesConfig).filter(node => node.category === category.category),
}));

function point(radius: number, angle: number) {
  const radians = angle * Math.PI / 180;
  return { x: 240 + radius * Math.cos(radians), y: 240 - radius * Math.sin(radians) };
}

// Rounded ring segments with consistent spacing along their shared edges.
function sector(index: number, count = 4, outer = 130, inner = 46) {
  const slice = 180 / count;
  const start = 180 - index * slice;
  const end = start - slice;
  const halfGap = 4.5;
  const inset = (radius: number) => Math.asin(halfGap / radius) * 180 / Math.PI;
  const outerStart = start - inset(outer);
  const outerEnd = end + inset(outer);
  const innerStart = start - inset(inner);
  const innerEnd = end + inset(inner);
  // Keep rounded corners from crossing on the narrower inner edge.
  const corner = (radius: number) => Math.min(20, (slice - 2 * inset(radius)) * Math.PI / 180 * radius * 0.4);
  const outerCorner = corner(outer);
  const innerCorner = corner(inner);
  const outerInset = outerCorner / outer * 180 / Math.PI;
  const innerInset = innerCorner / inner * 180 / Math.PI;
  const at = (radius: number, angle: number) => {
    const { x, y } = point(radius, angle);
    return `${x} ${y}`;
  };
  return `M ${at(outer - outerCorner, start - inset(outer - outerCorner))}
    Q ${at(outer, outerStart)} ${at(outer, outerStart - outerInset)}
    A ${outer} ${outer} 0 0 1 ${at(outer, outerEnd + outerInset)}
    Q ${at(outer, outerEnd)} ${at(outer - outerCorner, end + inset(outer - outerCorner))}
    L ${at(inner + innerCorner, end + inset(inner + innerCorner))}
    Q ${at(inner, innerEnd)} ${at(inner, innerEnd + innerInset)}
    A ${inner} ${inner} 0 0 0 ${at(inner, innerStart - innerInset)}
    Q ${at(inner, innerStart)} ${at(inner + innerCorner, start - inset(inner + innerCorner))} Z`;
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
    cancelClose();
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

  const items = categories.find(({ category }) => category === openCategory)?.items ?? [];

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
          'absolute bottom-7 left-1/2 aspect-[2/1] [container-type:inline-size] w-[min(440px,calc(100vw-16px))] -translate-x-1/2',
          expanded ? 'visible' : 'invisible',
        )}
      >
        <svg viewBox="0 0 480 240" className="absolute inset-0 size-full overflow-visible" aria-label="Node categories">
          {categories.map(({ label, category, icon: Icon }, index) => {
            const center = point(90, 157.5 - index * 45);
            return <g key={category} data-active={openCategory === category}>
              <g className="radial-category-visual pointer-events-none">
                <path d={sector(index)} className="stroke-border transition-colors"
                  fill={openCategory === category ? 'var(--accent)' : 'var(--card)'} />
                <g className={cn('pointer-events-none', openCategory === category ? 'text-accent-foreground' : 'text-muted-foreground')}>
                  <Icon x={center.x - 11} y={center.y - 21} width={22} height={22} strokeWidth={1.7} />
                  <text x={center.x} y={center.y + 14} textAnchor="middle" fill="currentColor" fontSize={14} fontWeight={500} letterSpacing={0}>{label}</text>
                </g>
              </g>
              <path d={sector(index)} role="button" tabIndex={expanded ? 0 : -1}
                aria-label={label} aria-expanded={openCategory === category} aria-controls="node-category-items"
                data-node-category
                className="touch-manipulation cursor-pointer fill-transparent stroke-transparent outline-none focus-visible:stroke-ring focus-visible:stroke-2"
                onPointerEnter={event => {
                  if (event.pointerType !== 'mouse' || dragging.current || openCategory === category) return;
                  cancelHover();
                  hoverTimer.current = setTimeout(() => selectCategory(category), 180);
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
            </g>;
          })}
        </svg>
        {openCategory && <div key={openCategory} id="node-category-items" className="pointer-events-none absolute inset-0" role="group" aria-label={`${openCategory} nodes`}>
          {items.map((item, index) => {
            const position = point(183, 180 - (index + 0.5) * 180 / items.length);
            return <div key={item.id} className="pointer-events-none absolute inset-0">
              <DraggableNodeItem {...item} onAdd={close}
                arc={{ path: sector(index, items.length, 224, 142), ...position }} />
            </div>;
          })}
        </div>}
      </div>
      <button ref={triggerRef} type="button"
        className="relative grid size-14 touch-manipulation cursor-pointer place-items-center rounded-full border border-primary/50 bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
