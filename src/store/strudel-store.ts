import { create } from 'zustand';
import { StrudelConfig } from '@/types';

type StrudelStore = {
  config: Record<string, StrudelConfig>;
  pattern: string;
  cpm: string;

  updateNode: (nodeId: string, value: Partial<StrudelConfig>) => void;
  removeNodeConfig: (nodeId: string) => void;
  setPattern: (pattern: string) => void;
  setCpm: (cpm: string) => void;
};

export const useStrudelStore = create<StrudelStore>((set) => ({
  config: {},
  pattern: '',
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

      delete newConfig[nodeId];

      return {
        config: newConfig,
      };
    });
  },

  setPattern: (pattern: string) => set({ pattern: pattern }),

  setCpm: (cpm: string) => set({ cpm: cpm }),
}));
