import type { CellState } from '../modifiers';

export type BeatMachineData = {
  steps?: number;
  rows?: BeatMachineRow[];
  modifiersEnabled?: boolean;
};

export interface BeatMachineRow {
  instrument: string;
  pattern: boolean[];
  modifiers?: { [stepIdx: number]: CellState };
}

export function createDefaultRows(steps: number): BeatMachineRow[] {
  return ['bd', 'sd', 'hh'].map((instrument) => ({
    instrument,
    pattern: Array(steps).fill(false),
    modifiers: {},
  }));
}

function applyStepModifier(pattern: string, modifier?: CellState): string {
  if (modifier && modifier.type === 'modifier') {
    if (modifier.value === 'rarely') {
      return `rarely(${pattern})`;
    }
    return `${pattern}${modifier.value}`;
  }
  return pattern;
}

const patternToString = (
  pattern: boolean[],
  modifiers?: { [stepIdx: number]: CellState },
) => {
  return pattern
    .map((active, idx) => {
      const base = active ? '1' : '~';
      return applyStepModifier(base, modifiers?.[idx]);
    })
    .join(' ');
};

export const DEFAULT_STEPS = 16;

export function generatePattern(data: BeatMachineData, strudelString: string) {
  const modifiersEnabled =
    typeof data.modifiersEnabled === 'boolean' ? data.modifiersEnabled : false;
  const steps = typeof data.steps === 'number' ? data.steps : DEFAULT_STEPS;
  const rows = data.rows || createDefaultRows(steps);

  // If modifiers are disabled, ignore them in output
  const patterns = rows
    .filter((row) => row.pattern.some(Boolean))
    .map(
      (row) =>
        `sound("${row.instrument}").struct("${patternToString(row.pattern, modifiersEnabled ? (row.modifiers ?? {}) : {})}")`,
    );

  if (patterns.length === 0) {
    return strudelString;
  }

  const beatCall =
    patterns.length === 1 ? patterns[0] : `stack(${patterns.join(', ')})`;

  return strudelString ? `${strudelString}.stack(${beatCall})` : beatCall;
}
