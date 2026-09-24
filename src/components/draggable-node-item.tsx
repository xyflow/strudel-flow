import { useCallback, useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import {
  AppNode,
  createNodeByType,
  type NodeConfig,
} from '@/components/nodes';
import { cn } from '@/lib/utils';
import { iconMapping } from '@/data/icon-mapping';
import { useAppStore, type AppStore } from '@/store/app-store';

const selector = (state: AppStore) => ({
  addNode: state.addNode,
});

type DraggableNodeItemProps = NodeConfig & {
  onAdd?: () => void;
  className?: string;
  arc?: { path: string; x: number; y: number };
};

export function DraggableNodeItem({
  onAdd,
  className,
  arc,
  ...config
}: DraggableNodeItemProps) {
  const clipId = useId().replace(/:/g, '');
  const { screenToFlowPosition } = useReactFlow();
  const { addNode } = useAppStore(useShallow(selector));
  const [isDragging, setIsDragging] = useState(false);

  const onClick = useCallback(() => {
    const newNode: AppNode = createNodeByType({
      type: config.id,
      position: screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }),
    });

    addNode(newNode);
    onAdd?.();
  }, [config.id, addNode, screenToFlowPosition, onAdd]);

  const onDragStart = useCallback(
    (event: React.DragEvent) => {
      event.dataTransfer.setData(
        'application/reactflow',
        JSON.stringify(config),
      );
      event.dataTransfer.effectAllowed = 'copy';
      setIsDragging(true);
    },
    [config],
  );

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const IconComponent = config.icon ? iconMapping[config.icon] : undefined;

  return (
    <div
      className={cn(
        arc ? 'group/arc absolute inset-0 size-full cursor-grab text-foreground active:cursor-grabbing focus-visible:outline-none' : 'relative flex aspect-square w-[4.5rem] flex-col items-center justify-center gap-1 rounded-md border-2 bg-card p-2 text-center active:scale-[.99] cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors sm:w-20',
        'touch-manipulation select-none',
        isDragging ? 'border-green-500' : 'border-border',
        className,
      )}
      style={arc ? { clipPath: `url(#${clipId})`, pointerEvents: 'auto' } : undefined}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      aria-label={`Add ${config.title}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {arc && <svg viewBox="0 0 480 240" className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
        <defs><clipPath id={clipId} clipPathUnits="objectBoundingBox">
          <path d={arc.path} transform="scale(0.0020833333333333333 0.004166666666666667)" />
        </clipPath></defs>
        <path d={arc.path} className="radial-arc-surface fill-card stroke-border transition-colors group-hover/arc:fill-accent group-focus-visible/arc:stroke-ring group-focus-visible/arc:stroke-[4]" />
      </svg>}
      {isDragging && !arc && (
        <span
          role="presentation"
          className="absolute -top-2 -right-2 rounded-lg border-2 border-green-500 bg-card"
        >
          <Plus className="size-3.5" />
        </span>
      )}
      {arc ? <span className="pointer-events-none absolute flex w-[14cqw] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center"
        style={{ left: `${arc.x / 480 * 100}%`, top: `${arc.y / 240 * 100}%` }}>
        {IconComponent ? <IconComponent className="size-[4cqw] shrink-0" aria-hidden="true" /> : null}
        <span className="text-[clamp(9px,2.3cqw,11px)] leading-tight tracking-normal">{config.title}</span>
      </span> : <>
        {IconComponent ? <IconComponent className="size-5 shrink-0" aria-hidden="true" /> : null}
        <span className="text-[10px] leading-tight line-clamp-2 sm:text-xs">{config.title}</span>
      </>}
    </div>
  );
}
