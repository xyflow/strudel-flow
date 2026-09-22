import { usePlaybackStore } from '@/store/playback-store';

export function useGlobalPlayback() {
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const globalPlay = usePlaybackStore((state) => state.play);
  const globalPause = usePlaybackStore((state) => state.pause);
  const toggleGlobalPlayback = usePlaybackStore((state) => state.toggle);
  return { isGloballyPaused: !isPlaying, globalPlay, globalPause, toggleGlobalPlayback };
}
