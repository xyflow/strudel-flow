import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { createStore } from 'zustand/vanilla';
import type { Edge } from '@xyflow/react';
import type { AppNode } from '@/components/nodes/types';
import { bindStoreToDoc, cycleAt, type BoundState } from './binding';
import { adoptGraph, mergeOwnGraph, visibleGraph } from './ownership';

function makeStore(initial: Partial<BoundState> = {}) {
  return createStore<BoundState>()((set) => ({
    nodes: [],
    edges: [],
    cpm: '120',
    bpc: '4',
    name: 'Untitled patch',
    isPlaying: false,
    error: null,
    graphRevision: 0,
    toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
    ...initial,
  }));
}

/** Two docs that sync instantly, like two browsers on one server. */
function linkedDocs() {
  const a = new Y.Doc();
  const b = new Y.Doc();
  a.on('update', (update: Uint8Array, origin: unknown) => {
    if (origin !== 'net') Y.applyUpdate(b, update, 'net');
  });
  b.on('update', (update: Uint8Array, origin: unknown) => {
    if (origin !== 'net') Y.applyUpdate(a, update, 'net');
  });
  return [a, b] as const;
}

function node(id: string, extra: Partial<AppNode> = {}): AppNode {
  return {
    id,
    type: 'pad-node',
    position: { x: 0, y: 0 },
    data: { title: id, state: 'running' },
    ...extra,
  } as AppNode;
}

const edge = (source: string, target: string): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
  type: 'default',
});

const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve));

function setup() {
  let clock = 1_000_000;
  const now = () => clock;
  const [docA, docB] = linkedDocs();
  const alice = makeStore();
  const bob = makeStore();
  const a = bindStoreToDoc({ store: alice, doc: docA, me: 'alice', now });
  const b = bindStoreToDoc({ store: bob, doc: docB, me: 'bob', now });
  return {
    alice,
    bob,
    a,
    b,
    docA,
    advance: (ms: number) => (clock += ms),
    now,
  };
}

describe('graph sync', () => {
  it("sends a player's new nodes and edges to the partner, owned by the creator", () => {
    const { alice, bob } = setup();
    alice.setState({
      nodes: [node('p1'), node('v1')],
      edges: [edge('p1', 'v1')],
    });
    const nodes = bob.getState().nodes;
    expect(nodes.map((n) => n.id)).toEqual(['p1', 'v1']);
    expect(nodes.every((n) => n.data.owner === 'alice')).toBe(true);
    expect(bob.getState().edges).toHaveLength(1);
    expect((bob.getState().edges[0].data as { owner: string }).owner).toBe(
      'alice',
    );
  });

  it('keeps local-only fields (selection, size) when a remote change arrives', () => {
    const { alice, bob } = setup();
    alice.setState({ nodes: [node('p1')] });
    bob.setState({
      nodes: bob
        .getState()
        .nodes.map((n) => ({ ...n, selected: true, measured: { width: 10, height: 10 } })),
    });
    alice.setState({
      nodes: [node('p1', { position: { x: 50, y: 0 } })],
    });
    const [p1] = bob.getState().nodes;
    expect(p1.position.x).toBe(50);
    expect(p1.selected).toBe(true);
    expect(p1.measured).toEqual({ width: 10, height: 10 });
  });

  it('does not send a node while it is being dragged, only on drop', () => {
    const { alice, bob } = setup();
    alice.setState({ nodes: [node('p1')] });
    alice.setState({
      nodes: [node('p1', { position: { x: 30, y: 0 }, dragging: true })],
    });
    expect(bob.getState().nodes[0].position.x).toBe(0);
    alice.setState({
      nodes: [node('p1', { position: { x: 40, y: 0 }, dragging: false })],
    });
    expect(bob.getState().nodes[0].position.x).toBe(40);
  });

  it('syncs deletions of your own nodes', () => {
    const { alice, bob } = setup();
    alice.setState({ nodes: [node('p1'), node('p2')] });
    alice.setState({ nodes: [node('p2')] });
    expect(bob.getState().nodes.map((n) => n.id)).toEqual(['p2']);
  });
});

