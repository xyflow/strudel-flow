import { create } from 'zustand';

type StrudelStore = {
  pattern: string;
  cpm: string;
  setPattern: (pattern: string) => void;
  setCpm: (cpm: string) => void;
};

export const useStrudelStore = create<StrudelStore>((set) => ({
  pattern: '',
  cpm: '60',
  setPattern: (pattern: string) => set({ pattern: pattern }),
  setCpm: (cpm: string) => set({ cpm: cpm }),
}));
