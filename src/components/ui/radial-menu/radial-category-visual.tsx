import type { ReactNode } from 'react';
import { point, sector } from './geometry';

export function RadialCategoryVisual({
  index,
  count,
  label,
  icon,
}: {
  index: number;
  count: number;
  label: string;
  icon: ReactNode;
}) {
  const center = point(90, 150 - ((index + 0.5) * 360) / count);
  return (
    <>
      <path d={sector(index, count)} className="radial-menu__item-surface" />
      <svg
        x={center.x - 11}
        y={center.y - 24}
        width={22}
        height={22}
        viewBox="0 0 24 24"
      >
        {icon}
      </svg>
      <text
        x={center.x}
        y={center.y + 14}
        textAnchor="middle"
        fill="currentColor"
        fontSize={13}
      >
        {label}
      </text>
    </>
  );
}
