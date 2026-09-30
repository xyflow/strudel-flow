import { nanoid } from 'nanoid';
import type { GraphSnapshot } from './graph-history';

export function copySelectedNodes(graph: GraphSnapshot): GraphSnapshot | null {
  const nodes = graph.nodes.filter((node) => node.selected);
  if (!nodes.length) return null;
  const ids = new Set(nodes.map((node) => node.id));
  return structuredClone({
    nodes,
    edges: graph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)),
  });
}

export function pasteNodes(graph: GraphSnapshot, clipboard: GraphSnapshot, offset: number): GraphSnapshot {
  const ids = new Map(clipboard.nodes.map((node) => [node.id, nanoid()]));
  const copy = structuredClone(clipboard);
  return {
    nodes: [
      ...graph.nodes.map((node) => ({ ...node, selected: false })),
      ...copy.nodes.map((node) => ({
        ...node,
        id: ids.get(node.id)!,
        position: { x: node.position.x + offset, y: node.position.y + offset },
        selected: true,
        dragging: false,
        resizing: false,
      })),
    ],
    edges: [
      ...graph.edges.map((edge) => ({ ...edge, selected: false })),
      ...copy.edges.map((edge) => ({
        ...edge,
        id: nanoid(),
        source: ids.get(edge.source)!,
        target: ids.get(edge.target)!,
        selected: false,
      })),
    ],
  };
}
