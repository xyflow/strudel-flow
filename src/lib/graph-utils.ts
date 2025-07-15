/**
 * Utilities for working with workflow graphs and node connections
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
import { useStrudelStore } from '@/store/strudel-store';
import { getNodeStrudelOutput } from './node-registry';

/**
 * Find all nodes connected to a given node (including the node itself)
 */
export function findConnectedNodeIds(
  nodeId: string,
  edges: Edge[]
): Set<string> {
  const visited = new Set<string>();

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    edges.forEach((edge) => {
      if (edge.source === id) {
        visit(edge.target);
      } else if (edge.target === id) {
        visit(edge.source);
      }
    });
  }

  visit(nodeId);
  return visited;
}

/**
 * Find all connected groups with their IDs
 */
export function findAllGroups(nodes: AppNode[], edges: Edge[]): Array<{ groupId: string; nodeIds: string[] }> {
  const processedNodes = new Set<string>();
  const groups: Array<{ groupId: string; nodeIds: string[] }> = [];

  nodes.forEach((node) => {
    if (!processedNodes.has(node.id)) {
      const connectedNodeIds = findConnectedNodeIds(node.id, edges);
      const nodeIds = Array.from(connectedNodeIds).filter((nodeId) => {
        const config = useStrudelStore.getState().config[nodeId];
        const hasConfig = config && Object.keys(config).length > 0;
        const nodeType = nodes.find(n => n.id === nodeId)?.type;
        const hasStrudelOutput = !!(nodeType && getNodeStrudelOutput(nodeType));
        return hasConfig || hasStrudelOutput;
      });

      nodeIds.forEach((nodeId) => processedNodes.add(nodeId));

      if (nodeIds.length > 0) {
        const groupId = nodeIds.sort().join('-');
        groups.push({ groupId, nodeIds });
      }
    }
  });

  return groups;
}
