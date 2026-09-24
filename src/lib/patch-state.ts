import { useAppStore } from '@/store/app-store';
import { nodeTypes, type AppNode } from '@/components/nodes/registry';
import type { ProjectState } from './project-state';

export function capturePatch(): ProjectState {
  const {
    name,
    author,
    description,
    nodes,
    edges,
    theme,
    colorMode,
    cpm,
    bpc,
  } = useAppStore.getState();
  return {
    name: name.trim() || 'Untitled patch',
    author: author.trim(),
    description: description.trim(),
    nodes: nodes.map(({ id, type, position, data }) => ({
      id,
      type,
      position,
      data,
    })),
    edges: edges.map(
      ({ id, source, target, sourceHandle, targetHandle, type }) => ({
        id,
        source,
        target,
        sourceHandle,
        targetHandle,
        type,
      }),
    ),
    theme,
    colorMode,
    cpm,
    bpc,
  };
}

export function applyPatch(state: ProjectState): boolean {
  if (
    state.nodes.some(
      (node) =>
        !Object.prototype.hasOwnProperty.call(nodeTypes, node.type ?? ''),
    )
  )
    return false;
  useAppStore.setState({
    name: state.name ?? 'Untitled patch',
    author: state.author ?? '',
    description: state.description ?? '',
    nodes: state.nodes as AppNode[],
    edges: state.edges,
    theme: state.theme,
    colorMode: state.colorMode,
    cpm: state.cpm,
    bpc: state.bpc ?? '4',
    isPlaying: false,
    error: null,
  });
  return true;
}
