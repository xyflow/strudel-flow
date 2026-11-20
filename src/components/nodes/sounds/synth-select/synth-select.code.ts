import { defineCode, soundList } from '@/model-player/spec';
import { VOICE_SOUNDS } from './synth-select';

export default defineCode({
  node: 'synth-select-node',
  kind: 'sound',
  sounds: VOICE_SOUNDS,
  rules: () => `### Voice: \`.sound("<sound>")\`

Sets the sound of the instruments before it: a waveform or a sample set. Without one, Pads and Chords play a triangle wave. Voice sounds: ${soundList(VOICE_SOUNDS)}.`,
});
