export type RoomData = {
  room?: string;
  roomsize?: string;
  roomfade?: string;
  roomlp?: string;
  roomdim?: string;
};

export const ROOM_PARAMS = [
  { key: 'room', label: 'room', min: 0, max: 1, step: 0.01, default: 0 },
  { key: 'roomsize', label: 'rsize', min: 0, max: 10, step: 0.1, default: 1 },
  { key: 'roomfade', label: 'rfade', min: 0, max: 10, step: 0.1, default: 0.5 },
  {
    key: 'roomlp',
    label: 'rlp',
    min: 0,
    max: 20000,
    step: 100,
    default: 10000,
  },
  {
    key: 'roomdim',
    label: 'rdim',
    min: 0,
    max: 20000,
    step: 100,
    default: 8000,
  },
] as const;

export function generatePattern(data: RoomData, strudelString: string) {
  const calls = [
    data.room && `room("${data.room}")`,
    data.roomsize && `rsize(${data.roomsize})`,
    data.roomfade && `rfade(${data.roomfade})`,
    data.roomlp && `rlp(${data.roomlp})`,
    data.roomdim && `rdim(${data.roomdim})`,
  ].filter(Boolean);

  if (calls.length === 0) return strudelString;

  const roomCalls = calls.join('.');
  return strudelString ? `${strudelString}.${roomCalls}` : roomCalls;
}
