import type {
  CellState,
  ModifierGroups,
} from '../../shared/modifier-options';

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

export const DEFAULT_STEPS = 8;

/** What the Beats node's controls allow. */
export const STEPS = { min: 1, max: 32 } as const;
export const STEP_MODIFIERS: ModifierGroups = {
  Speed: [
    { value: '*2', label: '*2' },
    { value: '*3', label: '*3' },
    { value: '*4', label: '*4' },
  ],
  Elongate: [
    { value: '@2', label: '@2' },
    { value: '@3', label: '@3' },
    { value: '@4', label: '@4' },
  ],
};

export function generatePattern(data: BeatMachineData, strudelString: string) {
  const modifiersEnabled =
    typeof data.modifiersEnabled === 'boolean' ? data.modifiersEnabled : false;
  const steps = typeof data.steps === 'number' ? data.steps : DEFAULT_STEPS;
  const rows = data.rows || createDefaultRows(steps);
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
