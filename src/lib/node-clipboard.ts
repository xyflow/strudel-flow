import type { GraphSnapshot } from './graph-history';

export function copySelectedNodes(graph: GraphSnapshot): GraphSnapshot | null {
  const nodes = graph.nodes.filter((node) => node.selected);
  if (!nodes.length) return null;
  const ids = new Set(nodes.map((node) => node.id));
  return structuredClone({
    nodes,
    edges: graph.edges.filter(
      (edge) => ids.has(edge.source) && ids.has(edge.target),
    ),
  });
}
