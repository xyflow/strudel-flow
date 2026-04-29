import { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { AppNode, createNodeByType } from '@/components/nodes';
import { useAppStore } from '@/store/app-context';
import { AppStore } from '@/store/app-store';

const selector = (state: AppStore) => ({
  addNode: state.addNode,
});

export function useDragAndDrop() {
  const { screenToFlowPosition } = useReactFlow();
  const { addNode } = useAppStore(useShallow(selector));

  const onDrop: React.DragEventHandler = useCallback(
    (event) => {
      const nodeProps = JSON.parse(
        event.dataTransfer.getData('application/reactflow')
      );

      if (!nodeProps) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: AppNode = createNodeByType({
        type: nodeProps.id,
        position,
      });
      addNode(newNode);
    },
    [addNode, screenToFlowPosition]
  );

  const onDragOver: React.DragEventHandler = useCallback(
    (event) => event.preventDefault(),
    []
  );

  return useMemo(() => ({ onDrop, onDragOver }), [onDrop, onDragOver]);
}
