import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { createStore } from 'zustand/vanilla';
import type { Edge } from '@xyflow/react';
import { createNodeByType, nodeDefinitions } from '@/components/nodes/registry';
import type { AppNode } from '@/components/nodes/types';
import { bindStoreToDoc, type BoundState } from '@/collab/binding';
import { generateOutput } from '@/lib/strudel';
import { DRUM_SOUNDS } from '@/components/nodes/sounds/drum-sounds/drum-sounds';
import { VOICE_SOUNDS } from '@/components/nodes/sounds/synth-select/synth-select';
import { KEY_OPTIONS, OCTAVES, SCALE_TYPE_OPTIONS } from '@/data/sounds';
import {
  DEFAULT_MODIFIER_GROUPS,
  modifierValues,
} from '@/components/nodes/shared/modifier-options';
import { STEP_MODIFIERS } from '@/components/nodes/instruments/beat-machine/beat-machine';
import {
  applyPart,
  editPart,
  othersCode,
  ownLines,
  partCode,
  type Graph,
} from './apply';
import { effectSpecs } from './registry';
import { CodeError } from './syntax';

const TEMPO = 'setcpm(120/4)';
const empty: Graph = { nodes: [], edges: [] };

// Small seeded random, so failures repeat.
function random(seed: number) {
  let state = seed;
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const int = (min: number, max: number) =>
    min + Math.floor(next() * (max - min + 1));
  const pick = <T>(items: readonly T[]) => items[int(0, items.length - 1)];
  return { next, int, pick, chance: (p: number) => next() < p };
}
type Random = ReturnType<typeof random>;

/** A node as a person would make it: created, then changed by its controls. */
function personNode(type: string, owner: string, data: Record<string, unknown> = {}) {
  const node = createNodeByType({ type });
  return { ...node, data: { ...node.data, ...data, owner } } as AppNode;
}

const chain = (nodes: AppNode[]): Edge[] =>
  nodes.slice(1).map((node, k) => ({
    id: `${nodes[k].id}-${node.id}`,
    source: nodes[k].id,
    target: node.id,
    type: 'default',
  }));

function randomBeats(r: Random) {
  const steps = r.int(1, 32);
  const modifiersEnabled = r.chance(0.4);
  const rows = Array.from({ length: r.int(1, 3) }, () => {
    const pattern = Array.from({ length: steps }, () => r.chance(0.4));
    pattern[r.int(0, steps - 1)] = true;
    const modifiers: Record<number, unknown> = {};
    if (modifiersEnabled && r.chance(0.7))
      modifiers[r.int(0, steps - 1)] = {
        type: 'modifier',
        value: r.pick(modifierValues(STEP_MODIFIERS)),
      };
    return { instrument: r.pick(DRUM_SOUNDS), pattern, modifiers };
  });
  return { steps, rows, modifiersEnabled };
}

function randomChords(r: Random) {
  const length = r.int(4, 16);
  return {
    chordNotes: Array.from({ length }, () =>
      r.chance(0.15)
        ? []
        : [...new Set(Array.from({ length: r.int(1, 4) }, () => r.int(0, 13)))].sort(
            (a, b) => a - b,
          ),
    ),
    selectedKey: r.pick(KEY_OPTIONS).value,
    octave: r.int(OCTAVES.min, OCTAVES.max),
    scaleType: r.pick(['major', 'minor']),
  };
}

function randomPad(r: Random) {
  const steps = r.int(1, 16);
  const grid = Array.from({ length: 16 }, () =>
    Array.from({ length: 8 }, () => r.chance(0.2)),
  );
  grid[r.int(0, steps - 1)][r.int(0, 7)] = true;
  const columnModifiers: Record<number, unknown> = {};
  if (r.chance(0.5)) {
    const step = grid.findIndex((row) => row.some(Boolean));
    columnModifiers[step] = {
      type: 'modifier',
      value: r.pick(modifierValues(DEFAULT_MODIFIER_GROUPS)),
    };
  }
  return {
    steps,
    mode: r.pick(['arp', 'chord']),
    grid,
    columnModifiers,
    selectedKey: r.pick(KEY_OPTIONS).value,
    selectedScaleType: r.pick(SCALE_TYPE_OPTIONS).value,
    octave: r.chance(0.2) ? undefined : r.int(OCTAVES.min, OCTAVES.max),
  };
}

function randomEffect(r: Random, owner: string): AppNode {
  if (r.chance(0.25))
    return r.chance(0.5)
      ? personNode('drum-sounds-node', owner, { sound: r.pick(DRUM_SOUNDS) })
      : personNode('synth-select-node', owner, { sound: r.pick(VOICE_SOUNDS) });
  const spec = r.pick(effectSpecs);
  const definition = nodeDefinitions[spec.node];
  const node = personNode(spec.node, owner);
  const values = Object.fromEntries(
    Object.entries(definition.parameters).map(([key, parameter]) => {
      if (parameter.control === 'select')
        return [key, r.pick(parameter.options).value];
      if (parameter.control !== 'knob') throw new Error('unexpected control');
      const steps = Math.round((parameter.max - parameter.min) / parameter.step);
      const value = r.chance(0.3)
        ? parameter.default
        : parameter.min + r.int(0, steps) * parameter.step;
      return [key, Number(value.toFixed(4))];
    }),
  );
  return {
    ...node,
    data: { ...node.data, ...definition.updateValues(node.data, values) },
  };
}

