import { useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';

export function RevNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Set the rev effect once when the node is mounted
  useEffect(() => {
    updateNode(id, { rev: true });
  }, [id, updateNode]);

  return <WorkflowNode id={id} data={data}></WorkflowNode>;
}
