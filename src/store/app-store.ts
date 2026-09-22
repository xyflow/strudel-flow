import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ColorMode,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Edge,
} from '@xyflow/react';

import type { AppNode } from '@/components/nodes';
import { initialEdges, initialNodes } from '@/data/workflow-data';
import { themeNames } from '@/data/css/themes';
import { findConnectedComponents } from '@/lib/graph-utils';

export type AppState = {
  nodes: AppNode[];
  edges: Edge[];
  colorMode: ColorMode;
  theme: string;
};

export type AppActions = {
  setColorMode: (colorMode: ColorMode) => void;
  onNodesChange: OnNodesChange<AppNode>;
  setNodes: (nodes: AppNode[]) => void;
  addNode: (node: AppNode) => void;
  removeNode: (nodeId: string) => void;
  setGroupState: (nodeId: string, state: 'running' | 'paused') => void;
  updateNodeData: (nodeId: string, updates: Record<string, unknown>) => void;
  setEdges: (edges: Edge[]) => void;
  onConnect: OnConnect;
  setTheme: (theme: string) => void;
  onEdgesChange: OnEdgesChange<Edge>;
};

export type AppStore = AppState & AppActions;

const appearanceStorageKey = 'strudel-flow-appearance';
const initialAppearance: Pick<AppState, 'theme' | 'colorMode'> = {
  theme: 'mono',
  colorMode: 'dark',
};
try {
  const saved = JSON.parse(localStorage.getItem(appearanceStorageKey) ?? 'null');
  if (saved && typeof saved === 'object') {
    if (themeNames.includes(saved.theme)) initialAppearance.theme = saved.theme;
    if (saved.colorMode === 'light' || saved.colorMode === 'dark' || saved.colorMode === 'system') {
      initialAppearance.colorMode = saved.colorMode;
    }
  }
} catch {
  // Use the defaults when browser storage is unavailable or invalid.
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    ...initialAppearance,

    onNodesChange: async (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    },

    setNodes: (nodes) => set({ nodes }),

    addNode: (node) => set({ nodes: [...get().nodes, node] }),

    removeNode: (nodeId) =>
      set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      })),

    setGroupState: (nodeId, playbackState) => set((state) => {
      const group = new Set(findConnectedComponents(state.nodes, state.edges)
        .find((ids) => ids.includes(nodeId)) ?? [nodeId]);
      return { nodes: state.nodes.map((node) => group.has(node.id)
        ? { ...node, data: { ...node.data, state: playbackState } }
        : node) };
    }),

    setEdges: (edges) => set({ edges }),

    onEdgesChange: (changes) =>
      set({ edges: applyEdgeChanges(changes, get().edges) }),

    onConnect: (connection) => {
      if (connection.source === connection.target) return;
      const { source, target, sourceHandle, targetHandle } = connection;
      set({
        edges: addEdge(
          {
            id: `${source}-${target}`,
            source,
            target,
            type: 'default',
            ...(sourceHandle ? { sourceHandle } : {}),
            ...(targetHandle ? { targetHandle } : {}),
          },
          get().edges
        ),
      });
    },

    setTheme: (theme) => set({ theme }),

    setColorMode: (colorMode) => set({ colorMode }),

    updateNodeData: (nodeId, updates) =>
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        ),
      })),
  }))
);

const systemAppearance = window.matchMedia('(prefers-color-scheme: dark)');
function applyColorMode() {
  const { colorMode } = useAppStore.getState();
  document.documentElement.classList.toggle(
    'dark', colorMode === 'dark' || (colorMode === 'system' && systemAppearance.matches),
  );
}
useAppStore.subscribe((state) => state.colorMode, applyColorMode, { fireImmediately: true });
systemAppearance.addEventListener('change', applyColorMode);
if (import.meta.hot) {
  import.meta.hot.dispose(() => systemAppearance.removeEventListener('change', applyColorMode));
}

useAppStore.subscribe(
  (state) => [state.theme, state.colorMode] as const,
  ([theme, colorMode]) => {
    try {
      localStorage.setItem(appearanceStorageKey, JSON.stringify({ theme, colorMode }));
    } catch {
      // Appearance changes still work when storage is disabled.
    }
  },
  { equalityFn: (previous, next) => previous[0] === next[0] && previous[1] === next[1] },
);
