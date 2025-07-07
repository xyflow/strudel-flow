/**
 * Utility functions for cell state management
 */

import { CellState } from './types';

export const DEFAULT_CLICK_SEQUENCE: CellState[] = [
  { type: 'off' },
  { type: 'normal' },
  { type: 'slow', count: 2 },
  { type: 'slow', count: 3 },
  { type: 'slow', count: 4 },
  { type: 'replicate', count: 2 },
  { type: 'replicate', count: 3 },
  { type: 'replicate', count: 4 },
  { type: 'elongate', duration: 2 },
  { type: 'elongate', duration: 3 },
  { type: 'elongate', duration: 4 },
  { type: 'speed', multiplier: 2 },
  { type: 'speed', multiplier: 3 },
  { type: 'speed', multiplier: 4 },
];

export const DRUM_CLICK_SEQUENCE: CellState[] = [...DEFAULT_CLICK_SEQUENCE];

export const PAD_CLICK_SEQUENCE: CellState[] = [...DEFAULT_CLICK_SEQUENCE];

/**
 * Get the next cell state in a click sequence
 */
export function getNextCellState(
  currentState: CellState,
  sequence: CellState[] = DEFAULT_CLICK_SEQUENCE
): CellState {
  // Find current state in sequence
  let currentIndex = -1;
  for (let i = 0; i < sequence.length; i++) {
    const seqState = sequence[i];
    if (seqState.type === currentState.type) {
      if (seqState.type === 'replicate' && currentState.type === 'replicate') {
        if (seqState.count === currentState.count) {
          currentIndex = i;
          break;
        }
      } else if (
        seqState.type === 'elongate' &&
        currentState.type === 'elongate'
      ) {
        if (seqState.duration === currentState.duration) {
          currentIndex = i;
          break;
        }
      } else if (seqState.type === 'slow' && currentState.type === 'slow') {
        if (seqState.count === currentState.count) {
          currentIndex = i;
          break;
        }
      } else if (seqState.type === 'speed' && currentState.type === 'speed') {
        if (seqState.multiplier === currentState.multiplier) {
          currentIndex = i;
          break;
        }
      } else {
        // For simple types (off, normal)
        currentIndex = i;
        break;
      }
    }
  }

  // Move to next state in sequence
  const nextIndex = (currentIndex + 1) % sequence.length;
  return { ...sequence[nextIndex] };
}

/**
 * Get display text for a cell state
 */
export function getCellStateDisplay(cellState: CellState): string {
  switch (cellState.type) {
    case 'off':
      return '';
    case 'normal':
      return '';
    case 'replicate':
      return `!${cellState.count}`;
    case 'slow':
      return `/${cellState.count}`;
    case 'elongate':
      return `@${cellState.duration}`;
    case 'speed':
      return `*${cellState.multiplier}`;
    default:
      return '';
  }
}

/**
 * Get CSS classes for a cell state
 */
export function getCellStateColor(cellState: CellState): string {
  if (cellState.type === 'off')
    return 'bg-muted text-muted-foreground border-border';
  if (cellState.type === 'normal')
    return 'bg-secondary text-primary-foreground border-border';
  if (cellState.type === 'replicate')
    return 'bg-blue-500 text-white border-border';
  if (cellState.type === 'slow') return 'bg-pink-500 text-white border-border';
  if (cellState.type === 'elongate')
    return 'bg-green-500 text-white border-border';
  if (cellState.type === 'speed') return 'bg-red-500 text-white border-border';
  return 'bg-secondary text-primary-foreground border-border';
}

/**
 * Apply a row modifier to a pattern string
 */
export function applyRowModifier(pattern: string, modifier: CellState): string {
  if (modifier.type === 'off' || modifier.type === 'normal') {
    return pattern;
  }

  if (modifier.type === 'replicate') {
    return `${pattern}!${modifier.count}`;
  }

  if (modifier.type === 'slow') {
    return `${pattern}/${modifier.count}`;
  }

  if (modifier.type === 'elongate') {
    return `${pattern}@${modifier.duration}`;
  }

  if (modifier.type === 'speed') {
    return `${pattern}*${modifier.multiplier}`;
  }

  return pattern;
}

/**
 * Initialize row modifiers array for given number of steps
 */
export function initializeRowModifiers(steps: number): CellState[] {
  return Array(steps).fill({ type: 'off' });
}

/**
 * Update row modifiers when steps change
 */
export function updateRowModifiersForSteps(
  current: CellState[],
  newSteps: number
): CellState[] {
  return Array.from(
    { length: newSteps },
    (_, idx) => current[idx] || { type: 'off' }
  );
}
