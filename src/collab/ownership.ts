// Who owns which part of the graph, and helpers that keep each player's
// actions confined to their own nodes. Pure functions: no store, no Yjs.
import type { Edge } from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { AppNode } from '@/components/nodes/types';

export type ViewMode = 'private' | 'shared';

export function nodeOwner(node: Pick<AppNode, 'data'>): string | undefined {
  const owner = node.data?.owner;
  return typeof owner === 'string' ? owner : undefined;
}

/** Nodes created locally have no owner until they reach the room: they're mine. */
export function ownedBy(node: Pick<AppNode, 'data'>, me: string): boolean {
  return (nodeOwner(node) ?? me) === me;
}

export function edgeOwner(
  edge: Edge,
  ownerById: Map<string, string | undefined>,
): string | undefined {
  const owner = (edge.data as { owner?: unknown } | undefined)?.owner;
  if (typeof owner === 'string') return owner;
  return ownerById.get(edge.source) ?? ownerById.get(edge.target);
}

export function ownersById(nodes: AppNode[]) {
  return new Map(nodes.map((node) => [node.id, nodeOwner(node)]));
}

/** The part of the graph one player can see. */
export function visibleGraph(
  nodes: AppNode[],
  edges: Edge[],
  me: string,
  view: ViewMode,
): { nodes: AppNode[]; edges: Edge[] } {
  if (view === 'shared') return { nodes, edges };
  const mine = nodes.filter((node) => ownedBy(node, me));
  const ids = new Set(mine.map((node) => node.id));
  return {
    nodes: mine,
    edges: edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)),
  };
}

/**
 * Undo/redo only ever moves your own nodes. Take the nodes and edges you own
 * from the history snapshot and everything else from the live graph.
 */
export function mergeOwnGraph(
  snapshot: { nodes: AppNode[]; edges: Edge[] },
  current: { nodes: AppNode[]; edges: Edge[] },
  me: string,
): { nodes: AppNode[]; edges: Edge[] } {
  const snapshotOwners = ownersById(snapshot.nodes);
  const currentOwners = ownersById(current.nodes);
  const isMineEdge = (edge: Edge, owners: Map<string, string | undefined>) =>
    (edgeOwner(edge, owners) ?? me) === me;
  const nodes = [
    ...current.nodes.filter((node) => !ownedBy(node, me)),
    ...snapshot.nodes.filter((node) => ownedBy(node, me)),
  ];
  const ids = new Set(nodes.map((node) => node.id));
  const edges = [
    ...current.edges.filter((edge) => !isMineEdge(edge, currentOwners)),
    ...snapshot.edges.filter((edge) => isMineEdge(edge, snapshotOwners)),
  ].filter((edge) => ids.has(edge.source) && ids.has(edge.target));
  return { nodes, edges };
}

/**
 * Give every node and edge a fresh id, and assign all of them to `owner`.
 * Needed whenever a template or patch is loaded into a room: both players
 * loading the same patch would otherwise collide on its fixed ids.
 */
export function adoptGraph(
  nodes: AppNode[],
  edges: Edge[],
  owner: string,
): { nodes: AppNode[]; edges: Edge[] } {
  const ids = new Map(nodes.map((node) => [node.id, nanoid()]));
  return {
    nodes: nodes.map((node) => ({
      ...structuredClone(node),
      id: ids.get(node.id)!,
      data: { ...structuredClone(node.data), owner },
      selected: false,
    })),
    edges: edges
      .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
      .map((edge) => ({
        ...edge,
        id: nanoid(),
        source: ids.get(edge.source)!,
        target: ids.get(edge.target)!,
        data: { ...(edge.data ?? {}), owner },
        selected: false,
      })),
  };
}
