export type FilterData = { lpf?: string };

export const DEFAULT_FILTER = '1000 1';

export function generatePattern(data: FilterData, strudelString: string) {
  const [frequency = 1000, resonance = 1] = (data.lpf || DEFAULT_FILTER)
    .split(' ')
    .map(Number);
  const filter = `lpf(${frequency}).lpq(${resonance})`;
  return strudelString ? `${strudelString}.${filter}` : filter;
}
