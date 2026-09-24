export type VoiceData = { sound?: string };

export const DEFAULT_SOUND = '';

export function generatePattern(data: VoiceData, strudelString: string) {
  if (!data.sound) return strudelString;

  const soundCall = `sound("${data.sound}")`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
}
