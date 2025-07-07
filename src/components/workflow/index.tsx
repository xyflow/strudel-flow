import { Background, ReactFlow, ConnectionLineType } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { nodeTypes } from '@/components/nodes';
import { useAppStore } from '@/store/app-context';
import { WorkflowControls } from './controls';
import { useDragAndDrop } from './useDragAndDrop';

const defaultEdgeOptions = { type: 'smootstep' };

export default function Workflow() {
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
        connectionLineType={ConnectionLineType.SmoothStep}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeDragThreshold={20}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        colorMode={colorMode}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        <WorkflowControls />
      </ReactFlow>
    </div>
  );
}
