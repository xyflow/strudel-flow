/**
 * Strudel pattern generation utilities
 */

import { Edge } from '@xyflow/react';
import { AppNode } from '@/components/nodes';
import { useStrudelStore } from '@/store/strudel-store';
import { PATTERN_BUILDERS } from './pattern-builders';
import { 
  findAllGroups, 
  hasTopLevelNode 
} from './graph-utils';

// Re-export for backward compatibility
export { findConnectedNodeIds, generateGroupId, findAllGroups } from './graph-utils';

/**
 * Merge node configurations within a group
 */
function mergeNodeConfigurations(nodeIds: string[]): Record<string, string | boolean | undefined> {
  return nodeIds.reduce<Record<string, string | boolean | undefined>>((acc, nodeId) => {
    const config = useStrudelStore.getState().config[nodeId] || {};
    return { ...acc, ...config };
  }, {});
}

/**
 * Build pattern parts from configuration using pattern builders
 */
function buildPatternParts(config: Record<string, string | boolean | undefined>): string[] {
  return Object.keys(PATTERN_BUILDERS)
    .map((key) => {
      const value = config[key];
      // Skip CPM here - we'll handle it globally
      if (key === 'cpm') return '';
      if (key in PATTERN_BUILDERS && value !== undefined) {
        const builder = PATTERN_BUILDERS[key];
        return builder(value);
      }
      return '';
    })
    .filter(Boolean);
}

/**
 * Format a pattern string for a group
 */
function formatGroupPattern(patternParts: string[], isTopLevel: boolean): string {
  if (patternParts.length === 0) {
    return 'no pattern';
  }

  // Join with dots, but remove leading dot if it's a top-level node
  const joinedPattern = patternParts.join('.');
  const finalPattern = isTopLevel && joinedPattern.startsWith('.')
    ? joinedPattern.substring(1)
    : joinedPattern;

  return `$: ${finalPattern}`;
}

/**
 * Generate complete Strudel output from nodes and edges
 */
export function generateOutput(nodes: AppNode[], edges: Edge[]): string {
  // Get global CPM from store
  const cpm = useStrudelStore.getState().cpm;

  // Find all connected groups
  const groups = findAllGroups(nodes, edges);

  // Build patterns for each group by merging configurations
  const patterns = groups.map((group) => {
    // Check if any node in the group is a top-level node (no incoming edges)
    const isTopLevel = hasTopLevelNode(group.nodeIds, edges);

    // Merge all configurations in the group
    const mergedConfig = mergeNodeConfigurations(group.nodeIds);

    // Build pattern parts
    const patternParts = buildPatternParts(mergedConfig);

    // Format the final pattern
    return formatGroupPattern(patternParts, isTopLevel);
  });

  // Filter out empty patterns
  const validPatterns = patterns.filter((pattern) => pattern !== 'no pattern');

  // If no valid patterns, return empty string so workflow stops
  if (validPatterns.length === 0) {
    return '';
  }

  // Build final output with global CPM
  let output = '';

  if (cpm && cpm.trim() !== '') {
    output += `setcpm(${cpm})\n`;
  }

  output += validPatterns.join('\n');

  return output;
}