describe('private view', () => {
  it("hides the partner's nodes and edges", () => {
    const { alice, bob } = setup();
    alice.setState({ nodes: [node('a1'), node('a2')], edges: [edge('a1', 'a2')] });
    bob.setState({ nodes: [...bob.getState().nodes, node('b1')] });
    const view = visibleGraph(bob.getState().nodes, bob.getState().edges, 'bob', 'private');
    expect(view.nodes.map((n) => n.id)).toEqual(['b1']);
    expect(view.edges).toEqual([]);
    const shared = visibleGraph(bob.getState().nodes, bob.getState().edges, 'bob', 'shared');
    expect(shared.nodes).toHaveLength(3);
  });

  it("replacing the whole graph locally never deletes the partner's nodes", async () => {
    const { alice, bob } = setup();
    alice.setState({ nodes: [node('a1')] });
    // e.g. loading a patch the old way: replaces everything
    bob.setState({ nodes: [node('b1')], edges: [] });
    expect(alice.getState().nodes.map((n) => n.id).sort()).toEqual(['a1', 'b1']);
    await flush();
    expect(bob.getState().nodes.map((n) => n.id).sort()).toEqual(['a1', 'b1']);
  });

  it("local edits to the partner's node are reverted, not sent", async () => {
    const { alice, bob } = setup();
    alice.setState({ nodes: [node('a1')] });
    bob.setState({
      nodes: bob.getState().nodes.map((n) => ({
        ...n,
        data: { ...n.data, title: 'hijacked' },
      })),
    });
    expect(alice.getState().nodes[0].data.title).toBe('a1');
    await flush();
    expect(bob.getState().nodes[0].data.title).toBe('a1');
  });

  it("in shared view, players can edit each other's nodes", () => {
    const { alice, bob, b } = setup();
    b.setView('shared');
    alice.setState({ nodes: [node('a1')] });
    bob.setState({
      nodes: bob.getState().nodes.map((n) => ({
        ...n,
        data: { ...n.data, title: 'edited by bob' },
      })),
    });
    expect(alice.getState().nodes[0].data.title).toBe('edited by bob');
    expect(alice.getState().nodes[0].data.owner).toBe('alice');
  });
});

describe('late joiner', () => {
  it('hydrates from the room when binding to a doc that already has state', () => {
    const [docA, docB] = linkedDocs();
    const alice = makeStore();
    bindStoreToDoc({ store: alice, doc: docA, me: 'alice', now: () => 0 });
    alice.setState({ nodes: [node('a1')], cpm: '90' });
    const carol = makeStore({ nodes: [node('template')] });
    bindStoreToDoc({ store: carol, doc: docB, me: 'carol', now: () => 0 });
    expect(carol.getState().nodes.map((n) => n.id)).toEqual(['a1']);
    expect(carol.getState().cpm).toBe('90');
  });
});

describe('tempo and transport', () => {
  it('shares tempo', () => {
    const { alice, bob } = setup();
    alice.setState({ cpm: '96', bpc: '3' });
    expect(bob.getState().cpm).toBe('96');
    expect(bob.getState().bpc).toBe('3');
  });

  it('play/pause is shared: either player starts and stops both', () => {
    const { alice, bob, a } = setup();
    bob.getState().toggle();
    expect(alice.getState().isPlaying).toBe(true);
    expect(a.getTransport()).toMatchObject({ playing: true, anchorCycle: 0, cps: 0.5 });
    alice.getState().toggle();
    expect(bob.getState().isPlaying).toBe(false);
  });

  it('rejoins instead of stopping everyone when playback only stopped locally', () => {
    const { alice, bob } = setup();
    alice.getState().toggle();
    bob.setState({ isPlaying: false, error: 'boom' }); // local error stopped Bob
    bob.getState().toggle();
    expect(bob.getState().isPlaying).toBe(true);
    expect(alice.getState().isPlaying).toBe(true);
  });

  it('a tempo change continues from the current cycle', () => {
    const { alice, b, advance, now } = setup();
    alice.getState().toggle();
    advance(4000); // 4 s at 0.5 cps = cycle 2
    const before = cycleAt(b.getTransport(), now());
    expect(before).toBeCloseTo(2);
    alice.setState({ cpm: '240' }); // 1 cps
    const transport = b.getTransport();
    expect(transport.cps).toBe(1);
    expect(cycleAt(transport, now())).toBeCloseTo(2);
    advance(1000);
    expect(cycleAt(b.getTransport(), now())).toBeCloseTo(3);
  });
});

describe('ownership helpers', () => {
  it("undo snapshots only restore your own nodes and keep the partner's live graph", () => {
    const mine = node('b1', { data: { owner: 'bob' } });
    const theirsOld = node('a1', { data: { owner: 'alice', title: 'old' } });
    const theirsNew = node('a1', { data: { owner: 'alice', title: 'new' } });
    const added = node('a2', { data: { owner: 'alice', title: 'a2' } });
    const merged = mergeOwnGraph(
      { nodes: [theirsOld], edges: [] }, // snapshot from before Bob added b1
      { nodes: [theirsNew, added, mine], edges: [] },
      'bob',
    );
    expect(merged.nodes.map((n) => [n.id, n.data.title])).toEqual([
      ['a1', 'new'],
      ['a2', 'a2'],
    ]);
  });

  it('adopting a template gives fresh ids and sets the owner', () => {
    const nodes = [node('padNode_1'), node('synth_1')];
    const edges = [edge('padNode_1', 'synth_1')];
    const one = adoptGraph(nodes, edges, 'alice');
    const two = adoptGraph(nodes, edges, 'bob');
    expect(one.nodes[0].id).not.toBe('padNode_1');
    expect(one.nodes[0].id).not.toBe(two.nodes[0].id);
    expect(one.nodes.every((n) => n.data.owner === 'alice')).toBe(true);
    expect(one.edges[0].source).toBe(one.nodes[0].id);
    expect(one.edges[0].target).toBe(one.nodes[1].id);
  });
});
