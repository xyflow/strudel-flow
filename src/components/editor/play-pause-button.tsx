import { Play, Pause } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { ControlButton } from './control-button';

export function PlayPauseButton() {
  const isPlaying = useAppStore(state => state.isPlaying);
  const toggle = useAppStore(state => state.toggle);
  return (
    <ControlButton
      onClick={toggle}
      title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      aria-pressed={isPlaying}
      className="size-11 rounded-md bg-primary text-primary-foreground  hover:bg-primary/85 hover:text-primary-foreground"
    >
      {!isPlaying ? <Play className="ml-0.5 size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
    </ControlButton>
  );
}
