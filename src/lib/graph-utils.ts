/**
 * Utilities for working with workflow graphs and node connections
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
import { getNodeStrudelOutput } from './node-registry';

/**
 * Find nodes that have multiple incoming edges (merge points)
 */
function findMergeNodes(edges: Edge[]): Set<string> {
  const incomingCounts = new Map<string, number>();

  edges.forEach((edge) => {
    incomingCounts.set(edge.target, (incomingCounts.get(edge.target) || 0) + 1);
  });

  const mergeNodes = new Set<string>();
  incomingCounts.forEach((count, nodeId) => {
    if (count > 1) {
      mergeNodes.add(nodeId);
    }
  });

  return mergeNodes;
}

/**
 * Find all source nodes (nodes with no incoming edges)
 */
function findSourceNodes(nodes: AppNode[], edges: Edge[]): AppNode[] {
  return nodes.filter((node) => !edges.some((edge) => edge.target === node.id));
}

/**
 * Find outgoing edges from a specific node
 */
function findOutgoingEdges(nodeId: string, edges: Edge[]): Edge[] {
  return edges.filter((edge) => edge.source === nodeId);
}

/**
 * Trace a single branch path recursively
 */
function traceBranch(
  nodeId: string,
  edges: Edge[],
  mergeNodes: Set<string>,
  visited: Set<string>,
  branch: string[]
): string | null {
  if (visited.has(nodeId) || mergeNodes.has(nodeId)) {
    return nodeId; // Return the merge node ID
  }

  visited.add(nodeId);
  branch.push(nodeId);

  const outgoingEdges = findOutgoingEdges(nodeId, edges);

  if (outgoingEdges.length === 0) {
    return null; // End of branch
  } else if (outgoingEdges.length === 1) {
    return traceBranch(
      outgoingEdges[0].target,
      edges,
      mergeNodes,
      visited,
      branch
    );
  } else {
    return null; // This node branches out - not a simple linear path
  }
}

/**
 * Trace branch path from a source node until hitting a merge point
 */
function traceBranchPath(
  sourceNodeId: string,
  edges: Edge[],
  mergeNodes: Set<string>
): { branch: string[]; mergeNodeId: string | null } {
  const visited = new Set<string>();
  const branch: string[] = [];

  const mergeNodeId = traceBranch(
    sourceNodeId,
    edges,
    mergeNodes,
    visited,
    branch
  );
  return { branch, mergeNodeId };
}

/**
 * Create a group object from branch data
 */
function createGroupFromBranch(
  branch: string[],
  mergeNodeId: string | null
): {
  groupId: string;
  nodeIds: string[];
  connectorNodes: string[];
} {
  const groupId = branch.join('-');
  return {
    groupId,
    nodeIds: branch,
    connectorNodes: mergeNodeId ? [mergeNodeId] : [],
  };
}

/**
 * Mark nodes as processed
 */
function markNodesAsProcessed(
  nodeIds: string[],
  processedNodes: Set<string>
): void {
  nodeIds.forEach((nodeId) => processedNodes.add(nodeId));
}

/**
 * Process source nodes to find their branch paths
 */
function processSourceNodes(
  sourceNodes: AppNode[],
  edges: Edge[],
  mergeNodes: Set<string>
): Array<{ groupId: string; nodeIds: string[]; connectorNodes: string[] }> {
  const processedNodes = new Set<string>();
  const groups: Array<{
    groupId: string;
    nodeIds: string[];
    connectorNodes: string[];
  }> = [];

  sourceNodes.forEach((sourceNode) => {
    if (processedNodes.has(sourceNode.id)) return;

    const { branch, mergeNodeId } = traceBranchPath(
      sourceNode.id,
      edges,
      mergeNodes
    );

    if (branch.length > 0) {
      markNodesAsProcessed(branch, processedNodes);
      groups.push(createGroupFromBranch(branch, mergeNodeId));
    }
  });

  return groups;
}

/**
 * Check if a node has a strudel output method
 */
function hasStrudelOutput(node: AppNode): boolean {
  return !!(node.type && getNodeStrudelOutput(node.type));
}

/**
 * Create a group for a single unprocessed node
 */
function createSingleNodeGroup(node: AppNode): {
  groupId: string;
  nodeIds: string[];
  connectorNodes: string[];
} {
  return {
    groupId: node.id,
    nodeIds: [],
    connectorNodes: [node.id],
  };
}

/**
 * Handle any remaining unprocessed nodes
 */
function processRemainingNodes(
  nodes: AppNode[],
  processedNodes: Set<string>
): Array<{ groupId: string; nodeIds: string[]; connectorNodes: string[] }> {
  const groups: Array<{
    groupId: string;
    nodeIds: string[];
    connectorNodes: string[];
  }> = [];

  nodes.forEach((node) => {
    if (!processedNodes.has(node.id) && hasStrudelOutput(node)) {
      groups.push(createSingleNodeGroup(node));
    }
  });

  return groups;
}

/**
 * Collect all processed node IDs from groups
 */
function collectProcessedNodeIds(
  groups: Array<{ nodeIds: string[] }>
): Set<string> {
  const processedNodes = new Set<string>();
  groups.forEach((group) => {
    group.nodeIds.forEach((nodeId) => processedNodes.add(nodeId));
  });
  return processedNodes;
}

/**
 * Find all parallel branches that should be stacked together
 */
export function findAllGroups(
  nodes: AppNode[],
  edges: Edge[]
): Array<{
  groupId: string;
  nodeIds: string[];
  connectorNodes: string[];
}> {
  const mergeNodes = findMergeNodes(edges);
  const sourceNodes = findSourceNodes(nodes, edges);

  // Process source nodes to find their branch paths
  const sourceGroups = processSourceNodes(sourceNodes, edges, mergeNodes);

  // Collect all processed node IDs
  const processedNodes = collectProcessedNodeIds(sourceGroups);

  // Handle any remaining unprocessed nodes
  const remainingGroups = processRemainingNodes(nodes, processedNodes);

  return [...sourceGroups, ...remainingGroups];
}

/**
 * Find connected components in the graph
 */
export function findConnectedComponents(
  nodes: AppNode[],
  edges: Edge[]
): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      const component: string[] = [];
      dfs(node.id, visited, component, edges);
      if (component.length > 0) {
        components.push(component);
      }
    }
  });

  return components;
}

/**
 * Depth-first search to find connected nodes
 */
export function dfs(
  nodeId: string,
  visited: Set<string>,
  component: string[],
  edges: Edge[]
) {
  visited.add(nodeId);
  component.push(nodeId);

  edges.forEach((edge) => {
    if (edge.source === nodeId && !visited.has(edge.target)) {
      dfs(edge.target, visited, component, edges);
    } else if (edge.target === nodeId && !visited.has(edge.source)) {
      dfs(edge.source, visited, component, edges);
    }
  });
}
