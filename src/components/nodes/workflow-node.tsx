import { useCallback, useState, useMemo } from 'react';
import { Play, Pause, Trash, NotebookText } from 'lucide-react';

import {
  NodeHeaderTitle,
  NodeHeader,
  NodeHeaderActions,
  NodeHeaderAction,
  NodeHeaderIcon,
} from '@/components/node-header';
import { WorkflowNodeData, AppNodeType } from '@/components/nodes/';
import nodesConfig from '@/components/nodes/';
import { useWorkflowRunner } from '@/hooks/use-workflow-runner';
import { iconMapping } from '@/data/icon-mapping';
import { BaseNode } from '@/components/base-node';
import { useAppStore } from '@/store/app-context';
import PatternPopup from '@/components/pattern-popup';
import { useStrudelStore } from '@/store/strudel-store';
import { BaseHandle } from '@/components/base-handle';
import { Position } from '@xyflow/react';
import { findConnectedComponents } from '@/lib/graph-utils';

function WorkflowNode({
  id,
  data,
  type,
  children,
}: {
  id: string;
  data: WorkflowNodeData;
  type?: AppNodeType;
  children?: React.ReactNode;
}) {
  useStrudelStore((s) => s.pattern);

  const { runWorkflow } = useWorkflowRunner();
  const [show, setShow] = useState(false);

  const { removeNode, edges, nodes, updateNodeData } = useAppStore(
    (state) => state
  );
  const nodeState = useAppStore((state) => state.nodes.find((n) => n.id === id))
    ?.data?.state;

  const isPaused = nodeState === 'paused';

  // Determine if this node is an instrument based on its type
  const isInstrument = type
    ? nodesConfig[type]?.category === 'Instruments'
    : false;

  // Find all connected nodes for this group using findConnectedComponents
  const { connectedNodeIds } = useMemo(() => {
    const allComponents = findConnectedComponents(nodes, edges);
    const connectedComponent = allComponents.find((component) =>
      component.includes(id)
    ) || [id];
    const nodeIds = new Set(connectedComponent);
    return { connectedNodeIds: nodeIds };
  }, [nodes, edges, id]);

  const onPlay = useCallback(() => {
    connectedNodeIds.forEach((nodeId) => {
      updateNodeData(nodeId, { state: 'running' });
    });
    runWorkflow();
  }, [runWorkflow, connectedNodeIds, updateNodeData]);

  const onPause = useCallback(() => {
    // Pause this specific group
    connectedNodeIds.forEach((nodeId) => {
      updateNodeData(nodeId, { state: 'paused' });
    });
  }, [connectedNodeIds, updateNodeData]);

  const onDelete = useCallback(() => {
    removeNode(id);
  }, [id, removeNode]);

  const IconComponent = data?.icon ? iconMapping[data.icon] : undefined;

  return (
    <BaseNode>
      <BaseHandle position={Position.Top} type="target" />
      <BaseHandle position={Position.Bottom} type="source" />
      <NodeHeader>
        <NodeHeaderIcon>
          {IconComponent ? <IconComponent aria-label={data?.icon} /> : null}
        </NodeHeaderIcon>
        <NodeHeaderTitle>{data?.title}</NodeHeaderTitle>
        <NodeHeaderActions>
          {isInstrument && (
            <NodeHeaderAction
              onClick={isPaused ? onPlay : onPause}
              label={isPaused ? 'Resume group' : 'Pause group'}
              variant={isPaused ? 'default' : 'ghost'}
            >
              {isPaused ? <Play /> : <Pause />}
            </NodeHeaderAction>
          )}
          <NodeHeaderAction
            label="Pattern Preview"
            onClick={() => setShow(!show)}
          >
            <NotebookText />
          </NodeHeaderAction>
          <NodeHeaderAction
            onClick={onDelete}
            variant="ghost"
            label="Delete node"
          >
            <Trash />
          </NodeHeaderAction>
        </NodeHeaderActions>
      </NodeHeader>
      {children}
      {show && <PatternPopup id={id} />}
    </BaseNode>
  );
}

export default WorkflowNode;
