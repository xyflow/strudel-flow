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

import { AppNode } from '@/components/nodes';
import { initialEdges, initialNodes } from '@/data/workflow-data';

export type AppState = {
  nodes: AppNode[];
  edges: Edge[];
  colorMode: ColorMode;
  theme: string;
};

export type AppActions = {
  toggleDarkMode: () => void;
  setColorMode: (colorMode: ColorMode) => void;
  onNodesChange: OnNodesChange<AppNode>;
  setNodes: (nodes: AppNode[]) => void;
  addNode: (node: AppNode) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, updates: Record<string, unknown>) => void;
  setEdges: (edges: Edge[]) => void;
  onConnect: OnConnect;
  setTheme: (theme: string) => void;
  onEdgesChange: OnEdgesChange<Edge>;
};

export type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    colorMode: 'light',
    theme: 'supabase',

    onNodesChange: async (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    },

    setNodes: (nodes) => set({ nodes }),

    addNode: (node) => set({ nodes: [...get().nodes, node] }),

    removeNode: (nodeId) =>
      set({ nodes: get().nodes.filter((node) => node.id !== nodeId) }),

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

    toggleDarkMode: () =>
      set((state) => ({
        colorMode: state.colorMode === 'dark' ? 'light' : 'dark',
      })),

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

useAppStore.subscribe(
  (state) => state.colorMode,
  (colorMode: ColorMode) => {
    document.querySelector('html')?.classList.toggle('dark', colorMode === 'dark');
  }
);
