/**
 * Strudel pattern generation utilities
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
import nodesConfig from '@/components/nodes';
import { useStrudelStore } from '@/store/strudel-store';
import { getNodeStrudelOutput } from './node-registry';
import { findConnectedComponents } from './graph-utils';

/**
 * Extract node patterns and types from nodes
 */
function extractNodeData(nodes: AppNode[]): {
  nodePatterns: Map<string, string>;
  nodeTypes: Map<string, string>;
} {
  const nodePatterns = new Map<string, string>();
  const nodeTypes = new Map<string, string>();

  nodes.forEach((node) => {
    nodeTypes.set(node.id, node.type);
    const strudelOutput = getNodeStrudelOutput(node.type);
    if (strudelOutput) {
      const pattern = strudelOutput(node, '');
      if (pattern) {
        nodePatterns.set(node.id, pattern);
      }
    }
  });

  return { nodePatterns, nodeTypes };
}

/**
 * Handle the case where there are no edges (all nodes are isolated)
 */
function handleIsolatedNodes(
  nodePatterns: Map<string, string>,
  cpm: number | string | null
): string {
  const patterns = Array.from(nodePatterns.values());
  if (patterns.length === 0) return '';
  const result = patterns.map((pattern) => `$: ${pattern}`).join('\n');
  return cpm ? `setcpm(${cpm})\n${result}` : result;
}

/**
 * Determine if a node is an effect node based on its category
 */
function isEffectNode(node: AppNode): boolean {
  const nodeConfig = nodesConfig[node.type];
  const category = nodeConfig?.category;
  return category === 'Audio Effects' || category === 'Time Effects';
}

/**
 * Separate nodes into source and effect categories
 */
function categorizeNodes(
  component: string[],
  nodes: AppNode[]
): {
  sourceNodes: string[];
  effectNodes: string[];
} {
  const sourceNodes: string[] = [];
  const effectNodes: string[] = [];

  component.forEach((nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && isEffectNode(node)) {
      effectNodes.push(nodeId);
    } else {
      // Source nodes are pads, drums, arpeggiators - they generate patterns
      sourceNodes.push(nodeId);
    }
  });

  return { sourceNodes, effectNodes };
}

/**
 * Build base pattern from source nodes
 */
function buildBasePattern(
  sourceNodes: string[],
  nodePatterns: Map<string, string>
): string {
  const sourcePatterns = sourceNodes
    .map((nodeId) => nodePatterns.get(nodeId))
    .filter(Boolean) as string[];

  if (sourcePatterns.length === 0) return '';
  if (sourcePatterns.length === 1) return sourcePatterns[0];
  return `stack(${sourcePatterns.join(', ')})`;
}

/**
 * Apply effect nodes to a base pattern
 */
function applyEffectNodes(
  basePattern: string,
  effectNodes: string[],
  nodeTypes: Map<string, string>,
  nodes: AppNode[]
): string {
  let finalPattern = basePattern;

  effectNodes.forEach((nodeId) => {
    const nodeType = nodeTypes.get(nodeId);
    if (nodeType) {
      const strudelOutput = getNodeStrudelOutput(nodeType);
      if (strudelOutput) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          finalPattern = strudelOutput(node, finalPattern);
        }
      }
    }
  });

  return finalPattern;
}

/**
 * Process a single connected component
 */
function processComponent(
  component: string[],
  nodePatterns: Map<string, string>,
  nodeTypes: Map<string, string>,
  nodes: AppNode[]
): string {
  const { sourceNodes, effectNodes } = categorizeNodes(component, nodes);

  // Build base pattern from source nodes
  let basePattern = '';
  if (sourceNodes.length === 0) {
    // Only effect nodes - treat as regular pattern
    const patterns = component
      .map((nodeId) => nodePatterns.get(nodeId))
      .filter(Boolean) as string[];

    if (patterns.length === 1) {
      basePattern = patterns[0];
    } else if (patterns.length > 1) {
      basePattern = `stack(${patterns.join(', ')})`;
    }
  } else {
    // Source nodes exist
    basePattern = buildBasePattern(sourceNodes, nodePatterns);
  }

  // Apply effect nodes to the base pattern
  return applyEffectNodes(basePattern, effectNodes, nodeTypes, nodes);
}

/**
 * Format final result with CPM if needed
 */
function formatFinalResult(
  finalPatterns: string[],
  cpm: number | string | null
): string {
  if (finalPatterns.length === 0) return '';

  const result = finalPatterns.map((pattern) => `$: ${pattern}`).join('\n');
  return cpm ? `setcpm(${cpm})\n${result}` : result;
}

/**
 * Generate complete Strudel output from nodes and edges
 */
export function generateOutput(nodes: AppNode[], edges: Edge[]): string {
  const cpm = useStrudelStore.getState().cpm;

  // Extract node patterns and types
  const { nodePatterns, nodeTypes } = extractNodeData(nodes);

  // If there are no edges, just return all patterns separately
  if (edges.length === 0) {
    return handleIsolatedNodes(nodePatterns, cpm);
  }

  // Find connected components
  const components = findConnectedComponents(nodes, edges);
  const finalPatterns: string[] = [];

  // Process each component
  components.forEach((component) => {
    const finalPattern = processComponent(
      component,
      nodePatterns,
      nodeTypes,
      nodes
    );
    if (finalPattern) {
      finalPatterns.push(finalPattern);
    }
  });

  return formatFinalResult(finalPatterns, cpm);
}
