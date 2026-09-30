import { useCallback, useEffect, useRef } from 'react';
import { createGraphHistory, type GraphSnapshot } from '@/lib/graph-history';
import { useAppStore } from '@/store/app-store';

export function useGraphHistory() {
  const history = useRef<ReturnType<typeof createGraphHistory> | null>(null);
  const restoring = useRef(false);
  const interacting = useRef(false);

  useEffect(() => {
    const { nodes, edges } = useAppStore.getState();
    history.current = createGraphHistory({ nodes, edges });
    let gesture: object | undefined;
    let batch: object | undefined;
    const start = () => {
      gesture = {};
      interacting.current = true;
    };
    const end = () => {
      // Keep React Flow's final position update in the same gesture.
      queueMicrotask(() => {
        gesture = undefined;
        interacting.current = false;
      });
    };
    const unsubscribe = useAppStore.subscribe((state, previous) => {
      if (restoring.current) return;
      const graph = { nodes: state.nodes, edges: state.edges };
      if (state.graphRevision !== previous.graphRevision) {
        history.current?.reset(graph);
        return;
      }
      if (state.nodes === previous.nodes && state.edges === previous.edges) return;
      if (!batch) {
        batch = {};
        queueMicrotask(() => { batch = undefined; });
      }
      history.current?.record(graph, gesture ?? batch);
    });
    window.addEventListener('pointerdown', start, true);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('blur', end);
    return () => {
      unsubscribe();
      window.removeEventListener('pointerdown', start, true);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('blur', end);
    };
  }, []);

  const restore = useCallback((direction: 'undo' | 'redo') => {
    if (interacting.current) return;
    const graph: GraphSnapshot | undefined = history.current?.[direction]();
    if (!graph) return;
    restoring.current = true;
    try {
      useAppStore.setState({
        nodes: graph.nodes.map((node) => ({ ...node, dragging: false, resizing: false })),
        edges: graph.edges,
      });
    } finally {
      restoring.current = false;
    }
  }, []);

  return {
    undo: useCallback(() => restore('undo'), [restore]),
    redo: useCallback(() => restore('redo'), [restore]),
  };
}
