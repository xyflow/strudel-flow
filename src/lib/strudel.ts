/**
 * Strudel pattern generation utilities
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
import { useStrudelStore } from '@/store/strudel-store';
import { getNodeStrudelOutput } from './node-registry';
import { 
  findAllGroups, 
  hasTopLevelNode 
} from './graph-utils';

// Re-export for backward compatibility
export { findConnectedNodeIds, generateGroupId, findAllGroups } from './graph-utils';

/**
 * Build pattern for a single node using its strudelOutput method
 */
function buildNodePattern(node: AppNode, inputPattern: string = ''): string {
  const strudelOutput = getNodeStrudelOutput(node.type);
  
  if (strudelOutput) {
    return strudelOutput(node, inputPattern);
  }
  
  // No strudelOutput method found - return input pattern unchanged
  return inputPattern;
}

/**
 * Build pattern for a group of connected nodes
 */
function buildGroupPattern(nodeIds: string[], nodes: AppNode[]): string {
  // Get nodes in order (you might want to implement proper ordering based on edges)
  const sortedNodes = nodeIds
    .map(id => nodes.find(n => n.id === id))
    .filter(Boolean) as AppNode[];
  
  return sortedNodes.reduce((pattern, node) => {
    return buildNodePattern(node, pattern);
  }, '');
}

/**
 * Generate complete Strudel output from nodes and edges
 */
export function generateOutput(nodes: AppNode[], edges: Edge[]): string {
  // Get global CPM from store
  const cpm = useStrudelStore.getState().cpm;

  // Find all connected groups
  const groups = findAllGroups(nodes, edges);

  // Build patterns for each group
  const patterns = groups.map((group) => {
    const pattern = buildGroupPattern(group.nodeIds, nodes);
    const isTopLevel = hasTopLevelNode(group.nodeIds, edges);
    
    if (!pattern) return '';
    
    // Format the final pattern
    const finalPattern = isTopLevel && pattern.startsWith('.')
      ? pattern.substring(1)
      : pattern;
    
    return `$: ${finalPattern}`;
  }).filter(Boolean);

  // If no valid patterns, return empty string
  if (patterns.length === 0) {
    return '';
  }

  // Build final output with global CPM
  let output = '';

  if (cpm && cpm.trim() !== '') {
    output += `setcpm(${cpm})\n`;
  }

  output += patterns.join('\n');

  return output;
}
