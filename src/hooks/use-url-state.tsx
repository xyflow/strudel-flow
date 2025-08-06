// Pattern A: Simplified URL state loading - all data is in node.data
import { useEffect } from 'react';
import { useAppStore } from '@/store/app-context';
import { loadStateFromUrl } from '@/lib/state-serialization';
import { AppNode } from '@/components/nodes';

/**
 * Hook to load state from URL parameters on app startup
 */
export function useUrlStateLoader() {
  const { setNodes, setEdges, setTheme, setColorMode } = useAppStore(
    (state) => state
  );

  useEffect(() => {
    const urlState = loadStateFromUrl();

    if (urlState) {
      console.log('🔄 Loading state from URL:', {
        theme: urlState.theme,
        colorMode: urlState.colorMode,
        nodeCount: urlState.nodes.length,
        edgeCount: urlState.edges.length,
      });

      // Cast the nodes to AppNode type and set all nodes to paused state
      const nodes = (urlState.nodes as AppNode[]).map((node) => ({
        ...node,
        data: {
          ...node.data,
          state: 'paused' as const,
        },
      }));
      const edges = urlState.edges;

      // Restore nodes and edges (Pattern A: all data is in node.data automatically)
      setNodes(nodes);
      setEdges(edges);

      // Restore theme settings
      if (urlState.theme) {
        setTheme(urlState.theme);
      }
      if (urlState.colorMode) {
        setColorMode(urlState.colorMode);
      }
    }
  }, [setNodes, setEdges, setTheme, setColorMode]);
}
