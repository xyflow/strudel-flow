import { defineCode, soundList } from '@/model-player/spec';
import { DRUM_SOUNDS } from './drum-sounds';

export default defineCode({
  node: 'drum-sounds-node',
  kind: 'sound',
  sounds: DRUM_SOUNDS,
  rules: () => `### Drums: \`.sound("<drum>")\`

Sets the sound of the instruments before it. Drum sounds: ${soundList(DRUM_SOUNDS)}.`,
});
