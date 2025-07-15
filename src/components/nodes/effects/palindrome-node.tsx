import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useEffect } from 'react';

export function PalindromeNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Set the palindrome effect once when the node is mounted
  useEffect(() => {
    updateNode(id, { palindrome: true });
  }, [id, updateNode]);

  return <WorkflowNode id={id} data={data}></WorkflowNode>;
}

PalindromeNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const palindrome = useStrudelStore.getState().config[node.id]?.palindrome;
  if (!palindrome) return strudelString;

  const palindromeCall = `palindrome()`;
  return strudelString ? `${strudelString}.${palindromeCall}` : palindromeCall;
};
