import type { CellState } from '../../shared/modifiers';

export type PadData = {
  steps?: number;
  mode?: 'arp' | 'chord';
  octave?: number;
  selectedKey?: string;
  selectedScaleType?: string;
  grid?: boolean[][];
  columnModifiers?: Record<number, CellState>;
  selectedButtons?: string[];
  noteGroups?: Record<number, number[][]>;
};

export const NOTES = ['0', '1', '2', '3', '4', '5', '6', '7'];

function applyColumnModifier(pattern: string, modifier: CellState): string {
  return modifier.type === 'modifier' ? `${pattern}${modifier.value}` : pattern;
}

export const DEFAULTS = {
  steps: 5,
  mode: 'arp',
  octave: 3,
  selectedKey: 'C',
  selectedScaleType: 'major',
} as const;
export const createDefaultGrid = (): boolean[][] =>
  Array.from({ length: 16 }, () => Array(8).fill(false));

export function generatePattern(data: PadData, strudelString: string) {
  const grid = data.grid || createDefaultGrid();
  const columnModifiers = data.columnModifiers || {};
  const noteGroups = data.noteGroups || {};

  const generateStepPattern = (row: boolean[], stepIdx: number) => {
    const individualNotes = row
      .map((on, noteIdx) => (on ? NOTES[noteIdx] : null))
      .filter(Boolean);

    const stepGroups = noteGroups[stepIdx] || [];
    const groupPatterns = stepGroups.map(
      (group) => `<${group.map((noteIdx) => NOTES[noteIdx]).join(' ')}>`,
    );

    const allPatterns = [...individualNotes, ...groupPatterns];
    if (allPatterns.length === 0) return '';

    const separator = (data.mode || DEFAULTS.mode) === 'arp' ? ' ' : ', ';
    const stepPattern = `[${allPatterns.join(separator)}]`;

    const columnModifier = columnModifiers[stepIdx];
    if (columnModifier && columnModifier.type !== 'off') {
      return applyColumnModifier(stepPattern, columnModifier);
    }

    return stepPattern;
  };

  // Only use the first `steps` rows of the grid
  const steps = data.steps || DEFAULTS.steps;
  const stepPatternsWithEmpty = grid.slice(0, steps).map((row, stepIdx) => {
    const step = generateStepPattern(row, stepIdx);
    return step === '' ? '[~]' : step;
  });
  const pattern = stepPatternsWithEmpty.join(' ');

  if (!pattern || !pattern.trim() || /^[~\s]*$/.test(pattern.trim())) {
    return strudelString;
  }

  // Legacy patches without an octave intentionally omit it in the pattern.
  const octavePart = data.octave ? data.octave : '';
  const scale = `${data.selectedKey || DEFAULTS.selectedKey}${octavePart}:${data.selectedScaleType || DEFAULTS.selectedScaleType}`;

  return strudelString
    ? `${strudelString}.n("${pattern}").scale("${scale}")`
    : `n("${pattern}").scale("${scale}")`;
}
