// Two-way binding between the Zustand app store and a room's Y.Doc.
//
// Instead of routing every mutation through a sync API, the binding diffs the
// store after each change. strudel-flow writes to the store from many places
// (context menu, paste, undo, patch loading), and this catches them all.
//
// Doc layout (all values are plain JSON; last write wins per entry):
//   nodes:     Y.Map<nodeId, {id, type, position, data}>   data.owner = userId
//   edges:     Y.Map<edgeId, {id, source, target, ..., data: {owner}}>
//   meta:      Y.Map {name, cpm, bpc, view}
//   transport: Y.Map {playing, anchorMs, anchorCycle, cps}
//
// A node without data.owner in the local store is treated as the local
// player's (anything created locally is). It is written to the doc with the
// owner filled in.
import * as Y from 'yjs';
import type { Edge } from '@xyflow/react';
import type { AppNode } from '@/components/nodes/types';
import { edgeOwner, nodeOwner, ownersById, type ViewMode } from './ownership';

export const LOCAL_ORIGIN = 'strudel-together:local';

export type BoundState = {
  nodes: AppNode[];
  edges: Edge[];
  cpm: string;
  bpc: string;
  name: string;
  isPlaying: boolean;
  error: string | null;
  graphRevision: number;
  toggle: () => void;
};

export type BindableStore = {
  getState(): BoundState;
  setState(partial: Partial<BoundState>): void;
  subscribe(
    listener: (state: BoundState, previous: BoundState) => void,
  ): () => void;
};

export type Transport = {
  playing: boolean;
  /** Server time (ms) at which the transport was at anchorCycle. */
  anchorMs: number;
  anchorCycle: number;
  cps: number;
};

export function cpsOf(cpm: string, bpc: string) {
  return (parseInt(cpm) || 120) / (parseInt(bpc) || 4) / 60;
}

export function cycleAt(transport: Transport, serverMs: number) {
  return (
    transport.anchorCycle +
    ((serverMs - transport.anchorMs) / 1000) * transport.cps
  );
}

// True while the binding is writing remote changes into the store, so other
// store subscribers (undo history) can tell them apart from local edits.
let remoteDepth = 0;
export function isApplyingRemote() {
  return remoteDepth > 0;
}

function durableNode(node: AppNode, me: string): AppNode {
  return {
    id: node.id,
    type: node.type,
    position: { x: node.position.x, y: node.position.y },
    data: { ...node.data, owner: nodeOwner(node) ?? me },
  } as AppNode;
}

function durableEdge(
  edge: Edge,
  owners: Map<string, string | undefined>,
  me: string,
): Edge {
  const durable: Edge = {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    data: { ...(edge.data ?? {}), owner: edgeOwner(edge, owners) ?? me },
  };
  if (edge.sourceHandle != null) durable.sourceHandle = edge.sourceHandle;
  if (edge.targetHandle != null) durable.targetHandle = edge.targetHandle;
  if (edge.type) durable.type = edge.type;
  return durable;
}

const json = (value: unknown) => JSON.stringify(value);
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export type Binding = ReturnType<typeof bindStoreToDoc>;

