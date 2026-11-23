import { serializeLiteral } from '@/lib/strudel-calls';

export type VoiceData = { sound?: string; signal?: string; soundCall?: string; rawSound?: boolean };

export const DEFAULT_SOUND = '';

export function generatePattern(data: VoiceData, strudelString: string) {
  if (data.signal) return data.signal;
  if (!data.sound) return strudelString;

  const soundCall = `${data.soundCall === 's' ? 's' : 'sound'}(${data.rawSound ? serializeLiteral(data.sound) : JSON.stringify(data.sound)})`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
}
