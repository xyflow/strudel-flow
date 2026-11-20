import { scopeIdForGroup } from '@/components/nodes/effects/scope/scope';
import { Edge } from '@xyflow/react';
import { nodeDefinitions, type AppNode } from '@/components/nodes/registry';
import { findConnectedComponents } from './graph-utils';

function optimizeSoundCalls(strudelString: string): string {
  let optimized = strudelString;
  let previousLength = 0;
  while (optimized.length !== previousLength) {
    previousLength = optimized.length;
    optimized = optimized.replace(
      /\.sound\("([^"]+)"\)\.sound\("([^"]+)"\)/g,
      '.sound("$1 $2")',
    );
  }

  return optimized;
}
function isSoundSource(node: AppNode): boolean {
  const category = nodeDefinitions[node.type]?.category;
  return category === 'Instruments';
}

/** One `$:` line of the output, and the connected nodes it came from. */
export type CompiledLine = {
  nodeIds: string[];
  /** The line, commented out when every source in it is paused. */
  code: string;
  paused: boolean;
};

export function generateOutput(
  nodes: AppNode[],
  edges: Edge[],
  cpm: string,
  bpc: string,
): string {
  const lines = compileLines(nodes, edges);
  if (lines.length === 0) return '';
  return `${tempoLine(cpm, bpc)}\n${lines.map((line) => line.code).join('\n')}`;
}

export function tempoLine(cpm: string, bpc: string) {
  const bpm = parseInt(cpm) || 120;
  const beatsPerCycle = parseInt(bpc) || 4;
  return `setcpm(${bpm}/${beatsPerCycle})`;
}

export function compileLines(nodes: AppNode[], edges: Edge[]): CompiledLine[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const nodePatterns: Record<string, string> = {};
  for (const node of nodes) {
    if (!isSoundSource(node)) continue;
    const strudelOutput = nodeDefinitions[node.type]?.generatePattern;
    if (!strudelOutput) continue;

    try {
      const pattern = strudelOutput(node.data, '');
      if (pattern?.trim()) {
        nodePatterns[node.id] = pattern;
      }
    } catch (err) {
      console.warn(`Error generating pattern for node ${node.type}:`, err);
    }
  }

  const components = findConnectedComponents(nodes, edges);
  const lines: CompiledLine[] = [];

  for (const componentNodeIds of components) {
    const componentNodes = componentNodeIds
      .map((id) => nodesById.get(id))
      .filter((node): node is AppNode => node !== undefined);

    const sources = componentNodes.filter(isSoundSource);
    const effects = componentNodes.filter((node) => !isSoundSource(node));

    if (sources.length === 0) continue;

    const allSourcesPaused = sources.every(
      (node) => node.data.state === 'paused',
    );
    const activePatterns = (
      allSourcesPaused
        ? sources
        : sources.filter((node) => node.data.state !== 'paused')
    )
      .map((node) => nodePatterns[node.id])
      .filter(Boolean);

    if (activePatterns.length === 0) continue;

    let pattern =
      activePatterns.length === 1
        ? activePatterns[0]
        : `stack(${activePatterns.join(', ')})`;

    for (const effect of effects) {
      const strudelOutput = nodeDefinitions[effect.type]?.generatePattern;
      if (strudelOutput && pattern) {
        pattern = strudelOutput(
          effect.data,
          pattern,
          scopeIdForGroup(componentNodeIds[0]),
        );
      }
    }

    if (pattern) {
      const line = `$: ${optimizeSoundCalls(pattern)}`;
      lines.push({
        nodeIds: componentNodeIds,
        code: allSourcesPaused
          ? line
              .split('\n')
              .map((part) => `// ${part}`)
              .join('\n')
          : line,
        paused: allSourcesPaused,
      });
    }
  }
  return lines;
}
