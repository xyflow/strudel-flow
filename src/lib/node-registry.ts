/**
 * Registry for node types and their strudel output methods
 */

import { nodeTypes } from '@/components/nodes';
import { AppNode } from '@/components/nodes';

// Type for components that have strudelOutput method
type NodeWithStrudelOutput = {
  strudelOutput?: (node: AppNode, strudelString: string) => string;
};

export function getNodeStrudelOutput(nodeType: string) {
  const NodeComponent = nodeTypes[nodeType as keyof typeof nodeTypes] as NodeWithStrudelOutput;
  return NodeComponent?.strudelOutput;
}
