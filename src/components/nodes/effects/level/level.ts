export type LevelData = { gain?: string; pan?: string; postgain?: string };

export const PARAMETERS = [
  {
    key: 'gain',
    label: 'gain',
    initial: 1,
    min: 0,
    max: 2,
    step: 0.01,
    unit: '×',
  },
  { key: 'pan', label: 'pan', initial: 0.5, min: 0, max: 1, step: 0.01 },
  {
    key: 'postgain',
    label: 'postgain',
    initial: 1,
    min: 0,
    max: 2,
    step: 0.01,
    unit: '×',
  },
] as const;

export function generatePattern(data: LevelData, pattern: string) {
  const calls: string[] = [];
  for (const { key, initial } of PARAMETERS) {
    const value = Number(data[key] ?? initial);
    if (Number.isFinite(value) && value !== initial) {
      calls.push(`${key}(${value})`);
    }
  }
  return [pattern, ...calls].filter(Boolean).join('.');
}
