import { createImportedPad } from '@/components/nodes/instruments/pad/imported-notes';
import { signals } from './strudel-calls';
import { nanoid } from 'nanoid';
import type { Edge } from '@xyflow/react';
import type { AppNode } from '@/components/nodes/types';
import { parsePatternProgram, type PatternPart } from './parse-pattern-program';

export function codeToNodes(
  node: AppNode,
  code: string,
  nodes: AppNode[],
  edges: Edge[],
  beatsPerCycle = 4,
) {
  if (edges.some((edge) => edge.target === node.id))
    throw new Error('Disconnect the Code node’s input before converting.');
  const { pattern, setup, samples, cps } = parsePatternProgram(code);
  const created: AppNode[] = [];
  const connections: Edge[] = [];
  const others = nodes.filter((item) => item.id !== node.id);
  const y = others.length
    ? Math.max(
        node.position.y,
        ...others.map(
          (item) => item.position.y + (item.measured?.height ?? 200) + 64,
        ),
      )
    : node.position.y;
  const state = node.data.state ?? 'running';
  const position = (depth: number, lane: number) => ({
    x: node.position.x + depth * 420,
    y: y + lane * 400,
  });
  function connect(source: string, target: string, targetHandle?: string) {
    connections.push({
      id: nanoid(),
      source,
      target,
      type: 'default',
      ...(targetHandle ? { targetHandle } : {}),
    });
  }
  let row = 0;
  function add(
    part: PatternPart,
    argumentBranch = false,
  ): { id: string; depth: number; row: number }[] {
    const inputs = part.inputs.flatMap((input) => add(input, argumentBranch));
    const argumentOutputs = Object.entries(part.arguments ?? {}).flatMap(
      ([argument, value]) =>
        add(value, true).map((output) => ({
          ...output,
          argument: Number(argument),
        })),
    );
    const dependencies = [...inputs, ...argumentOutputs];
    if (part.call?.name === 'stack' && inputs.length) return inputs;
    const depth = dependencies.length
      ? Math.max(...dependencies.map((input) => input.depth)) + 1
      : 0;
    const lane = inputs.length
      ? inputs.reduce((sum, input) => sum + input.row, 0) / inputs.length
      : row++;
    const id = created.length ? nanoid() : node.id;
    let type =
      part.expression !== undefined
        ? 'expression-node'
        : inputs.length
          ? 'effect-call-node'
          : 'pattern-call-node';
    const call = part.call;
    const signal =
      part.expression && signals.includes(part.expression)
        ? part.expression
        : undefined;
    const sound =
      call &&
      ['s', 'sound'].includes(call.name) &&
      typeof call.args[0] === 'string'
        ? call.args[0]
        : undefined;
    const notes =
      call?.name === 'note' && typeof call.args[0] === 'string'
        ? call.args[0]
        : undefined;
    if (signal || sound !== undefined) type = 'synth-select-node';
    if (notes !== undefined) type = 'pad-node';
    created.push({
      id,
      type,
      position: position(depth, lane),
      data: {
        title:
          signal || sound !== undefined
            ? 'Sound'
            : notes !== undefined
              ? 'Pad'
              : (part.call?.name ?? part.expression),
        ...(signal ? { signal } : {}),
        ...(sound !== undefined ? { sound, soundCall: call?.name } : {}),
        ...(notes !== undefined ? createImportedPad(notes) : {}),
        argumentSlots: argumentOutputs.map((item) => item.argument),
        state,
        argumentBranch,
        ...(part.call
          ? { calls: [part.call] }
          : { expression: part.expression }),
      },
    });
    for (const input of inputs) connect(input.id, id);
    for (const argument of argumentOutputs)
      connect(argument.id, id, `argument:${argument.argument}`);
    return [{ id, depth, row: lane }];
  }
  let outputs = add(pattern);
  for (const sample of samples) {
    const id = nanoid();
    const depth = Math.max(...outputs.map((output) => output.depth)) + 1;
    const lane =
      outputs.reduce((sum, output) => sum + output.row, 0) / outputs.length;
    created.push({
      id,
      type: 'samples-node',
      position: position(depth, lane),
      data: {
        title: 'Samples',
        ...sample,
        state,
      },
    });
    for (const output of outputs) connect(output.id, id);
    outputs = [{ id, depth, row: lane }];
  }
  if (setup) {
    const outputIds = new Set(outputs.map((output) => output.id));
    for (const item of created)
      if (outputIds.has(item.id)) item.data.setup = setup;
  }
  return {
    ...(cps === undefined
      ? {}
      : { cpm: String(Number((cps * 60 * beatsPerCycle).toFixed(8))) }),
    nodes: nodes.flatMap((item) => (item.id === node.id ? created : [item])),
    edges: [
      ...connections,
      ...edges.flatMap((edge) =>
        edge.source === node.id
          ? outputs.map((output, index) => ({
              ...edge,
              id: index ? nanoid() : edge.id,
              source: output.id,
              sourceHandle: null,
            }))
          : edge,
      ),
    ],
  };
}
