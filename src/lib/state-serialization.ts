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
  cpm: string;
  bpc?: string;
}

/**
 * Serialize nodes, edges, and theme to a compressed base64 string
 */
export function serializeState(
  nodes: Node[],
  edges: Edge[],
  theme: string,
  colorMode: ColorMode,
  cpm: string,
  bpc?: string
): string {
  const state: SerializableState = { nodes, edges, theme, colorMode, cpm, bpc };
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
 * Serialize state to a JSON string for file saving
 */
export function serializeStateForFile(
  nodes: Node[],
  edges: Edge[],
  theme: string,
  colorMode: ColorMode,
  cpm: string,
  bpc?: string
): string {
  const state: SerializableState = { nodes, edges, theme, colorMode, cpm, bpc };
  return JSON.stringify(state, null, 2);
}

/**
 * Deserialize a JSON string from a file
 */
export function deserializeStateFromFile(jsonString: string): SerializableState | null {
  try {
    const state = JSON.parse(jsonString) as SerializableState;
    return state;
  } catch (error) {
    console.error('Failed to deserialize state from file:', error);
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
  cpm: string,
  bpc?: string
): string {
  const url = new URL(window.location.href);
  url.searchParams.set(
    'state',
    serializeState(nodes, edges, theme, colorMode, cpm, bpc)
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

/**
 * Save state to a .json file
 */
export function saveStateToFile(
  nodes: Node[],
  edges: Edge[],
  theme: string,
  colorMode: ColorMode,
  cpm: string,
  bpc?: string,
  filename: string = 'strudel-flow-project.json'
): void {
  const jsonString = serializeStateForFile(
    nodes,
    edges,
    theme,
    colorMode,
    cpm,
    bpc
  );
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
