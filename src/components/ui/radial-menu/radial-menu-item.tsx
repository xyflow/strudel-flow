import {
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import { ContextMenuItem } from './context-menu';
import {
  menuChildren,
  PositionContext,
  useMenuContext,
  usePositionContext,
} from './context';
import { sector } from './geometry';
import { RadialCategoryVisual } from './radial-menu-preview';

export type RadialMenuItemProps = {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function RadialMenuItem({ label, icon, children }: RadialMenuItemProps) {
  const id = useId();
  const clipId = `${id.replace(/:/g, '')}-category`;
  const menu = useMenuContext();
  const { index, count } = usePositionContext();
  const active = menu.activeId === id;
  const path = sector(index, count);
  const items = menuChildren(children);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHover = () => {
    if (hoverTimer.current !== null) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };
  useEffect(() => cancelHover, []);

  return (
    <>
      <ContextMenuItem
        asChild
        textValue={label}
        onSelect={(event) => {
          event.preventDefault();
          menu.activate(id);
        }}
      >
        <button
          type="button"
          className="radial-menu__item radial-menu__category"
          style={{ clipPath: `url(#${clipId})` }}
          aria-label={label}
          aria-expanded={active}
          aria-controls={active ? `${id}-items` : undefined}
          data-active={active}
          onPointerEnter={(event) => {
            if (event.pointerType !== 'mouse' || active) return;
            cancelHover();
            hoverTimer.current = setTimeout(() => {
              hoverTimer.current = null;
              menu.activate(id);
            }, menu.hoverDelay);
          }}
          onPointerLeave={cancelHover}
          onPointerMove={(event) => {
            // Radix normally focuses on hover, which would bypass the delay.
            if (event.pointerType === 'mouse') event.preventDefault();
          }}
          onFocus={() => menu.activate(id)}
        >
          <svg
            viewBox="0 0 480 480"
            className="radial-menu__item-svg"
            aria-hidden="true"
          >
            <defs>
              <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                <path d={path} transform="scale(0.0020833333333333333)" />
              </clipPath>
            </defs>
            <RadialCategoryVisual
              index={index}
              count={count}
              label={label}
              icon={icon}
            />
          </svg>
        </button>
      </ContextMenuItem>
      {active && (
        <div
          id={`${id}-items`}
          className="radial-menu__items"
          role="group"
          aria-label={`${label} actions`}
        >
          {items.map((item, itemIndex) => (
            <PositionContext.Provider
              key={isValidElement(item) ? (item.key ?? itemIndex) : itemIndex}
              value={{ index: itemIndex, count: items.length }}
            >
              {item}
            </PositionContext.Provider>
          ))}
        </div>
      )}
    </>
  );
}
