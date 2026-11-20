import { SYNTH_CATEGORIES } from '@/data/sounds';

export type VoiceData = { sound?: string };

export const DEFAULT_SOUND = '';

/** The waveform buttons above the Voice node's sound list. */
export const WAVEFORMS = ['sine', 'triangle', 'sawtooth', 'square'] as const;
export type Waveform = (typeof WAVEFORMS)[number];

/** Every sound the Voice node can pick. */
export const VOICE_SOUNDS: readonly string[] = [
  ...new Set([
    ...WAVEFORMS,
    ...SYNTH_CATEGORIES.flatMap((category) => category.options),
  ]),
];

export function generatePattern(data: VoiceData, strudelString: string) {
  if (!data.sound) return strudelString;

  const soundCall = `sound("${data.sound}")`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
}
