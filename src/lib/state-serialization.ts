// Pattern A: Simplified state serialization - no StrudelConfig needed
// All data is now stored in node.data and serialized automatically
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { Node, Edge, ColorMode } from '@xyflow/react';

export interface SerializableState {
  nodes: Node[];
  edges: Edge[];
  theme: string;
  colorMode: ColorMode;
}

/**
 * Serialize nodes, edges, and theme to a compressed base64 string
 */
export function serializeState(
  nodes: Node[],
  edges: Edge[],
  theme: string,
  colorMode: ColorMode
): string {
  const state: SerializableState = {
    nodes,
    edges,
    theme,
    colorMode,
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
  theme: string,
  colorMode: ColorMode
): string {
  const compressed = serializeState(nodes, edges, theme, colorMode);
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
