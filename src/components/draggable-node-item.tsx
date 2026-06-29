import { useCallback, useState } from 'react';
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
};

export function DraggableNodeItem({
  onAdd,
  className,
  ...config
}: DraggableNodeItemProps) {
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
        'relative flex aspect-square w-[4.5rem] flex-col items-center justify-center gap-1 rounded-lg border-2 bg-card p-2 text-center active:scale-[.99] cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors sm:w-20',
        isDragging ? 'border-green-500' : 'border-border',
        className,
      )}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {isDragging && (
        <span
          role="presentation"
          className="absolute -top-2 -right-2 rounded-md border-2 border-green-500 bg-card"
        >
          <Plus className="size-3.5" />
        </span>
      )}
      {IconComponent ? (
        <IconComponent className="size-5 shrink-0" aria-label={config.icon} />
      ) : null}
      <span className="text-[10px] leading-tight line-clamp-2 sm:text-xs">
        {config.title}
      </span>
    </div>
  );
}
