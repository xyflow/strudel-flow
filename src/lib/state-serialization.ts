import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { Node, Edge } from '@xyflow/react';
import { StrudelConfig } from '@/types';

export interface SerializableState {
  nodes: Node[]; // Now includes internal states in node.data.internalState
  edges: Edge[];
  strudelConfig: Record<string, StrudelConfig>; // Node configurations from Strudel store
}

/**
 * Serialize nodes (with internal states), edges, and strudel config to a compressed base64 string
 */
export function serializeState(
  nodes: Node[],
  edges: Edge[],
  strudelConfig: Record<string, StrudelConfig>
): string {
  const state: SerializableState = {
    nodes, // Nodes now contain internal states in their data property
    edges,
    strudelConfig,
  };

  const jsonString = JSON.stringify(state);
  const compressed = compressToBase64(jsonString);

  return compressed;
}

/**
 * Deserialize a compressed base64 string back to nodes, edges, and config
 */
export function deserializeState(compressed: string): SerializableState | null {
  try {
    const jsonString = decompressFromBase64(compressed);
    if (!jsonString) return null;

    const state = JSON.parse(jsonString) as SerializableState;
    return state;
  } catch (error) {
    console.error('Failed to deserialize state:', error);
    return null;
  }
}

/**
 * Generate a shareable URL with the current state
 */
export function generateShareableUrl(
  nodes: Node[],
  edges: Edge[],
  strudelConfig: Record<string, StrudelConfig>
): string {
  const compressed = serializeState(nodes, edges, strudelConfig);
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('state', compressed);
  return currentUrl.toString();
}

/**
 * Load state from URL parameters
 */
export function loadStateFromUrl(): SerializableState | null {
  const urlParams = new URLSearchParams(window.location.search);
  const stateParam = urlParams.get('state');

  if (!stateParam) return null;

  return deserializeState(stateParam);
}
