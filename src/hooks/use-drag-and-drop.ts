import { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import nodesConfig, { AppNode, createNodeByType, type AppNodeType } from '@/components/nodes/registry';
import { useAppStore, AppStore } from '@/store/app-store';

const selector = (state: AppStore) => ({
  addNode: state.addNode,
});

export function useDragAndDrop() {
  const { screenToFlowPosition } = useReactFlow();
  const { addNode } = useAppStore(useShallow(selector));

  const onDrop: React.DragEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      const payload = event.dataTransfer.getData('application/reactflow');
      if (!payload) return;
      let type: AppNodeType;
      try {
        const value = JSON.parse(payload);
        if (!value || !Object.prototype.hasOwnProperty.call(nodesConfig, value.id)) return;
        type = value.id;
      } catch { return; }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: AppNode = createNodeByType({
        type,
        position,
      });
      addNode(newNode);
    },
    [addNode, screenToFlowPosition],
  );

  const onDragOver: React.DragEventHandler = useCallback(
    (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; },
    [],
  );

  return useMemo(() => ({ onDrop, onDragOver }), [onDrop, onDragOver]);
}
