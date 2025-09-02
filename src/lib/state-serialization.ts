/**
 * State serialization utilities for workflow persistence
 */
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { Node, Edge, ColorMode } from '@xyflow/react';

export interface SerializableState {
  nodes: Node[];
  edges: Edge[];
  theme: string;
  colorMode: ColorMode;
  cpm: string; // Add CPM to serializable state
}

/**
 * Serialize nodes, edges, and theme to a compressed base64 string
 */
export function serializeState(
  nodes: Node[],
  edges: Edge[],
  theme: string,
  colorMode: ColorMode,
  cpm: string // Add CPM parameter
): string {
  const state: SerializableState = { nodes, edges, theme, colorMode, cpm };
  return compressToBase64(JSON.stringify(state));
}

/**
 * Deserialize a compressed base64 string back to nodes, edges, and theme
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
  colorMode: ColorMode,
  cpm: string // Add CPM parameter
): string {
  const url = new URL(window.location.href);
  url.searchParams.set(
    'state',
    serializeState(nodes, edges, theme, colorMode, cpm)
  );
  return url.toString();
}

/**
 * Load state from URL parameters
 */
export function loadStateFromUrl(): SerializableState | null {
  const stateParam = new URLSearchParams(window.location.search).get('state');
  return stateParam ? deserializeState(stateParam) : null;
}
