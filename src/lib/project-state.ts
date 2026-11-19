import type { Node, Edge, ColorMode } from '@xyflow/react';

export interface ProjectState {
  name?: string;
  author?: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  theme: string;
  colorMode: ColorMode;
  cpm: string;
  bpc?: string;
}

function validateState(value: unknown): ProjectState | null {
  if (!value || typeof value !== 'object') return null;
  const state = value as ProjectState;
  if (
    !Array.isArray(state.nodes) ||
    !Array.isArray(state.edges) ||
    typeof state.theme !== 'string' ||
    !['light', 'dark', 'system'].includes(state.colorMode) ||
    !Number.isFinite(Number(state.cpm)) ||
    Number(state.cpm) <= 0 ||
    (state.bpc !== undefined &&
      (!Number.isFinite(Number(state.bpc)) || Number(state.bpc) <= 0))
  )
    return null;
  if (
    ['name', 'author', 'description'].some((key) => {
      const field = (value as Record<string, unknown>)[key];
      return field !== undefined && typeof field !== 'string';
    })
  )
    return null;
  const ids = new Set<string>();
  for (const node of state.nodes) {
    if (
      !node ||
      typeof node.id !== 'string' ||
      ids.has(node.id) ||
      typeof node.type !== 'string' ||
      !node.data ||
      typeof node.data !== 'object' ||
      !node.position ||
      !Number.isFinite(node.position.x) ||
      !Number.isFinite(node.position.y)
    )
      return null;
    ids.add(node.id);
  }
  if (
    state.edges.some(
      (edge) =>
        !edge ||
        typeof edge.id !== 'string' ||
        !ids.has(edge.source) ||
        !ids.has(edge.target),
    )
  )
    return null;
  return { ...state, cpm: String(state.cpm), bpc: String(state.bpc ?? '4') };
}

function stateToJson(state: ProjectState): string {
  return JSON.stringify(state, null, 2);
}

export function stateFromJson(json: string): ProjectState | null {
  try {
    return validateState(JSON.parse(json));
  } catch (error) {
    console.error('Failed to parse state from JSON:', error);
    return null;
  }
}

export function downloadState(
  state: ProjectState,
  filename = 'strudel-together-patch.json',
): void {
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
