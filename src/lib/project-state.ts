import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { Node, Edge, ColorMode } from '@xyflow/react';

export interface ProjectState {
  nodes: Node[];
  edges: Edge[];
  theme: string;
  colorMode: ColorMode;
  cpm: string;
  bpc?: string;
}

// --- URL (compressed for sharing) ---

export function encodeState(state: ProjectState): string {
  return compressToBase64(JSON.stringify(state));
}

export function decodeState(encoded: string): ProjectState | null {
  try {
    const json = decompressFromBase64(encoded);
    if (!json) return null;
    return JSON.parse(json) as ProjectState;
  } catch (error) {
    console.error('Failed to decode state:', error);
    return null;
  }
}

export function getShareUrl(state: ProjectState): string {
  const url = new URL(window.location.href);
  url.searchParams.set('state', encodeState(state));
  return url.toString();
}

export function loadFromUrl(): ProjectState | null {
  const param = new URLSearchParams(window.location.search).get('state');
  return param ? decodeState(param) : null;
}

// --- File (readable JSON for saving/loading) ---

export function stateToJson(state: ProjectState): string {
  return JSON.stringify(state, null, 2);
}

export function stateFromJson(json: string): ProjectState | null {
  try {
    return JSON.parse(json) as ProjectState;
  } catch (error) {
    console.error('Failed to parse state from JSON:', error);
    return null;
  }
}

export function downloadState(state: ProjectState, filename = 'strudel-flow-project.json'): void {
  const blob = new Blob([stateToJson(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
