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
import { useVisibleGraph } from '@/collab/use-visible-graph';
import { EmptyPartHint } from '@/collab/collab-ui';

const edgeTypes = { default: deleteEdge };

export default function Editor() {
  useUrlState();
  useWorkflowRunner();
  useKeyboardShortcuts();

  const { colorMode, theme, onNodesChange, onEdgesChange, onConnect } =
    useAppStore(
      useShallow((state) => ({
        colorMode: state.colorMode,
        theme: state.theme,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onConnect: state.onConnect,
      })),
    );
  // In a jam room with private view this is only your own part. Changes from
  // React Flow are keyed by id, so the store handlers still apply them to the
  // full graph, which is what gets played.
  const { nodes, edges } = useVisibleGraph();
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
            colorMode={colorMode}
            panActivationKeyCode={null}
            minZoom={0.2}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
          >
            <EditorToolbar onAddNode={onAddNode} />
            {nodes.length === 0 && <EmptyPartHint />}
          </ReactFlow>
        </div>
      )}
    </NodeContextMenu>
  );
}
