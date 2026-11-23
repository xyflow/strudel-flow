import { create } from 'zustand';
import {
  addEdge,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type Edge,
} from '@xyflow/react';

import type { AppNode } from '@/components/nodes/registry';
import { initialEdges, initialNodes } from '@/data/workflow-data';
import { findConnectedComponents } from '@/lib/graph-utils';

type AppState = {
  name: string;
  author: string;
  description: string;
  graphRevision: number;
  nodes: AppNode[];
  edges: Edge[];
  theme: string;
  cpm: string;
  bpc: string;
  pattern: string;
  isPlaying: boolean;
  error: string | null;
};

type AppActions = {
  setCpm: (cpm: string) => void;
  setBpc: (bpc: string) => void;
  setPattern: (pattern: string) => void;
  toggle: () => void;
  setError: (error: string | null) => void;
  onNodesChange: OnNodesChange<AppNode>;
  removeNode: (nodeId: string) => void;
  setGroupState: (nodeId: string, state: 'running' | 'paused') => void;
  updateNodeData: (nodeId: string, updates: Record<string, unknown>) => void;
  onConnect: OnConnect;
  setTheme: (theme: string) => void;
  onEdgesChange: OnEdgesChange<Edge>;
};

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()((set, get) => ({
  graphRevision: 0,
  name: 'Untitled patch',
  author: '',
  description: '',
  nodes: initialNodes,
  edges: initialEdges,
  theme: 'caffeine',
  cpm: '120',
  bpc: '4',
  pattern: '',
  isPlaying: false,
  error: null,
  setCpm: (cpm) => set({ cpm }),
  setBpc: (bpc) => set({ bpc }),
  setPattern: (pattern) => set({ pattern }),
  toggle: () =>
    set((state) => ({ isPlaying: !state.isPlaying, error: null })),
  setError: (error) => set({ error, ...(error ? { isPlaying: false } : {}) }),

  onNodesChange: (changes) =>
    set((state) => ({ nodes: changes.applyTo(state.nodes) })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      ),
    })),

  setGroupState: (nodeId, playbackState) =>
    set((state) => {
      const group = new Set(
        findConnectedComponents(state.nodes, state.edges).find((ids) =>
          ids.includes(nodeId),
        ) ?? [nodeId],
      );
      return {
        nodes: state.nodes.map((node) =>
          group.has(node.id)
            ? { ...node, data: { ...node.data, state: playbackState } }
            : node,
        ),
      };
    }),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: changes.applyTo(state.edges) })),

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
        get().edges,
      ),
    });
  },

  setTheme: (theme) => set({ theme }),

  updateNodeData: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node,
      ),
    })),
}));
