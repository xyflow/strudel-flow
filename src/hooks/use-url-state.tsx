import { useEffect } from 'react';
import { useAppStore } from '@/store/app-context';
import { loadStateFromUrl } from '@/lib/state-serialization';
import { AppNode } from '@/components/nodes';

/**
 * Hook to load state from URL parameters on app startup
 */
export function useUrlStateLoader() {
  const { setNodes, setEdges } = useAppStore((state) => state);

  useEffect(() => {
    const urlState = loadStateFromUrl();

    if (urlState) {
      console.log('Loading state from URL:', urlState);
      // Cast the nodes to AppNode type since they come from JSON deserialization
      setNodes(urlState.nodes as AppNode[]);
      setEdges(urlState.edges);
    }
  }, []); // Only run once on mount
}
