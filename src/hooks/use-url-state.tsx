import { useEffect } from 'react';
import { useAppStore } from '@/store/app-context';
import { useStrudelStore } from '@/store/strudel-store';
import { loadStateFromUrl } from '@/lib/state-serialization';
import { AppNode } from '@/components/nodes';
import { findConnectedComponents } from '@/lib/graph-utils';
import { StrudelConfig } from '@/types';

/**
 * Hook to load state from URL parameters on app startup
 */
export function useUrlStateLoader() {
  const { setNodes, setEdges, setTheme, setColorMode } = useAppStore(
    (state) => state
  );
  const strudelStore = useStrudelStore();

  useEffect(() => {
    const urlState = loadStateFromUrl();

    if (urlState) {
      console.log('🔄 Loading state from URL:', {
        theme: urlState.theme,
        colorMode: urlState.colorMode,
        nodeCount: urlState.nodes.length,
        edgeCount: urlState.edges.length,
      });

      // Cast the nodes to AppNode type since they come from JSON deserialization
      const nodes = urlState.nodes as AppNode[];
      const edges = urlState.edges;

      // Restore nodes and edges first (this will trigger PadNode components to restore their internal states)
      setNodes(nodes);
      setEdges(edges);

      // Restore theme settings
      if (urlState.theme) {
        setTheme(urlState.theme);
      }
      if (urlState.colorMode) {
        setColorMode(urlState.colorMode);
      }

      // Restore Strudel configuration and set everything to paused groups
      if (urlState.strudelConfig) {
        // Clear existing config first
        Object.keys(strudelStore.config).forEach((nodeId) => {
          strudelStore.removeNodeConfig(nodeId);
        });

        // Find connected components and restore config directly into paused groups
        setTimeout(() => {
          const connectedComponents = findConnectedComponents(nodes, edges);

          connectedComponents.forEach((component) => {
            if (component.length > 0) {
              const groupId = component.sort().join('-');

              // Create the group config from the restored Strudel config
              const groupConfigs: Record<string, StrudelConfig> = {};
              component.forEach((nodeId) => {
                const nodeConfig = urlState.strudelConfig[nodeId];
                if (nodeConfig && Object.keys(nodeConfig).length > 0) {
                  groupConfigs[nodeId] = nodeConfig;
                }
              });

              // First restore the config to active state, then pause (which moves it to paused state)
              if (Object.keys(groupConfigs).length > 0) {
                // Restore configs to active state
                Object.entries(groupConfigs).forEach(([nodeId, config]) => {
                  strudelStore.updateNode(nodeId, config);
                });

                // Now pause the group (this moves the active config to paused state)
                strudelStore.pauseGroup(groupId, component);
              }
            }
          });
        }, 100);
      }
    }
  }, [setNodes, setEdges, setTheme, setColorMode, strudelStore]);
}
