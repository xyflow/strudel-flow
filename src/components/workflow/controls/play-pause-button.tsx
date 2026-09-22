import { Play, Pause } from 'lucide-react';
import { useGlobalPlayback } from '@/hooks/use-global-playback';
import { ControlButton } from './control-button';

export function PlayPauseButton() {
  const { isGloballyPaused, toggleGlobalPlayback } = useGlobalPlayback();
  return (
    <ControlButton
      onClick={toggleGlobalPlayback}
      title={isGloballyPaused ? 'Play (Space)' : 'Pause (Space)'}
      aria-pressed={!isGloballyPaused}
      className="size-11 rounded-md bg-primary text-primary-foreground  hover:bg-primary/85 hover:text-primary-foreground"
    >
      {isGloballyPaused ? <Play className="ml-0.5 size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
    </ControlButton>
  );
}
