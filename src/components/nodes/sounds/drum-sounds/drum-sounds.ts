export type DrumSoundsData = { sound?: string };

export const DEFAULT_SOUND = '';

export function generatePattern(data: DrumSoundsData, strudelString: string) {
  if (!data.sound) return strudelString;

  const soundCall = `sound("${data.sound}")`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
}
