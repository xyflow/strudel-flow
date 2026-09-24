import { useCallback, useRef } from 'react';
import { copySelectedNodes, pasteNodes } from '@/lib/node-clipboard';
import type { GraphSnapshot } from '@/lib/graph-history';
import { useAppStore } from '@/store/app-store';

export function useNodeClipboard() {
  const clipboard = useRef<GraphSnapshot | null>(null);
  const pasteCount = useRef(0);
  const copy = useCallback(() => {
    const selection = copySelectedNodes(useAppStore.getState());
    if (!selection) return false;
    clipboard.current = selection;
    pasteCount.current = 0;
    return true;
  }, []);
  const cut = useCallback(() => {
    if (!copy()) return false;
    const ids = new Set(clipboard.current!.nodes.map((node) => node.id));
    useAppStore.setState((state) => ({
      nodes: state.nodes.filter((node) => !ids.has(node.id)),
      edges: state.edges.filter(
        (edge) => !ids.has(edge.source) && !ids.has(edge.target),
      ),
    }));
    return true;
  }, [copy]);
  const paste = useCallback(() => {
    if (!clipboard.current) return false;
    pasteCount.current += 1;
    useAppStore.setState(
      pasteNodes(useAppStore.getState(), clipboard.current, pasteCount.current * 40),
    );
    return true;
  }, []);
  return { copy, cut, paste };
}
