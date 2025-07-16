/**
 * Strudel pattern generation utilities
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
import { useStrudelStore } from '@/store/strudel-store';
import { getNodeStrudelOutput } from './node-registry';
import { findAllGroups } from './graph-utils';

/**
 * Build pattern for a group of nodes
 */
function buildGroupPattern(groupNodes: AppNode[]): string {
  return groupNodes.reduce((acc, node) => {
    const strudelOutput = getNodeStrudelOutput(node.type);
    return strudelOutput ? strudelOutput(node, acc) : acc;
  }, '');
}

/**
 * Process a single group to create group patterns
 */
function processGroup(group: ReturnType<typeof findAllGroups>[0], nodes: AppNode[]): string | null {
  const groupNodes = group.nodeIds
    .map(id => nodes.find(n => n.id === id))
    .filter(Boolean) as AppNode[];

  if (groupNodes.length === 0) return null;

  const groupPattern = buildGroupPattern(groupNodes);
  if (!groupPattern) return null;

  // Only wrap in stack() if there are multiple nodes in the group
  return groupNodes.length > 1 
    ? `stack(${groupPattern})` 
    : groupPattern;
}

/**
 * Build connector patterns from unique connector node IDs
 */
function buildConnectorPatterns(connectorNodeIds: Set<string>, nodes: AppNode[]): string[] {
  const connectorPatterns: string[] = [];
  
  Array.from(connectorNodeIds).forEach((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const strudelOutput = getNodeStrudelOutput(node.type);
      if (strudelOutput) {
        const connectorPattern = strudelOutput(node, '');
        if (connectorPattern) {
          connectorPatterns.push(connectorPattern);
        }
      }
    }
  });
  
  return connectorPatterns;
}

/**
 * Chain patterns together with appropriate syntax
 */
function chainPatterns(allPatterns: string[], groupPatterns: string[]): string {
  if (allPatterns.length === 1) {
    return allPatterns[0];
  }

  let finalPattern = allPatterns[0];
  for (let i = 1; i < allPatterns.length; i++) {
    const pattern = allPatterns[i];
    if (pattern.startsWith('stack(') || groupPatterns.includes(pattern)) {
      finalPattern += `.stack(${pattern})`;
    } else {
      finalPattern += `.${pattern}`;
    }
  }
  
  return finalPattern;
}

/**
 * Generate complete Strudel output from nodes and edges
 */
export function generateOutput(nodes: AppNode[], edges: Edge[]): string {
  const cpm = useStrudelStore.getState().cpm;
  const groups = findAllGroups(nodes, edges);

  const groupPatterns: string[] = [];
  const connectorNodeIds = new Set<string>();

  // Process each group to build patterns
  groups.forEach((group) => {
    const groupPattern = processGroup(group, nodes);
    if (groupPattern) {
      groupPatterns.push(groupPattern);
    }

    // Collect unique connector node IDs
    group.connectorNodes.forEach(nodeId => {
      connectorNodeIds.add(nodeId);
    });
  });

  // Build connector patterns from unique connector nodes
  const connectorPatterns = buildConnectorPatterns(connectorNodeIds, nodes);

  // Combine all patterns
  const allPatterns = [...groupPatterns, ...connectorPatterns];
  
  if (allPatterns.length === 0) return '';

  // Chain patterns together
  const finalPattern = chainPatterns(allPatterns, groupPatterns);

  const result = `$: ${finalPattern}`;
  return cpm ? `setcpm(${cpm})\n${result}` : result;
}
