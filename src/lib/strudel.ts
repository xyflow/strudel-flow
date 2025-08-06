/**
 * Simplified Strudel pattern generation
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
import nodesConfig from '@/components/nodes';
import { useStrudelStore } from '@/store/strudel-store';
import { getNodeStrudelOutput } from './node-registry';
import { findConnectedComponents } from './graph-utils';

/**
 * Optimize consecutive .sound() calls by combining them recursively
 */
function optimizeSoundCalls(strudelString: string): string {
  let optimized = strudelString;
  let previousLength = 0;

  // Keep applying optimization until no more changes are made
  while (optimized.length !== previousLength) {
    previousLength = optimized.length;
    // Replace consecutive .sound() calls with combined ones
    // This regex matches: .sound("something").sound("something else")
    optimized = optimized.replace(
      /\.sound\("([^"]+)"\)\.sound\("([^"]+)"\)/g,
      '.sound("$1 $2")'
    );
  }

  return optimized;
}
/**
 * Check if a node generates patterns (vs processes/modifies them)
 */
function isSoundSource(node: AppNode): boolean {
  const category = nodesConfig[node.type]?.category;
  // Only Instruments generate patterns, Sounds are effects that modify patterns
  return category === 'Instruments';
}

/**
 * Generate complete Strudel output from nodes and edges
 */
export function generateOutput(nodes: AppNode[], edges: Edge[]): string {
  const cpm = useStrudelStore.getState().cpm;

  // Generate patterns for all nodes
  const nodePatterns: Record<string, string> = {};
  nodes.forEach((node) => {
    const strudelOutput = getNodeStrudelOutput(node.type);
    if (strudelOutput) {
      try {
        const pattern = strudelOutput(node, '');
        if (pattern && typeof pattern === 'string' && pattern.trim()) {
          nodePatterns[node.id] = pattern;
        }
      } catch (err) {
        console.warn(`Error generating pattern for node ${node.type}:`, err);
      }
    }
  });

  // Find connected components and build patterns
  const components = findConnectedComponents(nodes, edges);
  const finalPatterns: { pattern: string; paused: boolean }[] = [];

  components.forEach((componentNodeIds) => {
    // Get nodes in this component
    const componentNodes = componentNodeIds
      .map((id) => nodes.find((n) => n.id === id))
      .filter(Boolean) as AppNode[];

    // Separate sources from effects
    const sources = componentNodes.filter(isSoundSource);
    const effects = componentNodes.filter((node) => !isSoundSource(node));

    const allSourcesPaused =
      sources.length > 0 &&
      sources.every((node) => node.data.state === 'paused');

    // Build base pattern from sources
    // If all sources are paused, we'll generate the full stack and comment it out
    // Otherwise, only stack active nodes
    const patternsToStack = allSourcesPaused
      ? sources
      : sources.filter((node) => node.data.state !== 'paused');

    const sourcePatterns = patternsToStack
      .map((node) => nodePatterns[node.id])
      .filter(Boolean);

    let basePattern = '';
    if (sourcePatterns.length === 1) {
      basePattern = sourcePatterns[0];
    } else if (sourcePatterns.length > 1) {
      basePattern = `stack(${sourcePatterns.join(', ')})`;
    }

    // Apply effects in sequence
    let finalPattern = basePattern;
    effects.forEach((effect) => {
      const strudelOutput = getNodeStrudelOutput(effect.type);
      if (strudelOutput && finalPattern) {
        finalPattern = strudelOutput(effect, finalPattern);
      }
    });

    if (finalPattern) {
      // Apply optimization to the final pattern
      finalPatterns.push({
        pattern: optimizeSoundCalls(finalPattern),
        paused: allSourcesPaused,
      });
    }
  });

  // Format result
  if (finalPatterns.length === 0) return '';

  const validPatterns = finalPatterns.filter(
    ({ pattern }) => pattern && typeof pattern === 'string' && pattern.trim()
  );

  if (validPatterns.length === 0) return '';

  const result = validPatterns
    .map(({ pattern, paused }) => {
      const line = `$: ${pattern}`;
      return paused ? `// ${line}` : line;
    })
    .join('\n');

  return cpm ? `setcpm(${cpm})\n${result}` : result;
}
