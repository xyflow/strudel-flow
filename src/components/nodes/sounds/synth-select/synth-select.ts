export type VoiceData = { sound?: string; signal?: string; soundCall?: string };

export const DEFAULT_SOUND = '';

export function generatePattern(data: VoiceData, strudelString: string) {
  if (data.signal) return data.signal;
  if (!data.sound) return strudelString;

  const soundCall = `${data.soundCall === 's' ? 's' : 'sound'}(${JSON.stringify(data.sound)})`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
}
