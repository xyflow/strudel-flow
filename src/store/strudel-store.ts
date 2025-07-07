import { create } from 'zustand';
import { StrudelConfig } from '@/types';
import { PATTERN_BUILDERS } from '@/lib/pattern-builders';

type StrudelStore = {
  config: Record<string, StrudelConfig>;
  pattern: string;
  mutedNodes: Record<string, StrudelConfig>;
  pausedGroups: Record<string, Record<string, StrudelConfig>>;
  cpm: string;

  updateNode: (nodeId: string, value: Partial<StrudelConfig>) => void;
  removeNodeConfig: (nodeId: string) => void;
  setPattern: (pattern: string) => void;
  buildPattern: (nodeId: string) => string;
  muteNode: (nodeId: string) => void;
  unmuteNode: (nodeId: string) => void;
  isNodeMuted: (nodeId: string) => boolean;
  pauseGroup: (groupId: string, nodeIds: string[]) => void;
  unpauseGroup: (groupId: string) => void;
  isGroupPaused: (groupId: string) => boolean;
  setCpm: (cpm: string) => void;
};

export const useStrudelStore = create<StrudelStore>((set, get) => ({
  config: {},
  pattern: '',
  mutedNodes: {},
  pausedGroups: {},
  cpm: '60',

  updateNode: (nodeId: string, value: Partial<StrudelConfig>) => {
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
      const newPausedGroups = { ...state.pausedGroups };

      delete newConfig[nodeId];
      delete newMutedNodes[nodeId];

      // Remove node from any paused groups
      Object.keys(newPausedGroups).forEach((groupId) => {
        if (newPausedGroups[groupId][nodeId]) {
          delete newPausedGroups[groupId][nodeId];
          // If group is now empty, remove it
          if (Object.keys(newPausedGroups[groupId]).length === 0) {
            delete newPausedGroups[groupId];
          }
        }
      });

      return {
        config: newConfig,
        mutedNodes: newMutedNodes,
        pausedGroups: newPausedGroups,
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

  pauseGroup: (groupId: string, nodeIds: string[]) => {
    const state = get();
    const groupConfigs: Record<string, StrudelConfig> = {};

    // Store all node configs for this group
    nodeIds.forEach((nodeId) => {
      const nodeConfig = state.config[nodeId];
      if (nodeConfig && Object.keys(nodeConfig).length > 0) {
        groupConfigs[nodeId] = nodeConfig;
      }
    });

    if (Object.keys(groupConfigs).length > 0) {
      set((state) => ({
        pausedGroups: {
          ...state.pausedGroups,
          [groupId]: groupConfigs,
        },
        config: {
          ...state.config,
          // Clear configs for all nodes in the group
          ...nodeIds.reduce((acc, nodeId) => {
            acc[nodeId] = {};
            return acc;
          }, {} as Record<string, StrudelConfig>),
        },
      }));
    }
  },

  unpauseGroup: (groupId: string) => {
    const state = get();
    const groupConfigs = state.pausedGroups[groupId];

    if (groupConfigs) {
      set((state) => {
        const newPausedGroups = { ...state.pausedGroups };
        delete newPausedGroups[groupId];

        return {
          pausedGroups: newPausedGroups,
          config: {
            ...state.config,
            // Restore configs for all nodes in the group
            ...groupConfigs,
          },
        };
      });
    }
  },

  isGroupPaused: (groupId: string) => {
    return !!get().pausedGroups[groupId];
  },

  buildPattern: (nodeId: string) => {
    const config = get().config[nodeId] || {};

    const patternParts = Object.keys(PATTERN_BUILDERS)
      .map((key) => {
        const value = config[key as keyof StrudelConfig];

        if (key in PATTERN_BUILDERS && value !== undefined) {
          const builder = PATTERN_BUILDERS[key];
          return builder(value);
        }
        return '';
      })
      .filter(Boolean);

    // Return "no pattern" if patternParts is empty
    if (patternParts.length === 0) {
      return 'no pattern';
    }

    return `$: ${patternParts.join('')}`;
  },
}));
