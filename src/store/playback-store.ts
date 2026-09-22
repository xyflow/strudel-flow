import { create } from 'zustand';

type PlaybackState = {
  isPlaying: boolean;
  error: string | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setError: (error: string | null) => void;
};

export const usePlaybackStore = create<PlaybackState>((set) => ({
  isPlaying: false,
  error: null,
  play: () => set({ isPlaying: true, error: null }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying, error: null })),
  setError: (error) => set({ error, ...(error ? { isPlaying: false } : {}) }),
}));
