export type TextureData = { crush?: string; fm?: string; distort?: string };

export const PARAMETERS = [
  {
    key: 'distort',
    label: 'distort',
    initial: 0,
    min: 0,
    max: 3,
    step: 0.01,
  },
  { key: 'crush', label: 'crush', initial: 16, min: 1, max: 16, step: 1 },
  { key: 'fm', label: 'fm', initial: 0, min: 0, max: 10, step: 0.1 },
] as const;

export function generatePattern(data: TextureData, pattern: string) {
  const calls: string[] = [];
  for (const { key, initial } of PARAMETERS) {
    const value = Number(data[key] ?? initial);
    if (Number.isFinite(value) && value !== initial) {
      calls.push(`${key}(${value})`);
    }
  }
  return [pattern, ...calls].filter(Boolean).join('.');
}
