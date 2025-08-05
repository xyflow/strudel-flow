import { useCallback, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Trash,
  NotebookText,
  VolumeX,
  Volume2,
} from 'lucide-react';

import {
  NodeHeaderTitle,
  NodeHeader,
  NodeHeaderActions,
  NodeHeaderAction,
  NodeHeaderIcon,
} from '@/components/node-header';
import { WorkflowNodeData } from '@/components/nodes/';
import { useWorkflowRunner } from '@/hooks/use-workflow-runner';
import { iconMapping } from '@/data/icon-mapping';
import { BaseNode } from '@/components/base-node';
import { NodeStatusIndicator } from '@/components/node-status-indicator';
import { useAppStore } from '@/store/app-context';
import PatternPopup from '@/components/pattern-popup';
import { useStrudelStore } from '@/store/strudel-store';
import { BaseHandle } from '@/components/base-handle';
import { Position } from '@xyflow/react';
import { findConnectedComponents } from '@/lib/graph-utils';

function WorkflowNode({
  id,
  data,
  children,
}: {
  id: string;
  data: WorkflowNodeData;
  children?: React.ReactNode;
}) {
  useStrudelStore((s) => s.pattern);

  const { runWorkflow } = useWorkflowRunner();
  const [show, setShow] = useState(false);
  const removeNodeConfig = useStrudelStore((state) => state.removeNodeConfig);
  const muteNode = useStrudelStore((state) => state.muteNode);
  const unmuteNode = useStrudelStore((state) => state.unmuteNode);
  const isNodeMuted = useStrudelStore((state) => state.isNodeMuted);
  const { removeNode, edges, nodes, updateNodeData } = useAppStore(
    (state) => state
  );
  const nodeState = useAppStore((state) => state.nodes.find((n) => n.id === id))
    ?.data?.state;

  const isMuted = isNodeMuted(id);
  const isPaused = nodeState === 'paused';

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

  const onMute = useCallback(() => {
    if (isMuted) {
      unmuteNode(id);
    } else {
      muteNode(id);
    }
  }, [id, isMuted, muteNode, unmuteNode]);

  const onDelete = useCallback(() => {
    removeNodeConfig(id);
    removeNode(id);
  }, [id, removeNode, removeNodeConfig]);

  const IconComponent = data?.icon ? iconMapping[data.icon] : undefined;

  return (
    <NodeStatusIndicator status={data?.status}>
      <BaseNode>
        <BaseHandle position={Position.Top} type="target" />
        <BaseHandle position={Position.Bottom} type="source" />
        <NodeHeader>
          <NodeHeaderIcon>
            {IconComponent ? <IconComponent aria-label={data?.icon} /> : null}
          </NodeHeaderIcon>
          <NodeHeaderTitle>{data?.title}</NodeHeaderTitle>
          <NodeHeaderActions>
            <NodeHeaderAction
              onClick={isPaused ? onPlay : onPause}
              label={isPaused ? 'Resume group' : 'Pause group'}
              variant={isPaused ? 'default' : 'ghost'}
            >
              {isPaused ? <Play /> : <Pause />}
            </NodeHeaderAction>
            <NodeHeaderAction
              onClick={onMute}
              label={isMuted ? 'Unmute node' : 'Mute node'}
              variant={isMuted ? 'default' : 'ghost'}
            >
              {isMuted ? <VolumeX /> : <Volume2 />}
            </NodeHeaderAction>
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
    </NodeStatusIndicator>
  );
}

export default WorkflowNode;