export function bindStoreToDoc({
  store,
  doc,
  me,
  now,
  onViewChange,
  onTransportChange,
}: {
  store: BindableStore;
  doc: Y.Doc;
  /** The local player's user id. */
  me: string;
  /** Server-synchronised clock, in ms. */
  now: () => number;
  onViewChange?: (view: ViewMode) => void;
  onTransportChange?: (transport: Transport) => void;
}) {
  const yNodes = doc.getMap<AppNode>('nodes');
  const yEdges = doc.getMap<Edge>('edges');
  const yMeta = doc.getMap<unknown>('meta');
  const yTransport = doc.getMap<unknown>('transport');

  const getView = (): ViewMode =>
    yMeta.get('view') === 'shared' ? 'shared' : 'private';
  const canEdit = (owner: string | undefined) =>
    owner === undefined || owner === me || getView() === 'shared';

  const getTransport = (): Transport => {
    const { cpm, bpc } = store.getState();
    const num = (key: string, fallback: number) => {
      const value = yTransport.get(key);
      return typeof value === 'number' && Number.isFinite(value)
        ? value
        : fallback;
    };
    return {
      playing: yTransport.get('playing') === true,
      anchorMs: num('anchorMs', 0),
      anchorCycle: num('anchorCycle', 0),
      cps: num('cps', cpsOf(cpm, bpc)),
    };
  };

  const applyRemote = (partial: Partial<BoundState>) => {
    remoteDepth += 1;
    try {
      store.setState(partial);
    } finally {
      remoteDepth -= 1;
    }
  };

  // ---- Y -> store ---------------------------------------------------------

  function mergeRemote<T extends { id: string }>(
    local: T[],
    ymap: Y.Map<T>,
    durable: (item: T) => unknown,
    combine: (local: T, remote: T) => T,
    keepLocal: (item: T) => boolean = () => false,
  ): T[] {
    let changed = false;
    const next: T[] = [];
    const seen = new Set<string>();
    for (const item of local) {
      seen.add(item.id);
      const remote = ymap.get(item.id);
      if (remote === undefined) {
        changed = true; // deleted remotely
        continue;
      }
      if (keepLocal(item) || json(remote) === json(durable(item))) {
        next.push(item);
        continue;
      }
      next.push(combine(item, plain(remote)));
      changed = true;
    }
    for (const [id, remote] of ymap.entries()) {
      if (seen.has(id)) continue;
      next.push(plain(remote));
      changed = true;
    }
    return changed ? next : local;
  }

  function pullGraph() {
    const state = store.getState();
    const owners = ownersById(state.nodes);
    const nodes = mergeRemote(
      state.nodes,
      yNodes,
      (node) => durableNode(node, me),
      (local, remote) => ({
        ...local,
        type: remote.type,
        position: remote.position,
        data: remote.data,
      }),
      // While I'm dragging a node, my position wins until I drop it.
      (node) => node.dragging === true,
    );
    const edges = mergeRemote(
      state.edges,
      yEdges,
      (edge) => durableEdge(edge, owners, me),
      (local, remote) => ({ ...remote, selected: local.selected }),
    );
    if (nodes !== state.nodes || edges !== state.edges) {
      applyRemote({ nodes, edges });
    }
  }

  function pullMeta() {
    const state = store.getState();
    const partial: Partial<BoundState> = {};
    for (const key of ['cpm', 'bpc', 'name'] as const) {
      const value = yMeta.get(key);
      if (typeof value === 'string' && value !== state[key])
        partial[key] = value;
    }
    if (Object.keys(partial).length) applyRemote(partial);
  }

  function pullTransport() {
    const transport = getTransport();
    if (store.getState().isPlaying !== transport.playing) {
      applyRemote({ isPlaying: transport.playing, error: null });
    }
    onTransportChange?.(transport);
  }

  // ---- store -> Y ---------------------------------------------------------

  let reconcileQueued = false;
  const queueReconcile = () => {
    if (reconcileQueued) return;
    reconcileQueued = true;
    // Deferred so we never call setState from inside a store listener.
    queueMicrotask(() => {
      reconcileQueued = false;
      pullGraph();
    });
  };

  function pushGraph(state: BoundState) {
    const owners = ownersById(state.nodes);
    let needsReconcile = false;
    doc.transact(() => {
      const localNodes = new Set<string>();
      for (const node of state.nodes) {
        localNodes.add(node.id);
        if (node.dragging) continue; // sent on drop
        const remote = yNodes.get(node.id);
        const durable = durableNode(node, me);
        const key = json(durable);
        if (remote !== undefined && json(remote) === key) continue;
        if (
          !canEdit(nodeOwner(node)) ||
          (remote !== undefined && !canEdit(nodeOwner(remote)))
        ) {
          // A local write touched someone else's node: put theirs back.
          needsReconcile = true;
          continue;
        }
        yNodes.set(node.id, plain(durable));
      }
      for (const [id, remote] of yNodes.entries()) {
        if (localNodes.has(id)) continue;
        if (canEdit(nodeOwner(remote))) yNodes.delete(id);
        else needsReconcile = true; // removed locally, but it isn't mine
      }

      const localEdges = new Set<string>();
      for (const edge of state.edges) {
        localEdges.add(edge.id);
        const remote = yEdges.get(edge.id);
        const durable = durableEdge(edge, owners, me);
        const key = json(durable);
        if (remote !== undefined && json(remote) === key) continue;
        const remoteOwner =
          remote !== undefined ? edgeOwner(remote, owners) : undefined;
        if (
          !canEdit(edgeOwner(edge, owners)) ||
          (remote !== undefined && !canEdit(remoteOwner))
        ) {
          needsReconcile = true;
          continue;
        }
        yEdges.set(edge.id, plain(durable));
      }
      for (const [id, remote] of yEdges.entries()) {
        if (localEdges.has(id)) continue;
        if (canEdit(edgeOwner(remote, owners))) yEdges.delete(id);
        else needsReconcile = true;
      }
    }, LOCAL_ORIGIN);
    if (needsReconcile) queueReconcile();
  }

  function pushMeta(state: BoundState, previous: BoundState) {
    const tempoChanged =
      state.cpm !== previous.cpm || state.bpc !== previous.bpc;
    doc.transact(() => {
      for (const key of ['cpm', 'bpc', 'name'] as const) {
        if (state[key] !== previous[key]) yMeta.set(key, state[key]);
      }
      if (tempoChanged) {
        // Re-anchor so the new tempo continues from the current cycle
        // instead of jumping to wherever the new cps would have put us.
        const transport = getTransport();
        const nowMs = now();
        const cycle = transport.playing ? cycleAt(transport, nowMs) : 0;
        yTransport.set('anchorCycle', cycle);
        yTransport.set('anchorMs', nowMs);
        yTransport.set('cps', cpsOf(state.cpm, state.bpc));
      }
    }, LOCAL_ORIGIN);
    if (tempoChanged) onTransportChange?.(getTransport());
  }

  function setPlaying(playing: boolean) {
    const { cpm, bpc } = store.getState();
    doc.transact(() => {
      yTransport.set('playing', playing);
      if (playing) {
        yTransport.set('anchorMs', now());
        yTransport.set('anchorCycle', 0);
        yTransport.set('cps', cpsOf(cpm, bpc));
      }
    }, LOCAL_ORIGIN);
    applyRemote({ isPlaying: playing, error: null });
    onTransportChange?.(getTransport());
  }

  function setView(view: ViewMode) {
    doc.transact(() => yMeta.set('view', view), LOCAL_ORIGIN);
    onViewChange?.(view);
  }

  // ---- wiring -------------------------------------------------------------

  const unsubscribe = store.subscribe((state, previous) => {
    if (isApplyingRemote()) return;
    if (state.nodes !== previous.nodes || state.edges !== previous.edges)
      pushGraph(state);
    if (
      state.cpm !== previous.cpm ||
      state.bpc !== previous.bpc ||
      state.name !== previous.name
    )
      pushMeta(state, previous);
  });

  const onAfterTransaction = (transaction: Y.Transaction) => {
    if (transaction.origin === LOCAL_ORIGIN) return;
    // Yjs's types make Map<AbstractType<YEvent>> reject Y.Map<T> keys.
    const changed = transaction.changed as Map<unknown, unknown>;
    if (changed.has(yNodes) || changed.has(yEdges)) pullGraph();
    if (changed.has(yMeta)) {
      pullMeta();
      onViewChange?.(getView());
    }
    if (changed.has(yTransport)) pullTransport();
  };
  doc.on('afterTransaction', onAfterTransaction);

  // The shared transport replaces the local play/pause toggle.
  const originalToggle = store.getState().toggle;
  store.setState({
    toggle: () => {
      const transport = getTransport();
      if (transport.playing && !store.getState().isPlaying) {
        // Playback stopped only here (e.g. after an error): rejoin.
        store.setState({ isPlaying: true, error: null });
        return;
      }
      setPlaying(!transport.playing);
    },
  });

  // Initial hydrate: the doc is the source of truth. Fill in meta fields a
  // brand-new room doesn't have yet from the local defaults.
  {
    const state = store.getState();
    doc.transact(() => {
      for (const key of ['cpm', 'bpc', 'name'] as const) {
        if (typeof yMeta.get(key) !== 'string') yMeta.set(key, state[key]);
      }
    }, LOCAL_ORIGIN);
    const meta = (key: 'cpm' | 'bpc' | 'name') => yMeta.get(key) as string;
    applyRemote({
      nodes: [...yNodes.values()].map(plain),
      edges: [...yEdges.values()].map(plain),
      cpm: meta('cpm'),
      bpc: meta('bpc'),
      name: meta('name'),
      isPlaying: getTransport().playing,
      error: null,
      graphRevision: state.graphRevision + 1,
    });
    onViewChange?.(getView());
  }

  return {
    getView,
    setView,
    getTransport,
    setPlaying,
    /** Number of nodes in the room, across all players. */
    nodeCount: () => yNodes.size,
    unbind() {
      unsubscribe();
      doc.off('afterTransaction', onAfterTransaction);
      store.setState({ toggle: originalToggle });
    },
  };
}
