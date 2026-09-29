import { useId, type ReactNode } from 'react';
import { ContextMenuItem } from '../context-menu';
import { usePositionContext } from './context';
import { point, sector } from './geometry';

export type RadialMenuSubItemProps = {
  children: string;
  icon?: ReactNode;
  onSelect: () => void;
  'aria-label'?: string;
};

export function RadialMenuSubItem({ children, icon, onSelect, ...props }: RadialMenuSubItemProps) {
  const clipId = useId().replace(/:/g, '');
  const { index, count } = usePositionContext();
  const position = point(183, 150 - ((index + 0.5) * 360) / count);
  const path = sector(index, count, 224, 142);
  return (
    <ContextMenuItem asChild textValue={children} onSelect={onSelect}>
      <button {...props} type="button" className="radial-menu__item" style={{ clipPath: `url(#${clipId})` }}>
        <div className="radial-menu__item-visual">
          <svg viewBox="0 0 480 480" className="radial-menu__item-svg" aria-hidden="true">
            <defs><clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d={path} transform="scale(0.0020833333333333333)" />
            </clipPath></defs>
            <path d={path} className="radial-menu__item-surface" />
          </svg>
          <span className="radial-menu__item-label" style={{ left: `${position.x / 480 * 100}%`, top: `${position.y / 480 * 100}%` }}>
            {icon}<span>{children}</span>
          </span>
        </div>
      </button>
    </ContextMenuItem>
  );
}
