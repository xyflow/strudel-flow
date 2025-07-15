/**
 * Strudel pattern generation utilities
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
import { useStrudelStore } from '@/store/strudel-store';
import { getNodeStrudelOutput } from './node-registry';
import { findAllGroups } from './graph-utils';

// Re-export for backward compatibility
export { findConnectedNodeIds, generateGroupId, findAllGroups } from './graph-utils';

/**
 * Generate complete Strudel output from nodes and edges
 */
export function generateOutput(nodes: AppNode[], edges: Edge[]): string {
  const cpm = useStrudelStore.getState().cpm;
  const groups = findAllGroups(nodes, edges);

  const patterns = groups
    .map((group) => {
      const pattern = group.nodeIds
        .map(id => nodes.find(n => n.id === id))
        .filter(Boolean)
        .reduce((acc, node) => {
          const strudelOutput = getNodeStrudelOutput((node as AppNode).type);
          return strudelOutput ? strudelOutput(node as AppNode, acc) : acc;
        }, '');
      
      return pattern ? `$: ${pattern}` : '';
    })
    .filter(Boolean);

  if (patterns.length === 0) return '';

  return cpm ? `setcpm(${cpm})\n${patterns.join('\n')}` : patterns.join('\n');
}
