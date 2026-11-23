import type { Edge } from '@xyflow/react';
import type { AppNode } from '@/components/nodes/types';

export function orderPatternNodes(nodes: AppNode[], edges: Edge[]): AppNode[] {
  const ids = new Set(nodes.map((node) => node.id));
  const connections = edges.filter(
    (edge) => ids.has(edge.source) && ids.has(edge.target),
  );
  const indegrees = new Map(nodes.map((node) => [node.id, 0]));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const edge of connections)
    indegrees.set(edge.target, indegrees.get(edge.target)! + 1);
  const ready = nodes.filter((node) => indegrees.get(node.id) === 0);
  const ordered: AppNode[] = [];
  for (let index = 0; index < ready.length; index++) {
    const node = ready[index];
    ordered.push(node);
    for (const edge of connections.filter((edge) => edge.source === node.id)) {
      const remaining = indegrees.get(edge.target)! - 1;
      indegrees.set(edge.target, remaining);
      if (remaining === 0) ready.push(byId.get(edge.target)!);
    }
  }
  if (ordered.length !== nodes.length)
    throw new Error('Pattern chains cannot contain circular connections.');
  return ordered;
}