/** A random line a person could build with the visual nodes. */
function randomLine(r: Random, owner: string): AppNode[] {
  const sources = Array.from({ length: r.chance(0.7) ? 1 : r.int(2, 3) }, () => {
    const kind = r.pick(['beats', 'chords', 'pad']);
    return kind === 'beats'
      ? personNode('beat-machine-node', owner, randomBeats(r))
      : kind === 'chords'
        ? personNode('chord-node', owner, randomChords(r))
        : personNode('pad-node', owner, randomPad(r));
  });
  const effects = Array.from({ length: r.int(0, 4) }, () => randomEffect(r, owner));
  return [...sources, ...effects];
}

describe('writing what a person builds, as code', () => {
  it('reproduces any line a person can build, exactly', () => {
    for (let seed = 1; seed <= 400; seed++) {
      const r = random(seed);
      const nodes = randomLine(r, 'person');
      const built = ownLines({ nodes, edges: chain(nodes) }, 'person');
      expect(built).toHaveLength(1);
      const code = built[0].code;
      let result;
      try {
        result = applyPart(empty, 'model', code, TEMPO);
      } catch (error) {
        throw new Error(`seed ${seed}: ${code}\n${String(error)}`);
      }
      expect(result.code, `seed ${seed}`).toBe(code);
    }
  });
});

