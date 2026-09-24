export type TimeData = {
  rate?: string;
  direction?: 'forward' | 'reverse' | 'pingpong';
  lateOffset?: string;
};

export const DEFAULTS = {
  rate: 1,
  lateOffset: 0,
  direction: 'forward',
} as const;

export const PARAMETERS = [
  {
    key: 'rate',
    label: 'fast',
    initial: DEFAULTS.rate,
    min: 0.125,
    max: 8,
    step: 0.125,
    unit: '×',
  },
  {
    key: 'lateOffset',
    label: 'late',
    initial: DEFAULTS.lateOffset,
    min: 0,
    max: 1,
    step: 0.01,
  },
] as const;

export function generatePattern(data: TimeData, pattern: string) {
  const calls: string[] = [];
  const fast = Number(data.rate ?? DEFAULTS.rate);
  if (Number.isFinite(fast) && fast !== 1) calls.push(`fast(${fast})`);
  if (data.direction === 'reverse') calls.push('rev()');
  if (data.direction === 'pingpong') calls.push('palindrome()');
  const late = Number(data.lateOffset ?? DEFAULTS.lateOffset);
  if (Number.isFinite(late) && late !== 0) calls.push(`late(${late})`);
  return [pattern, ...calls].filter(Boolean).join('.');
}
