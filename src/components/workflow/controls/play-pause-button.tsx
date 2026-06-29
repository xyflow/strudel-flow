import { Play, Pause } from 'lucide-react';

import { useGlobalPlayback } from '@/hooks/use-global-playback';

import { ControlButton } from './control-button';

export function PlayPauseButton() {
  const { isGloballyPaused, toggleGlobalPlayback } = useGlobalPlayback();

  return (
    <ControlButton
      active={isGloballyPaused}
      onClick={toggleGlobalPlayback}
      title={`${isGloballyPaused ? 'Resume' : 'Pause'} All (Spacebar)`}
    >
      {isGloballyPaused ? (
        <Play className="size-5" />
      ) : (
        <Pause className="size-5" />
      )}
    </ControlButton>
  );
}
