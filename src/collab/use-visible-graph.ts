import { useMemo } from 'react';
import { useAppStore } from '@/store/app-store';
import { useCollabStore } from './session';
import { visibleGraph } from './ownership';

/**
 * The nodes and edges this player may see. Audio is still compiled from the
 * whole graph; only rendering, code views and exports go through this.
 */
export function useVisibleGraph() {
  const nodes = useAppStore((state) => state.nodes);
  const edges = useAppStore((state) => state.edges);
  const me = useCollabStore((state) => (state.room ? state.me?.id : undefined));
  const view = useCollabStore((state) => state.view);
  return useMemo(
    () => (me ? visibleGraph(nodes, edges, me, view) : { nodes, edges }),
    [nodes, edges, me, view],
  );
}
