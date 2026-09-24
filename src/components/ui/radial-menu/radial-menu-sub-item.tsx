import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import { useMenuContext, usePositionContext } from './context';
import { point, sector } from './geometry';

export type RadialMenuSubItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onSelect'
> & {
  icon?: ReactNode;
  onSelect?: MouseEventHandler<HTMLButtonElement>;
};

export const RadialMenuSubItem = forwardRef<
  HTMLButtonElement,
  RadialMenuSubItemProps
>(function RadialMenuSubItem(
  {
    children,
    icon,
    onSelect,
    onClick,
    onDragStart,
    draggable,
    className = '',
    style,
    ...props
  },
  ref,
) {
  const clipId = useId().replace(/:/g, '');
  const menu = useMenuContext();
  const { index, count } = usePositionContext();
  const position = point(183, 180 - ((index + 0.5) * 180) / count);
  const path = sector(index, count, 224, 142);

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      className={`radial-menu__item ${className}`}
      style={{ ...style, clipPath: `url(#${clipId})` }}
      draggable={draggable ?? Boolean(onDragStart)}
      onDragStart={onDragStart}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onSelect?.(event);
        if (!event.defaultPrevented) menu.select();
      }}
    >
      <div className="radial-menu__item-visual">
        <svg
          viewBox="0 0 480 240"
          className="radial-menu__item-svg"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path
                d={path}
                transform="scale(0.0020833333333333333 0.004166666666666667)"
              />
            </clipPath>
          </defs>
          <path d={path} className="radial-menu__item-surface" />
        </svg>
        <span
          className="radial-menu__item-label"
          style={{
            left: `${(position.x / 480) * 100}%`,
            top: `${(position.y / 240) * 100}%`,
          }}
        >
          {icon}
          <span>{children}</span>
        </span>
      </div>
    </button>
  );
});
