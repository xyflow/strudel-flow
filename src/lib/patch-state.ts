import { useAppStore } from '@/store/app-store';
import { nodeTypes, type AppNode } from '@/components/nodes/registry';
import type { ProjectState } from './project-state';
import { getMe, getView } from '@/collab/session';
import { adoptGraph, ownedBy, visibleGraph } from '@/collab/ownership';

export function capturePatch(): ProjectState {
  const { name, theme, colorMode, cpm, bpc } = useAppStore.getState();
  // In a jam room, an export contains only what you can see.
  const me = getMe();
  const all = useAppStore.getState();
  const { nodes, edges } = me
    ? visibleGraph(all.nodes, all.edges, me, getView())
    : all;
  return {
    name: name.trim() || 'Untitled patch',
    nodes: nodes.map(({ id, type, position, data }) => {
      // Room ownership is meaningless outside the room.
      const rest = { ...data };
      delete rest.owner;
      return { id, type, position, data: rest };
    }),
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
  const me = getMe();
  if (me) {
    applyPatchToMyPart(state, me);
    return true;
  }
  useAppStore.setState({
    graphRevision: useAppStore.getState().graphRevision + 1,
    name: state.name ?? 'Untitled patch',
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

/**
 * In a jam room, a loaded patch replaces only your own part. Its nodes get
 * fresh ids (so two players can load the same patch) and your ownership.
 * Tempo, play state and the patch name are shared, so they stay as they are.
 */
function applyPatchToMyPart(state: ProjectState, me: string) {
  const current = useAppStore.getState();
  const others = current.nodes.filter((node) => !ownedBy(node, me));
  const otherIds = new Set(others.map((node) => node.id));
  const mine = adoptGraph(state.nodes as AppNode[], state.edges, me);
  useAppStore.setState({
    graphRevision: current.graphRevision + 1,
    nodes: [...others, ...mine.nodes],
    edges: [
      ...current.edges.filter(
        (edge) => otherIds.has(edge.source) && otherIds.has(edge.target),
      ),
      ...mine.edges,
    ],
    theme: state.theme,
    colorMode: state.colorMode,
    error: null,
  });
}
