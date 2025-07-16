/**
 * Strudel pattern generation utilities
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
import { useStrudelStore } from '@/store/strudel-store';
import { getNodeStrudelOutput } from './node-registry';

/**
 * Generate complete Strudel output from nodes and edges
 */
export function generateOutput(nodes: AppNode[], edges: Edge[]): string {
  const cpm = useStrudelStore.getState().cpm;
  
  // Get all individual node patterns
  const nodePatterns = new Map<string, string>();
  const nodeTypes = new Map<string, string>();
  
  nodes.forEach(node => {
    nodeTypes.set(node.id, node.type);
    const strudelOutput = getNodeStrudelOutput(node.type);
    if (strudelOutput) {
      const pattern = strudelOutput(node, '');
      if (pattern) {
        nodePatterns.set(node.id, pattern);
      }
    }
  });
  
  // If there are no edges, just return all patterns separately
  if (edges.length === 0) {
    const patterns = Array.from(nodePatterns.values());
    if (patterns.length === 0) return '';
    const result = patterns.map(pattern => `$: ${pattern}`).join('\n');
    return cpm ? `setcpm(${cpm})\n${result}` : result;
  }
  
  // Find connected components
  const components = findConnectedComponents(nodes, edges);
  const finalPatterns: string[] = [];
  
  components.forEach(component => {
    // Separate source nodes (pads, drums) from effect nodes (sounds, effects)
    const sourceNodes: string[] = [];
    const effectNodes: string[] = [];
    
    component.forEach(nodeId => {
      const nodeType = nodeTypes.get(nodeId);
      // Effect nodes are those that modify existing patterns
      if (nodeType === 'sample-select' || 
          nodeType?.includes('-node') && !nodeType?.includes('pad') && !nodeType?.includes('drum')) {
        effectNodes.push(nodeId);
      } else {
        // Source nodes are pads, drums, arpeggiators - they generate patterns
        sourceNodes.push(nodeId);
      }
    });
    
    // Build base pattern from source nodes
    let basePattern = '';
    if (sourceNodes.length === 0) {
      // Only effect nodes - treat as regular pattern
      const patterns = component
        .map(nodeId => nodePatterns.get(nodeId))
        .filter(Boolean) as string[];
      
      if (patterns.length === 1) {
        basePattern = patterns[0];
      } else if (patterns.length > 1) {
        basePattern = `stack(${patterns.join(', ')})`;
      }
    } else {
      // Source nodes exist
      const sourcePatterns = sourceNodes
        .map(nodeId => nodePatterns.get(nodeId))
        .filter(Boolean) as string[];
      
      if (sourcePatterns.length === 1) {
        basePattern = sourcePatterns[0];
      } else if (sourcePatterns.length > 1) {
        basePattern = `stack(${sourcePatterns.join(', ')})`;
      }
    }
    
    // Apply effect nodes to the base pattern
    let finalPattern = basePattern;
    effectNodes.forEach(nodeId => {
      const nodeType = nodeTypes.get(nodeId);
      if (nodeType) {
        const strudelOutput = getNodeStrudelOutput(nodeType);
        if (strudelOutput) {
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            finalPattern = strudelOutput(node, finalPattern);
          }
        }
      }
    });
    
    if (finalPattern) {
      finalPatterns.push(finalPattern);
    }
  });
  
  if (finalPatterns.length === 0) return '';
  
  const result = finalPatterns.map(pattern => `$: ${pattern}`).join('\n');
  return cpm ? `setcpm(${cpm})\n${result}` : result;
}

/**
 * Find connected components in the graph
 */
function findConnectedComponents(nodes: AppNode[], edges: Edge[]): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];
  
  nodes.forEach(node => {
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
function dfs(nodeId: string, visited: Set<string>, component: string[], edges: Edge[]) {
  visited.add(nodeId);
  component.push(nodeId);
  
  edges.forEach(edge => {
    if (edge.source === nodeId && !visited.has(edge.target)) {
      dfs(edge.target, visited, component, edges);
    } else if (edge.target === nodeId && !visited.has(edge.source)) {
      dfs(edge.source, visited, component, edges);
    }
  });
}
