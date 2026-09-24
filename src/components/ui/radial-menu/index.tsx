import { isValidElement, useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { MenuContext, PositionContext, menuChildren } from './context';
export { RadialMenuItem } from './radial-menu-item';
export type { RadialMenuItemProps } from './radial-menu-item';
export { RadialMenuSubItem } from './radial-menu-sub-item';
export type { RadialMenuSubItemProps } from './radial-menu-sub-item';
import './radial-menu.css';

export type RadialMenuProps = {
  children: ReactNode;
  label?: string;
  openLabel?: string;
  closeLabel?: string;
  className?: string;
  style?: CSSProperties;
};

export function RadialMenu({ children, label = 'Actions', openLabel = 'Open menu',
  closeLabel = 'Close menu', className = '', style }: RadialMenuProps) {
  const categoriesId = useId();
  const [expanded, setExpanded] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);
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

  const items = menuChildren(children);
  const context = {
    expanded,
    activeId: openCategory,
    activate: selectCategory,
    hover: (id: string) => {
      if (dragging.current || openCategory === id) return;
      cancelHover();
      hoverTimer.current = setTimeout(() => selectCategory(id), 180);
    },
    cancelHover,
    select: () => { close(); triggerRef.current?.focus(); },
  };

  return (
    <MenuContext.Provider value={context}>
    <nav ref={menuRef} aria-label={label}
      className={`radial-menu ${className}`} style={style}
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
      <div ref={ringsRef} id={categoriesId} className="radial-menu__rings" hidden={!expanded}>
        {items.map((item, index) => (
          <PositionContext.Provider key={isValidElement(item) ? item.key ?? index : index} value={{ index, count: items.length }}>
            {item}
          </PositionContext.Provider>
        ))}
      </div>
      <button ref={triggerRef} type="button"
        className="radial-menu__trigger"
        aria-label={expanded ? closeLabel : openLabel} aria-expanded={expanded} aria-controls={categoriesId}
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
            ringsRef.current?.querySelector<SVGElement>('[data-radial-category]')?.focus();
          }
        }}
      >
        <svg className="radial-menu__trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </nav>
    </MenuContext.Provider>
  );
}
