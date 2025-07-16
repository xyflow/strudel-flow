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
  const pauseGroup = useStrudelStore((state) => state.pauseGroup);
  const unpauseGroup = useStrudelStore((state) => state.unpauseGroup);
  const isGroupPaused = useStrudelStore((state) => state.isGroupPaused);
  const { removeNode, edges, nodes } = useAppStore((state) => state);

  const isMuted = isNodeMuted(id);

  // Find all connected nodes for this group using findConnectedComponents
  const { connectedNodeIds, groupId } = useMemo(() => {
    const allComponents = findConnectedComponents(nodes, edges);
    const connectedComponent = allComponents.find(component => component.includes(id)) || [id];
    const nodeIds = new Set(connectedComponent);
    const gId = Array.from(nodeIds).sort().join('-');
    return { connectedNodeIds: nodeIds, groupId: gId };
  }, [nodes, edges, id]);

  const isGroupCurrentlyPaused = isGroupPaused(groupId);

  const onPlay = useCallback(() => {
    if (isGroupCurrentlyPaused) {
      // Unpause the group first, then run workflow
      unpauseGroup(groupId);
    }
    runWorkflow();
  }, [runWorkflow, isGroupCurrentlyPaused, unpauseGroup, groupId]);

  const onPause = useCallback(() => {
    // Pause this specific group
    pauseGroup(groupId, Array.from(connectedNodeIds));
  }, [pauseGroup, groupId, connectedNodeIds]);

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
              onClick={isGroupCurrentlyPaused ? onPlay : onPause}
              label={isGroupCurrentlyPaused ? 'Resume group' : 'Pause group'}
              variant={isGroupCurrentlyPaused ? 'default' : 'ghost'}
            >
              {isGroupCurrentlyPaused ? <Play /> : <Pause />}
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
