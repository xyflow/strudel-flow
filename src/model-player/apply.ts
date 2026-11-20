// Turn a model player's code into edits on its own nodes, the way a person
// would make them: lines that didn't change keep their nodes untouched, a
// changed line edits its nodes in place, and the app's compiler checks that
// the result plays exactly the code reported back.
import type { Edge } from '@xyflow/react';
import { createNodeByType } from '@/components/nodes/registry';
import type { AppNode } from '@/components/nodes/types';
import { ownedBy } from '@/collab/ownership';
import { compileLines, type CompiledLine } from '@/lib/strudel';
import { decodeLine, type LinePlan, type NodePlan } from './decode';
import { CodeError, fail, splitStatements } from './syntax';

export type Graph = { nodes: AppNode[]; edges: Edge[] };

/** The part of the graph that `owner` matches, with edges inside it. */
function subgraph(graph: Graph, keep: (node: AppNode) => boolean): Graph {
  const nodes = graph.nodes.filter(keep);
  const ids = new Set(nodes.map((node) => node.id));
  return {
    nodes,
    edges: graph.edges.filter(
      (edge) => ids.has(edge.source) && ids.has(edge.target),
    ),
  };
}

export function ownLines(graph: Graph, me: string): CompiledLine[] {
  const own = subgraph(graph, (node) => ownedBy(node, me));
  return compileLines(own.nodes, own.edges);
}

/** Other players' code, by owner id. Scope calls (visual only) are left out. */
export function othersCode(graph: Graph, me: string): Map<string, string> {
  const owners = new Map<string, string>();
  const others = subgraph(graph, (node) => !ownedBy(node, me));
  const ownerOf = new Map(
    others.nodes.map((node) => [node.id, String(node.data.owner)]),
  );
  for (const line of compileLines(others.nodes, others.edges)) {
    const owner = ownerOf.get(line.nodeIds[0]) ?? '';
    const code = line.code.replace(/\.analyze\("[^"]*"\)/g, '');
    owners.set(owner, owners.has(owner) ? `${owners.get(owner)}\n${code}` : code);
  }
  return owners;
}

export const partCode = (lines: CompiledLine[]) =>
  lines.map((line) => line.code).join('\n');

/** Equal up to whitespace. */
const canon = (code: string) =>
  code
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),.[\]<>])\s*/g, '$1')
    .trim();

const plansOf = (plan: LinePlan): NodePlan[] => [
  ...plan.sources,
  ...plan.effects,
];

/** A person wires a line left to right: each node into the next. */
const chainEdges = (ids: string[]): Edge[] =>
  ids.slice(1).map((target, k) => ({
    id: `${ids[k]}-${target}`,
    source: ids[k],
    target,
    type: 'default',
  }));

function freshNode(plan: NodePlan, me: string, paused: boolean): AppNode {
  const node = createNodeByType({ type: plan.type });
  return {
    ...node,
    data: {
      ...node.data,
      ...plan.data,
      owner: me,
      state: paused ? 'paused' : 'running',
    },
  };
}

/** The code a line plan plays, on its own. */
function planCode(plan: LinePlan, paused: boolean): string {
  const nodes = plansOf(plan).map((p) => freshNode(p, 'x', paused));
  const lines = compileLines(nodes, chainEdges(nodes.map((n) => n.id)));
  if (lines.length !== 1)
    fail('That line makes no sound: it needs an instrument with notes or hits.');
  return lines[0].code;
}

export type ApplyResult = {
  graph: Graph;
  /** The part as it now plays. */
  code: string;
  /** Things that came out differently from what was written. */
  notes: string[];
  changed: boolean;
};

