import { NodeContextMenu } from './node-context-menu';
import { ReactFlow } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { nodeTypes } from '@/components/nodes/registry';
import deleteEdge from '@/components/edges/delete-edge';
import { useAppStore } from '@/store/app-store';
import { EditorToolbar } from './toolbar';
import { useUrlState } from '@/hooks/use-url-state';
import { useWorkflowRunner } from '@/hooks/use-workflow-runner';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useThemeCss } from '@/hooks/use-theme-css';
import { fitViewOptions } from './fit-view-options';

const edgeTypes = { default: deleteEdge };

export default function Editor() {
  useUrlState();
  useWorkflowRunner();
  useKeyboardShortcuts();

  const { nodes, edges, theme, onNodesChange, onEdgesChange, onConnect } =
    useAppStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        theme: state.theme,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onConnect: state.onConnect,
      })),
    );
  useThemeCss(theme);

  return (
    <NodeContextMenu>
      {(connectionHandlers, onAddNode) => (
        <div
          className="reactflow-wrapper"
          tabIndex={0}
          aria-label="Patch canvas. Right-click or tap empty space to add nodes."
        >
          <ReactFlow
            {...connectionHandlers}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            elevateEdgesOnSelect={false}
            panActivationKeyCode={null}
            minZoom={0.2}
            fitView
            fitViewOptions={fitViewOptions}
          >
            <EditorToolbar onAddNode={onAddNode} />
          </ReactFlow>
        </div>
      )}
    </NodeContextMenu>
  );
}
