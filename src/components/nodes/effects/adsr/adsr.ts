export type ADSRData = {
  attack?: string;
  decay?: string;
  sustain?: string;
  release?: string;
};

export const PARAMETERS = [
  { key: 'attack', label: 'attack', initial: 0.1, min: 0, max: 2, step: 0.01 },
  { key: 'decay', label: 'decay', initial: 0.1, min: 0, max: 2, step: 0.01 },
  {
    key: 'sustain',
    label: 'sustain',
    initial: 0.7,
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: 'release',
    label: 'release',
    initial: 0.2,
    min: 0,
    max: 2,
    step: 0.01,
  },
] as const;

export function generatePattern(data: ADSRData, pattern: string) {
  const calls = PARAMETERS.flatMap(({ key, initial }) => {
    const value = parseFloat(data[key] || String(initial));
    return value === initial ? [] : [`${key}("${value}")`];
  });
  return [pattern, ...calls].filter(Boolean).join('.');
}
