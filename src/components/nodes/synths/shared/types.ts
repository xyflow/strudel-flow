/**
 * Shared types for synth nodes
 */

export type CellState =
  | { type: 'off' }
  | { type: 'normal' }
  | { type: 'replicate'; count: number }
  | { type: 'slow'; count: number }
  | { type: 'elongate'; duration: number }
  | { type: 'speed'; multiplier: number };

export type StepState = { type: 'off' } | { type: 'note'; noteNumber: number };

export type ButtonGrouping = {
  selectedButtons: Set<string>;
  soundGroups: Record<number, number[][]>;
};

export type RowModifiers = CellState[];

export type SoundSelection = Record<string, number>;
