/**
 * Utilities for working with workflow graphs and node connections
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
import { useStrudelStore } from '@/store/strudel-store';

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

    // Follow edges in both directions
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
 * Generate a consistent group ID for a set of connected nodes
 */
export function generateGroupId(nodeIds: string[]): string {
  return nodeIds.sort().join('-');
}

/**
 * Find all connected groups with their IDs
 */
export function findAllGroups(nodes: AppNode[], edges: Edge[]): Array<{ groupId: string; nodeIds: string[] }> {
  const patternNodes = nodes.filter((node) => {
    const config = useStrudelStore.getState().config[node.id];
    return config && Object.keys(config).length > 0;
  });

  const processedNodes = new Set<string>();
  const groups: Array<{ groupId: string; nodeIds: string[] }> = [];

  patternNodes.forEach((node) => {
    if (!processedNodes.has(node.id)) {
      const connectedNodeIds = findConnectedNodeIds(node.id, edges);
      const nodeIds = Array.from(connectedNodeIds).filter((nodeId) => {
        // Only include nodes that have configurations
        const config = useStrudelStore.getState().config[nodeId];
        return config && Object.keys(config).length > 0;
      });

      // Mark all nodes in this group as processed
      nodeIds.forEach((nodeId) => processedNodes.add(nodeId));

      if (nodeIds.length > 0) {
        const groupId = generateGroupId(nodeIds);
        groups.push({ groupId, nodeIds });
      }
    }
  });

  return groups;
}

/**
 * Check if a node has any incoming edges (is not a top-level node)
 */
export function hasIncomingEdges(nodeId: string, edges: Edge[]): boolean {
  return edges.some((edge) => edge.target === nodeId);
}

/**
 * Check if any node in a group is a top-level node (no incoming edges)
 */
export function hasTopLevelNode(nodeIds: string[], edges: Edge[]): boolean {
  return nodeIds.some((nodeId) => !hasIncomingEdges(nodeId, edges));
}
