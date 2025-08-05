import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ColorMode,
  OnConnect,
  OnEdgesChange,
  OnNodeDrag,
  OnNodesChange,
  XYPosition,
  Edge,
} from '@xyflow/react';

import { AppNode, AppNodeType, createNodeByType } from '@/components/nodes';
import { initialEdges, initialNodes } from '@/data/workflow-data';

export type AppState = {
  nodes: AppNode[];
  edges: Edge[];
  colorMode: ColorMode;
  theme: string;
  draggedNodes: Map<string, AppNode>;
  connectionSites: Map<string, PotentialConnection>;
};

/**
 * You can potentially connect to an already existing edge or to a free handle of a node.
 */
export type PotentialConnection = {
  id: string;
  position: XYPosition;
  type?: 'source' | 'target';
  source?: ConnectionHandle;
  target?: ConnectionHandle;
};
export type ConnectionHandle = {
  node: string;
  handle?: string | null;
};

export type AppActions = {
  toggleDarkMode: () => void;
  setColorMode: (colorMode: ColorMode) => void;
  onNodesChange: OnNodesChange<AppNode>;
  setNodes: (nodes: AppNode[]) => void;
  addNode: (node: AppNode) => void;
  removeNode: (nodeId: string) => void;
  addNodeByType: (type: AppNodeType, position: XYPosition) => null | string;
  updateNodeData: (nodeId: string, updates: Record<string, unknown>) => void;
  getNodes: () => AppNode[];
  setEdges: (edges: Edge[]) => void;
  getEdges: () => Edge[];
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  onConnect: OnConnect;
  setTheme: (theme: string) => void;
  onEdgesChange: OnEdgesChange<Edge>;
  onNodeDragStart: OnNodeDrag<AppNode>;
  onNodeDragStop: OnNodeDrag<AppNode>;
};

export type AppStore = AppState & AppActions;

export const defaultState: AppState = {
  nodes: initialNodes,
  edges: initialEdges,
  colorMode: 'light',
  theme: 'supabase',
  draggedNodes: new Map(),
  connectionSites: new Map(),
};

export const createAppStore = (initialState: AppState = defaultState) => {
  const store = create<AppStore>()(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      onNodesChange: async (changes) => {
        const nextNodes = applyNodeChanges(changes, get().nodes);
        set({ nodes: nextNodes });
      },

      setNodes: (nodes) => set({ nodes }),

      addNode: (node) => {
        const nextNodes = [...get().nodes, node];
        set({ nodes: nextNodes });
      },

      removeNode: (nodeId) =>
        set({ nodes: get().nodes.filter((node) => node.id !== nodeId) }),

      addNodeByType: (type, position) => {
        const newNode = createNodeByType({ type, position });

        if (!newNode) return null;

        get().addNode(newNode);

        return newNode.id;
      },
      getNodes: () => get().nodes,

      setEdges: (edges) => set({ edges }),

      getEdges: () => get().edges,

      addEdge: (edge) => {
        const nextEdges = addEdge(edge, get().edges);
        set({ edges: nextEdges });
      },

      removeEdge: (edgeId) => {
        set({ edges: get().edges.filter((edge) => edge.id !== edgeId) });
      },

      onEdgesChange: (changes) => {
        const nextEdges = applyEdgeChanges(changes, get().edges);
        set({ edges: nextEdges });
      },

      onConnect: (connection) => {
        // Prevent self-connecting nodes
        if (connection.source === connection.target) {
          return;
        }
        // Only include handles if they are not null/undefined
        const { source, target, sourceHandle, targetHandle } = connection;
        const newEdge: Edge = {
          id: `${source}-${target}`,
          source,
          target,
          type: 'default',
          ...(sourceHandle ? { sourceHandle } : {}),
          ...(targetHandle ? { targetHandle } : {}),
        };
        get().addEdge(newEdge);
      },
      setTheme: (theme) => set({ theme }),
      toggleDarkMode: () =>
        set((state) => ({
          colorMode: state.colorMode === 'dark' ? 'light' : 'dark',
        })),
      setColorMode: (colorMode) => set({ colorMode }),

      onNodeDragStart: (_, __, nodes) => {
        set({ draggedNodes: new Map(nodes.map((node) => [node.id, node])) });
      },
      onNodeDragStop: () => {
        set({ draggedNodes: new Map() });
      },
      updateNodeData: (nodeId, updates) => {
        set((state) => {
          const updatedNodes = state.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...updates } }
              : node
          );

          return { nodes: updatedNodes };
        });
      },
    }))
  );

  store.subscribe(
    (state) => state.colorMode,
    async (colorMode: ColorMode) => {
      document
        .querySelector('html')
        ?.classList.toggle('dark', colorMode === 'dark');
    }
  );

  return store;
};
