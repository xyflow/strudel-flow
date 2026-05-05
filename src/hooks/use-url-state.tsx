/**
 * Hook to load workflow state from URL parameters
 */
import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { loadFromUrl } from '@/lib/project-state';
import { AppNode } from '@/components/nodes';
import { useStrudelStore } from '@/store/strudel-store';

/**
 * Hook to load state from URL parameters on app startup
 */
export function useUrlStateLoader() {
  const { setNodes, setEdges, setTheme, setColorMode } = useAppStore(
    (state) => state
  );
  const setCpm = useStrudelStore((state) => state.setCpm);
  const setBpc = useStrudelStore((state) => state.setBpc);

  useEffect(() => {
    const urlState = loadFromUrl();

    if (urlState) {
      // Restore theme settings FIRST to ensure CSS loads before nodes render
      if (urlState.theme) {
        setTheme(urlState.theme);
      }
      if (urlState.colorMode) {
        setColorMode(urlState.colorMode);
      }
      if (urlState.cpm) {
        setCpm(urlState.cpm);
      }
      if (urlState.bpc) {
        setBpc(urlState.bpc);
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
  }, [setNodes, setEdges, setTheme, setColorMode, setCpm, setBpc]);
}
