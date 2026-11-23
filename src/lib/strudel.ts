import { type StrudelCall, serializeLiteral } from './strudel-calls';
import { scopeIdForGroup } from '@/components/nodes/effects/scope/scope';
import { Edge } from '@xyflow/react';
import { nodeDefinitions, type AppNode } from '@/components/nodes/registry';
import { findConnectedComponents } from './graph-utils';
import { orderPatternNodes } from './order-pattern-nodes';

function isSoundSource(node: AppNode): boolean {
  if (node.data.argumentBranch) return false;
  if (node.type === 'synth-select-node') return !node.data.signal;
  const category = nodeDefinitions[node.type]?.category;
  return category === 'Instruments';
}

export function generateOutput(
  nodes: AppNode[],
  edges: Edge[],
  cpm: string,
  bpc: string,
  options: { clipboard?: boolean; fragment?: boolean; includeTempo?: boolean } = {},
): string {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const components = findConnectedComponents(nodes, edges);
  const finalPatterns: { pattern: string; paused: boolean; setup: string }[] = [];

  for (const componentNodeIds of components) {
    const componentNodes = componentNodeIds
      .map((id) => nodesById.get(id))
      .filter((node): node is AppNode => node !== undefined);
    const ordered = orderPatternNodes(componentNodes, edges);
    const ids = new Set(ordered.map((node) => node.id));
    const internal = edges.filter(
      (edge) => ids.has(edge.source) && ids.has(edge.target),
    );
    const outputs = new Map<string, string>();
    const allPaused = ordered
      .filter(isSoundSource)
      .every((node) => node.data.state === 'paused');
    for (const node of ordered) {
      const incoming = internal.filter((edge) => edge.target === node.id);
      const audioInputs = incoming.filter(
        (edge) => !edge.targetHandle?.startsWith('argument:'),
      );
      const bindings = incoming.filter(
        (edge) => edge.targetHandle?.startsWith('argument:'),
      );
      const inputs = audioInputs
        .map((edge) => outputs.get(edge.source))
        .filter((value): value is string => Boolean(value));
      const input =
        inputs.length > 1
          ? `stack(${inputs.join(', ')})`
          : (inputs[0] ?? (options.fragment && nodeDefinitions[node.type]?.category === 'Audio Effects' ? '__flow_input__' : ''));
      const source = isSoundSource(node);
      const silent = source
        ? !options.clipboard && !allPaused && node.data.state === 'paused'
        : audioInputs.length > 0 && !inputs.length;
      const data =
        bindings.length && Array.isArray(node.data.calls)
          ? {
              ...node.data,
              calls: (node.data.calls as StrudelCall[]).map((call) => ({
                ...call,
                args: call.args.map((arg, index) => {
                  const binding = bindings.find(
                    (edge) => edge.targetHandle === `argument:${index}`,
                  );
                  return binding
                    ? { expression: outputs.get(binding.source) || 'silence' }
                    : arg;
                }),
              })),
            }
          : node.data;
      outputs.set(
        node.id,
        silent
          ? ''
          : (nodeDefinitions[node.type]?.generatePattern(
              data,
              input,
              scopeIdForGroup(componentNodeIds[0]),
            ) ?? input),
      );
    }
    const sinks = ordered.filter(
      (node) => !internal.some((edge) => edge.source === node.id),
    );
    const patterns = sinks
      .map((node) => outputs.get(node.id))
      .filter(Boolean);
    if (patterns.length) {
      let pattern =
        patterns.length === 1
          ? patterns[0]!
          : `stack(${patterns.join(', ')})`;
      const setup = [
        ...ordered
          .filter((node) => node.type === 'samples-node')
          .map((node) =>
            `${options.clipboard ? '' : 'await '}samples(${serializeLiteral(node.data.source ?? node.data.sampleMap)});`,
          ),
        ...new Set(ordered.map((node) => String(node.data.setup ?? ''))),
      ].filter(Boolean).join('\n');
      if (setup.trim() && !options.clipboard)
        pattern = `(await (async () => {\n${setup}\nreturn ${pattern};\n})())`;
      finalPatterns.push({ pattern, paused: allPaused, setup });
    }
  }

  if (finalPatterns.length === 0) return '';

  if (options.clipboard) {
    if (options.fragment) {
      if (finalPatterns.length !== 1 || finalPatterns[0].setup ||
          !finalPatterns[0].pattern.startsWith('__flow_input__.'))
        throw new Error('Select one connected chain of effects to copy.');
      return finalPatterns[0].pattern.slice('__flow_input__'.length);
    }
    const setup = [...new Set(finalPatterns.map((item) => item.setup).filter(Boolean))];
    const patterns = finalPatterns.map((item) => item.pattern);
    const pattern = patterns.length === 1 ? patterns[0] : `stack(${patterns.join(', ')})`;
    if (options.includeTempo) setup.unshift(`setcps(${(Number(cpm) || 120) / (60 * (Number(bpc) || 4))})`);
    return [...setup, pattern].join('\n');
  }

  const result = finalPatterns
    .map(({ pattern, paused }) => {
      const line = `$: ${pattern}`;
      return paused
        ? line
            .split('\n')
            .map((part) => `// ${part}`)
            .join('\n')
        : line;
    })
    .join('\n');

  const bpm = Number(cpm) || 120;
  const beatsPerCycle = parseInt(bpc) || 4;
  return `setcpm(${bpm}/${beatsPerCycle})\n${result}`;
}
