import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';

export function PalindromeNode({ id, data }: WorkflowNodeProps) {
  return <WorkflowNode id={id} data={data}></WorkflowNode>;
}

PalindromeNode.strudelOutput = (_: AppNode, strudelString: string) => {
  const palindromeCall = `palindrome()`;
  return strudelString ? `${strudelString}.${palindromeCall}` : palindromeCall;
};
