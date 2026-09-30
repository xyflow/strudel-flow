import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { point, sector } from './geometry';

export function RadialCategoryVisual({ index, count, label, icon }: {
  index: number; count: number; label: string; icon: ReactNode;
}) {
  const center = point(90, 150 - ((index + 0.5) * 360) / count);
  return <>
    <path d={sector(index, count)} className="radial-menu__item-surface" />
    <svg x={center.x - 11} y={center.y - 24} width={22} height={22} viewBox="0 0 24 24">{icon}</svg>
    <text x={center.x} y={center.y + 14} textAnchor="middle" fill="currentColor" fontSize={13}>{label}</text>
  </>;
}

// Keep the connection tip visible without intercepting canvas or handle hits.
export function RadialMenuPreview({ position }: {
  position: { x: number; y: number };
}) {
  return createPortal(
    <div className="radial-menu__drag-hint" aria-hidden="true"
      style={{ left: position.x, top: position.y }}>
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <path d="M 18.61 2.96 Q 20.00 1.00 21.39 2.96 L 23.58 6.03 Q 24.97 7.99 27.34 7.59 L 31.07 6.96 Q 33.44 6.56 33.04 8.93 L 32.41 12.66 Q 32.01 15.03 33.97 16.42 L 37.04 18.61 Q 39.00 20.00 37.04 21.39 L 33.97 23.58 Q 32.01 24.97 32.41 27.34 L 33.04 31.07 Q 33.44 33.44 31.07 33.04 L 27.34 32.41 Q 24.97 32.01 23.58 33.97 L 21.39 37.04 Q 20.00 39.00 18.61 37.04 L 16.42 33.97 Q 15.03 32.01 12.66 32.41 L 8.93 33.04 Q 6.56 33.44 6.96 31.07 L 7.59 27.34 Q 7.99 24.97 6.03 23.58 L 2.96 21.39 Q 1.00 20.00 2.96 18.61 L 6.03 16.42 Q 7.99 15.03 7.59 12.66 L 6.96 8.93 Q 6.56 6.56 8.93 6.96 L 12.66 7.59 Q 15.03 7.99 16.42 6.03 L 18.61 2.96 Z" fill="var(--primary)" />
        <path d="M20 14v12M14 20h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>, document.body,
  );
}
