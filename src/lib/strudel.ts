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
 * Check if a node generates patterns (vs processes/modifies them)
 */
function isSoundSource(node: AppNode): boolean {
  const category = nodesConfig[node.type]?.category;
  // Only Synths generate patterns, Sounds are effects that modify patterns
  return category === 'Synths';
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
      const pattern = strudelOutput(node, '');
      if (pattern) {
        nodePatterns[node.id] = pattern;
      }
    }
  });

  // If no edges, all nodes are isolated
  if (edges.length === 0) {
    const patterns = Object.values(nodePatterns);
    if (patterns.length === 0) return '';
    const result = patterns.map((pattern) => `$: ${pattern}`).join('\n');
    return cpm ? `setcpm(${cpm})\n${result}` : result;
  }

  // Find connected components and build patterns
  const components = findConnectedComponents(nodes, edges);
  const finalPatterns: string[] = [];

  components.forEach((componentNodeIds) => {
    // Get nodes in this component
    const componentNodes = componentNodeIds
      .map((id) => nodes.find((n) => n.id === id))
      .filter(Boolean) as AppNode[];

    // Separate sources from effects
    const sources = componentNodes.filter(isSoundSource);
    const effects = componentNodes.filter((node) => !isSoundSource(node));

    // Build base pattern from sources
    const sourcePatterns = sources
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
      finalPatterns.push(finalPattern);
    }
  });

  // Format result
  if (finalPatterns.length === 0) return '';
  const result = finalPatterns.map((pattern) => `$: ${pattern}`).join('\n');
  return cpm ? `setcpm(${cpm})\n${result}` : result;
}