export function applyPart(
  graph: Graph,
  me: string,
  code: string,
  tempo: string,
): ApplyResult {
  const statements = splitStatements(code);
  for (const statement of statements) {
    if (statement.kind === 'tempo' && canon(statement.text) !== canon(tempo))
      fail(
        `The tempo is shared and only the room's controls change it. Leave \`setcpm\` out, or keep \`${tempo}\`.`,
      );
  }
  const parts = statements.filter(
    (s): s is Extract<typeof s, { kind: 'part' }> => s.kind === 'part',
  );

  const current = ownLines(graph, me);
  const unmatched = new Set(current);
  const notes: string[] = [];
  const errors: string[] = [];
  type Changed = { plan: LinePlan; paused: boolean; expected: string };
  const changed: Changed[] = [];
  const expected: string[] = [];

  for (const part of parts) {
    const same = [...unmatched].find((line) => canon(line.code) === canon(part.text));
    if (same) {
      unmatched.delete(same);
      expected.push(same.code);
      continue;
    }
    try {
      const decoded = decodeLine(part.code);
      const lineCode = planCode(decoded.plan, part.paused);
      notes.push(...decoded.notes);
      changed.push({ plan: decoded.plan, paused: part.paused, expected: lineCode });
      expected.push(lineCode);
    } catch (error) {
      if (!(error instanceof CodeError)) throw error;
      errors.push(`Line ${part.line}: ${error.message}`);
    }
  }
  if (errors.length) fail(errors.join('\n'));

  const spare = [...unmatched];
  const build = (reuse: boolean): Graph => {
    const removed = new Set(spare.flatMap((line) => line.nodeIds));
    const byId = new Map(graph.nodes.map((node) => [node.id, node]));
    const updated = new Map<string, AppNode>();
    const added: AppNode[] = [];
    const edges: Edge[] = [];
    let nextRow = layoutStart(graph, me, removed);

    changed.forEach((line, index) => {
      const old = reuse ? spare[index] : undefined;
      const pool = (old?.nodeIds ?? []).map((id) => byId.get(id)!);
      const oldPosition = pool[0]?.position;
      const placed: AppNode[] = [];
      const plans = plansOf(line.plan);
      plans.forEach((plan, k) => {
        const reused = pool.find(
          (node) => node.type === plan.type && !updated.has(node.id),
        );
        if (reused) {
          removed.delete(reused.id);
          const node: AppNode = {
            ...reused,
            data: {
              ...reused.data,
              ...plan.data,
              state: line.paused ? 'paused' : 'running',
            },
          };
          updated.set(node.id, node);
          placed.push(node);
        } else {
          const node = freshNode(plan, me, line.paused);
          const origin = oldPosition ?? nextRow;
          const effects = k - line.plan.sources.length;
          node.position =
            effects < 0
              ? { x: origin.x, y: origin.y + k * 380 }
              : { x: origin.x + 560, y: origin.y + effects * 230 };
          added.push(node);
          placed.push(node);
        }
      });
      if (!oldPosition)
        nextRow = {
          x: nextRow.x,
          y:
            nextRow.y +
            Math.max(line.plan.sources.length * 380, line.plan.effects.length * 230) +
            120,
        };
      edges.push(...chainEdges(placed.map((node) => node.id)));
    });

    const touched = new Set([
      ...removed,
      ...updated.keys(),
      ...spare.flatMap((line) => line.nodeIds),
    ]);
    return {
      nodes: [
        ...graph.nodes
          .filter((node) => !removed.has(node.id))
          .map((node) => updated.get(node.id) ?? node),
        ...added,
      ],
      edges: [
        ...graph.edges.filter(
          (edge) => !touched.has(edge.source) && !touched.has(edge.target),
        ),
        ...edges,
      ],
    };
  };

  const matches = (next: Graph) => {
    const got = ownLines(next, me).map((line) => canon(line.code)).sort();
    const want = expected.map(canon).sort();
    return got.length === want.length && got.every((code, k) => code === want[k]);
  };
  // Reusing nodes can change the order the compiler walks them in. If the
  // result isn't exactly what was asked, rebuild the changed lines fresh.
  let next = build(true);
  if (!matches(next)) next = build(false);
  if (!matches(next))
    throw new Error('Internal error: the nodes built do not play the code asked for.');

  const before = partCode(current);
  const after = partCode(ownLines(next, me));
  return {
    graph: next,
    code: after,
    notes: [...new Set(notes)],
    changed: canon(before) !== canon(after) || changed.length > 0 || spare.length > 0,
  };
}

/** Where a new line's nodes go: below the player's existing nodes. */
function layoutStart(graph: Graph, me: string, removed: Set<string>) {
  const mine = graph.nodes.filter(
    (node) => ownedBy(node, me) && !removed.has(node.id),
  );
  if (mine.length === 0) return { x: 0, y: 0 };
  return {
    x: Math.min(...mine.map((node) => node.position.x)),
    y: Math.max(...mine.map((node) => node.position.y)) + 420,
  };
}

/** Replace exactly one occurrence of `find` in the player's part. */
export function editPart(code: string, find: string, replace: string): string {
  if (!find) fail('`find` is empty.');
  const count = code.split(find).length - 1;
  if (count === 0)
    fail('`find` isn\'t in your current code. Call look to see it exactly as it is now.');
  if (count > 1)
    fail(`\`find\` appears ${count} times in your code. Include more of the line so it matches once.`);
  return code.replace(find, () => replace);
}
