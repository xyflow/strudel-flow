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
import { useNodeClipboard } from '@/hooks/use-node-clipboard';
import { useThemeCss } from '@/hooks/use-theme-css';
import { fitViewOptions } from './fit-view-options';

const edgeTypes = { default: deleteEdge };

export default function Editor() {
  useUrlState();
  useWorkflowRunner();
  useKeyboardShortcuts();
  const clipboard = useNodeClipboard();

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
          aria-label="Patch canvas. Paste Strudel code or right-click empty space to add nodes."
        >
          {clipboard.error && (
            <div
              role="alert"
              className="absolute left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-3 rounded border bg-background p-3 text-sm shadow-lg"
            >
              {clipboard.error}
              <button onClick={clipboard.dismiss} aria-label="Dismiss">
                ×
              </button>
            </div>
          )}
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
            minZoom={0.05}
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
