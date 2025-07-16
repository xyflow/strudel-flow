/**
 * Utilities for working with workflow graphs and node connections
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
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
  return nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  );
}

/**
 * Trace branch path from a source node until hitting a merge point
 */
function traceBranchPath(
  sourceNodeId: string, 
  edges: Edge[], 
  mergeNodes: Set<string>
): { branch: string[], mergeNodeId: string | null } {
  const visited = new Set<string>();
  const branch: string[] = [];
  
  function traceBranch(nodeId: string): string | null {
    if (visited.has(nodeId) || mergeNodes.has(nodeId)) {
      return nodeId; // Return the merge node ID
    }
    
    visited.add(nodeId);
    branch.push(nodeId);
    
    // Find outgoing edges from this node
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    
    if (outgoingEdges.length === 0) {
      return null; // End of branch
    } else if (outgoingEdges.length === 1) {
      return traceBranch(outgoingEdges[0].target); // Continue tracing
    } else {
      return null; // This node branches out - not a simple linear path
    }
  }

  const mergeNodeId = traceBranch(sourceNodeId);
  return { branch, mergeNodeId };
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
  const groups: Array<{ groupId: string; nodeIds: string[]; connectorNodes: string[] }> = [];

  sourceNodes.forEach((sourceNode) => {
    if (processedNodes.has(sourceNode.id)) return;

    const { branch, mergeNodeId } = traceBranchPath(sourceNode.id, edges, mergeNodes);
    
    if (branch.length > 0) {
      // Mark all nodes in this branch as processed
      branch.forEach(nodeId => processedNodes.add(nodeId));
      
      // Create group for this branch
      const groupId = branch.join('-');
      groups.push({ 
        groupId, 
        nodeIds: branch, 
        connectorNodes: mergeNodeId ? [mergeNodeId] : [] 
      });
    }
  });

  return groups;
}

/**
 * Handle any remaining unprocessed nodes
 */
function processRemainingNodes(
  nodes: AppNode[], 
  processedNodes: Set<string>
): Array<{ groupId: string; nodeIds: string[]; connectorNodes: string[] }> {
  const groups: Array<{ groupId: string; nodeIds: string[]; connectorNodes: string[] }> = [];

  nodes.forEach((node) => {
    if (!processedNodes.has(node.id)) {
      const hasStrudelOutput = !!(node.type && getNodeStrudelOutput(node.type));
      
      if (hasStrudelOutput) {
        groups.push({
          groupId: node.id,
          nodeIds: [],
          connectorNodes: [node.id]
        });
      }
    }
  });

  return groups;
}

/**
 * Find all parallel branches that should be stacked together
 */
export function findAllGroups(nodes: AppNode[], edges: Edge[]): Array<{ 
  groupId: string; 
  nodeIds: string[]; 
  connectorNodes: string[]; 
}> {
  const mergeNodes = findMergeNodes(edges);
  const sourceNodes = findSourceNodes(nodes, edges);
  
  // Process source nodes to find their branch paths
  const sourceGroups = processSourceNodes(sourceNodes, edges, mergeNodes);
  
  // Collect all processed node IDs
  const processedNodes = new Set<string>();
  sourceGroups.forEach(group => {
    group.nodeIds.forEach(nodeId => processedNodes.add(nodeId));
  });
  
  // Handle any remaining unprocessed nodes
  const remainingGroups = processRemainingNodes(nodes, processedNodes);
  
  return [...sourceGroups, ...remainingGroups];
}
