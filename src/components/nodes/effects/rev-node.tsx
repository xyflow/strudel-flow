import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';

export function RevNode({ id, data }: WorkflowNodeProps) {
  return <WorkflowNode id={id} data={data}></WorkflowNode>;
}

RevNode.strudelOutput = (node: AppNode, strudelString: string) => {
  // Rev effect is always active when node exists
  const revCall = `rev()`;
  return strudelString ? `${strudelString}.${revCall}` : revCall;
};
