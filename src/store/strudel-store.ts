import { create } from 'zustand';
import { StrudelConfig } from '@/types';

type StrudelStore = {
  config: Record<string, StrudelConfig>;
  pattern: string;
  mutedNodes: Record<string, StrudelConfig>;
  cpm: string;

  updateNode: (nodeId: string, value: Partial<StrudelConfig>) => void;
  removeNodeConfig: (nodeId: string) => void;
  setPattern: (pattern: string) => void;
  muteNode: (nodeId: string) => void;
  unmuteNode: (nodeId: string) => void;
  isNodeMuted: (nodeId: string) => boolean;
  setCpm: (cpm: string) => void;
};

export const useStrudelStore = create<StrudelStore>((set, get) => ({
  config: {},
  pattern: '',
  mutedNodes: {},
  cpm: '60',

  updateNode: (nodeId: string, value: Partial<StrudelConfig>) => {
    const state = get();

    // Don't update if node is muted
    if (state.mutedNodes[nodeId]) {
      return;
    }

    // Don't update if node is in a paused group
    // const isInPausedGroup = Object.values(state.pausedGroups).some((group) => {
    //   return group[nodeId] !== undefined;
    // });
    // if (isInPausedGroup) {
    //   return;
    // }

    set((state) => ({
      config: {
        ...state.config,
        [nodeId]: {
          ...state.config[nodeId],
          ...value,
        },
      },
    }));
  },

  removeNodeConfig: (nodeId: string) => {
    set((state) => {
      const newConfig = { ...state.config };
      const newMutedNodes = { ...state.mutedNodes };

      delete newConfig[nodeId];
      delete newMutedNodes[nodeId];

      return {
        config: newConfig,
        mutedNodes: newMutedNodes,
      };
    });
  },

  setPattern: (pattern: string) => set({ pattern: pattern }),

  setCpm: (cpm: string) => set({ cpm: cpm }),

  muteNode: (nodeId: string) => {
    const state = get();
    const nodeConfig = state.config[nodeId];

    if (nodeConfig && !state.mutedNodes[nodeId]) {
      set((state) => ({
        mutedNodes: {
          ...state.mutedNodes,
          [nodeId]: nodeConfig,
        },
        config: {
          ...state.config,
          [nodeId]: {}, // Clear the config to effectively mute
        },
      }));
    }
  },

  unmuteNode: (nodeId: string) => {
    const state = get();
    const mutedConfig = state.mutedNodes[nodeId];

    if (mutedConfig) {
      set((state) => {
        const newMutedNodes = { ...state.mutedNodes };
        delete newMutedNodes[nodeId];

        return {
          mutedNodes: newMutedNodes,
          config: {
            ...state.config,
            [nodeId]: mutedConfig, // Restore the original config
          },
        };
      });
    }
  },

  isNodeMuted: (nodeId: string) => {
    return !!get().mutedNodes[nodeId];
  },
}));
