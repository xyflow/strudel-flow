import { useAppStore } from '@/store/app-store';
import { useStrudelStore } from '@/store/strudel-store';
import { usePlaybackStore } from '@/store/playback-store';
import { nodeTypes, type AppNode } from '@/components/nodes';
import type { ProjectState } from './project-state';

export function capturePatch(): ProjectState {
  const { nodes, edges, theme, colorMode } = useAppStore.getState();
  const { cpm, bpc } = useStrudelStore.getState();
  return {
    nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
    edges: edges.map(({ id, source, target, sourceHandle, targetHandle, type }) => ({ id, source, target, sourceHandle, targetHandle, type })),
    theme, colorMode, cpm, bpc,
  };
}

export function applyPatch(state: ProjectState): boolean {
  if (state.nodes.some(node => !Object.prototype.hasOwnProperty.call(nodeTypes, node.type ?? ''))) return false;
  usePlaybackStore.getState().pause();
  useAppStore.setState({ nodes: state.nodes as AppNode[], edges: state.edges, theme: state.theme, colorMode: state.colorMode });
  useStrudelStore.setState({ cpm: state.cpm, bpc: state.bpc ?? '4' });
  return true;
}
