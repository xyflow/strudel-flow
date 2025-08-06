import { Background, ReactFlow } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { nodeTypes } from '@/components/nodes';
import { edgeTypes } from '@/components/edges';
import { useAppStore } from '@/store/app-context';
import { WorkflowControls } from './controls';
import { useDragAndDrop } from './useDragAndDrop';
import { useUrlStateLoader } from '@/hooks/use-url-state';
import { useGlobalPlayback } from '@/hooks/use-global-playback';

export default function Workflow() {
  useUrlStateLoader();
  useGlobalPlayback(); // Enable global spacebar pause/play

  const {
    nodes,
    edges,
    colorMode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStart,
    onNodeDragStop,
  } = useAppStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      colorMode: state.colorMode,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      onNodeDragStart: state.onNodeDragStart,
      onNodeDragStop: state.onNodeDragStop,
    }))
  );

  const { onDragOver, onDrop } = useDragAndDrop();

  return (
    <div className="reactflow-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeDragThreshold={30}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        colorMode={colorMode}
        fitView
      >
        <Background />
        <WorkflowControls />
      </ReactFlow>
    </div>
  );
}
