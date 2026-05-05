import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';

export function findConnectedComponents(
  nodes: AppNode[],
  edges: Edge[]
): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      const component: string[] = [];
      dfs(node.id, visited, component, edges);
      if (component.length > 0) {
        components.push(component);
      }
    }
  });

  return components;
}

function dfs(
  nodeId: string,
  visited: Set<string>,
  component: string[],
  edges: Edge[]
) {
  visited.add(nodeId);
  component.push(nodeId);

  edges.forEach((edge) => {
    if (edge.source === nodeId && !visited.has(edge.target)) {
      dfs(edge.target, visited, component, edges);
    } else if (edge.target === nodeId && !visited.has(edge.source)) {
      dfs(edge.source, visited, component, edges);
    }
  });
}
