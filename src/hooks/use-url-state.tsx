/**
 * Hook to load workflow state from URL parameters
 */
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

      // Restore theme settings FIRST to ensure CSS loads before nodes render
      if (urlState.theme) {
        setTheme(urlState.theme);
      }
      if (urlState.colorMode) {
        setColorMode(urlState.colorMode);
      }

      // Small delay to ensure theme CSS loads on mobile before nodes render
      setTimeout(() => {
        // Set all nodes to paused state on load
        const nodes = (urlState.nodes as AppNode[]).map((node) => ({
          ...node,
          data: {
            ...node.data,
            state: 'paused' as const,
          },
        }));

        setNodes(nodes);
        setEdges(urlState.edges);
      }, 50); // Small delay for mobile CSS loading
    }
  }, [setNodes, setEdges, setTheme, setColorMode]);
}