describe('applyPart', () => {
  const part = [
    '$: sound("bd").struct("1 ~ 1 ~").gain(0.8)',
    '$: n("[0] [2] [4]").scale("C3:major").sound("sawtooth").lpf(800).lpq(2)',
  ].join('\n');

  it('builds nodes owned by the model, wired as a chain', () => {
    const { graph, code } = applyPart(empty, 'model', part, TEMPO);
    expect(code).toBe(part);
    expect(graph.nodes.map((n) => n.type)).toEqual([
      'beat-machine-node',
      'level-node',
      'pad-node',
      'synth-select-node',
      'lpf-node',
    ]);
    expect(graph.nodes.every((n) => n.data.owner === 'model')).toBe(true);
    expect(graph.edges.map((e) => [e.source, e.target])).toEqual([
      [graph.nodes[0].id, graph.nodes[1].id],
      [graph.nodes[2].id, graph.nodes[3].id],
      [graph.nodes[3].id, graph.nodes[4].id],
    ]);
  });

  it('leaves unchanged lines alone and edits changed ones in place', () => {
    const first = applyPart(empty, 'model', part, TEMPO).graph;
    const ids = first.nodes.map((n) => n.id);
    const next = applyPart(
      first,
      'model',
      part.replace('lpf(800)', 'lpf(1500)'),
      TEMPO,
    );
    expect(next.graph.nodes.map((n) => n.id)).toEqual(ids);
    expect(next.graph.nodes[0]).toBe(first.nodes[0]); // untouched line
    expect(next.graph.nodes[4].data.lpf).toBe('1500 2');
    expect(next.code).toContain('lpf(1500)');
  });

  it('pauses and resumes a line with a comment', () => {
    const first = applyPart(empty, 'model', part, TEMPO).graph;
    const paused = applyPart(
      first,
      'model',
      part.replace('$: n(', '// $: n('),
      TEMPO,
    );
    expect(paused.graph.nodes.slice(2).map((n) => n.data.state)).toEqual([
      'paused',
      'paused',
      'paused',
    ]);
    expect(paused.code).toContain('// $: n(');
    const resumed = applyPart(paused.graph, 'model', part, TEMPO);
    expect(resumed.code).toBe(part);
    expect(resumed.graph.nodes.map((n) => n.id)).toEqual(
      first.nodes.map((n) => n.id),
    );
  });

  it('removes lines that are left out', () => {
    const first = applyPart(empty, 'model', part, TEMPO).graph;
    const next = applyPart(first, 'model', part.split('\n')[1], TEMPO);
    expect(next.graph.nodes.map((n) => n.type)).toEqual([
      'pad-node',
      'synth-select-node',
      'lpf-node',
    ]);
    expect(applyPart(next.graph, 'model', '', TEMPO).graph.nodes).toEqual([]);
  });

  it("never touches another player's nodes", () => {
    const theirs = [
      personNode('chord-node', 'alice', randomChords(random(7))),
      personNode('room-node', 'alice'),
    ];
    const start: Graph = { nodes: theirs, edges: chain(theirs) };
    const { graph } = applyPart(start, 'model', part, TEMPO);
    expect(graph.nodes.slice(0, 2)).toEqual(theirs);
    expect(graph.edges.slice(0, 1)).toEqual(start.edges);
    expect(partCode(ownLines(graph, 'model'))).toBe(part);
    expect([...othersCode(graph, 'model').keys()]).toEqual(['alice']);
    // Rewriting the whole part still leaves Alice's nodes alone.
    const cleared = applyPart(graph, 'model', '', TEMPO).graph;
    expect(cleared.nodes).toEqual(theirs);
  });

  it('notes values snapped to a control and defaults left out', () => {
    const result = applyPart(
      empty,
      'model',
      '$: n("[0]").scale("C3:major").lpf(1037).lpq(1).gain(1)',
      TEMPO,
    );
    expect(result.code).toBe('$: n("[0]").scale("C3:major").lpf(1050).lpq(1)');
    expect(result.notes.join(' ')).toMatch(/1050/);
    expect(result.notes.join(' ')).toMatch(/default/);
  });

  it('keeps the order effects are written in', () => {
    const code = '$: n("[0] [1]").scale("C3:major").rev().fast(2)';
    expect(applyPart(empty, 'model', code, TEMPO).code).toBe(code);
  });

  const rejects = (code: string, message: RegExp) => {
    expect(() => applyPart(empty, 'model', code, TEMPO)).toThrow(CodeError);
    expect(() => applyPart(empty, 'model', code, TEMPO)).toThrow(message);
  };

  it('rejects what no node can do', () => {
    rejects('$: n("[0]").scale("C3:major").delay(0.5)', /delay.*isn't something a node can do/);
    rejects('$: note("c e g")', /isn't an instrument/);
    rejects('$: n("[0]").scale("C3:major").lpf(9000)', /out of range/);
    rejects('$: sound("bd*2").struct("1 ~")', /Beats track sound/);
    rejects('$: sound("bd").struct("1 ~").sound("piano2")', /isn't a sound/);
    rejects(
      '$: stack(n("[0]").scale("C3:major").lpf(500), sound("bd").struct("1"))',
      /inside `stack/,
    );
    rejects('$: n("[4 2]").scale("C3:major")', /low to high/);
    rejects('$: n("<[0,2,4] [3,5,7]>").scale("C4:major")', /4 to 16 chords/);
    rejects('$: n("<[0,2,4] [3,5,7] ~ ~>").scale("C4:dorian")', /major, minor/);
    rejects(`$: sound("bd").struct("${'1 '.repeat(33)}")`, /1 to 32 steps/);
    rejects('$: n("[0]").scale("C3:major")\nhush()', /Unexpected `hush`/);
    rejects('const x = 1', /isn't part of a `\$:` line/);
    rejects('$: n("[~] [~]").scale("C3:major")', /at least one note/);
  });

  it('rejects tempo changes but accepts the current tempo', () => {
    rejects(`setcpm(140/4)\n${part}`, /tempo is shared/);
    expect(applyPart(empty, 'model', `${TEMPO}\n${part}`, TEMPO).code).toBe(part);
  });

  it('reports every bad line at once', () => {
    expect(() =>
      applyPart(empty, 'model', '$: note("c")\n$: n("[0]").scale("C3:major").delay(1)', TEMPO),
    ).toThrow(/Line 1:[\s\S]*Line 2:/);
  });
});

describe('editPart', () => {
  it('replaces exactly one match', () => {
    expect(editPart('$: a.lpf(800)', 'lpf(800)', 'lpf(900)')).toBe('$: a.lpf(900)');
    expect(() => editPart('$: a', 'b', 'c')).toThrow(/isn't in your current code/);
    expect(() => editPart('$: a a', 'a', 'c')).toThrow(/appears 2 times/);
  });
});

describe('a model and a person in one room', () => {
  function makeStore() {
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
    }));
  }

  it("puts the model's part in the person's full mix", async () => {
    const a = new Y.Doc();
    const b = new Y.Doc();
    a.on('update', (u: Uint8Array, o: unknown) => o !== 'net' && Y.applyUpdate(b, u, 'net'));
    b.on('update', (u: Uint8Array, o: unknown) => o !== 'net' && Y.applyUpdate(a, u, 'net'));
    const model = makeStore();
    const person = makeStore();
    bindStoreToDoc({ store: model, doc: a, me: 'model', now: () => 0 });
    bindStoreToDoc({ store: person, doc: b, me: 'alice', now: () => 0 });

    const theirs = [personNode('chord-node', 'alice', randomChords(random(3)))];
    person.setState({ nodes: theirs, edges: [] });
    const result = applyPart(model.getState(), 'model', '$: sound("bd").struct("1 ~ 1 ~")', TEMPO);
    model.setState(result.graph);
    await new Promise((resolve) => queueMicrotask(() => resolve(null)));

    const { nodes, edges, cpm, bpc } = person.getState();
    const mix = generateOutput(nodes, edges, cpm, bpc);
    expect(mix).toContain('$: sound("bd").struct("1 ~ 1 ~")');
    expect(mix).toContain(ownLines({ nodes: theirs, edges: [] }, 'alice')[0].code);
    // The person's own part is unchanged on both sides.
    expect(model.getState().nodes.find((n) => n.id === theirs[0].id)?.data).toEqual(
      theirs[0].data,
    );
  });
});
