import type { Edge } from '@xyflow/react';
import type { AppNode } from '@/components/nodes/types';

export type GraphSnapshot = { nodes: AppNode[]; edges: Edge[] };

// React Flow's selection and layout bookkeeping are not document edits.
function graphKey(graph: GraphSnapshot) {
  return JSON.stringify({
    nodes: graph.nodes.map((node) => {
      const { selected, measured, dragging, resizing, ...document } = node;
      void selected; void measured; void dragging; void resizing;
      return document;
    }),
    edges: graph.edges.map(({ selected, ...edge }) => {
      void selected;
      return edge;
    }),
  });
}

export function createGraphHistory(initial: GraphSnapshot, limit = 100) {
  let current = structuredClone(initial);
  let key = graphKey(initial);
  let past: GraphSnapshot[] = [];
  let future: GraphSnapshot[] = [];
  let lastGroup: object | undefined;

  return {
    reset(graph: GraphSnapshot) {
      current = structuredClone(graph);
      key = graphKey(graph);
      past = [];
      future = [];
      lastGroup = undefined;
    },
    record(graph: GraphSnapshot, group?: object) {
      const nextKey = graphKey(graph);
      if (nextKey !== key) {
        if (!group || group !== lastGroup) {
          past = [...past.slice(-(limit - 1)), current];
        }
        future = [];
        lastGroup = group;
      }
      current = structuredClone(graph);
      key = nextKey;
    },
    undo(): GraphSnapshot | undefined {
      const previous = past.pop();
      if (!previous) return;
      future.push(current);
      current = previous;
      key = graphKey(current);
      lastGroup = undefined;
      return structuredClone(current);
    },
    redo(): GraphSnapshot | undefined {
      const next = future.pop();
      if (!next) return;
      past.push(current);
      current = next;
      key = graphKey(current);
      lastGroup = undefined;
      return structuredClone(current);
    },
  };
}
