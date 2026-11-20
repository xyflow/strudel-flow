import { DRUM_CATEGORIES } from '@/data/sounds';

export type DrumSoundsData = { sound?: string };

/** Every sound the Drums node can pick. */
export const DRUM_SOUNDS: readonly string[] = DRUM_CATEGORIES.flatMap(
  (category) => category.options,
);

export const DEFAULT_SOUND = '';

export function generatePattern(data: DrumSoundsData, strudelString: string) {
  if (!data.sound) return strudelString;

  const soundCall = `sound("${data.sound}")`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
}
