import { isValidElement, useId, useRef, type ReactNode } from 'react';
import { menuChildren, PositionContext, useMenuContext, usePositionContext } from './context';
import { point, sector } from './geometry';

export type RadialMenuItemProps = {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function RadialMenuItem({ label, icon, children, className = '' }: RadialMenuItemProps) {
  const id = useId();
  const itemsId = `${id}-items`;
  const itemsRef = useRef<HTMLDivElement>(null);
  const menu = useMenuContext();
  const { index, count } = usePositionContext();
  const active = menu.activeId === id;
  const center = point(90, 180 - (index + 0.5) * 180 / count);
  const path = sector(index, count);
  const items = menuChildren(children);

  return <>
    <svg viewBox="0 0 480 240" role="group" aria-label={`${label} category`} className={`radial-menu__categories ${className}`}>
      <g data-active={active}>
        <g className="radial-menu__category-visual" aria-hidden="true">
          <path d={path} className="radial-menu__category-surface"
            fill={active ? 'var(--radial-accent)' : 'var(--radial-card)'} />
          <g className="radial-menu__category-label">
            <svg x={center.x - 11} y={center.y - 21} width={22} height={22} viewBox="0 0 24 24">{icon}</svg>
            <text x={center.x} y={center.y + 14} textAnchor="middle" fill="currentColor" fontSize={14} fontWeight={500} letterSpacing={0}>{label}</text>
          </g>
        </g>
        <path d={path} role="button" tabIndex={menu.expanded ? 0 : -1}
          aria-label={label} aria-expanded={active} aria-controls={active ? itemsId : undefined}
          data-radial-category className="radial-menu__category-target"
          onPointerEnter={event => { if (event.pointerType === 'mouse') menu.hover(id); }}
          onPointerLeave={menu.cancelHover}
          onClick={() => menu.activate(id)}
          onFocus={() => menu.activate(id)}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              menu.activate(id);
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              itemsRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
            }
          }}
        />
      </g>
    </svg>
    {active && <div ref={itemsRef} id={itemsId} className="radial-menu__items" role="group" aria-label={`${label} actions`}>
      {items.map((item, itemIndex) => (
        <PositionContext.Provider key={isValidElement(item) ? item.key ?? itemIndex : itemIndex} value={{ index: itemIndex, count: items.length }}>
          {item}
        </PositionContext.Provider>
      ))}
    </div>}
  </>;
}
