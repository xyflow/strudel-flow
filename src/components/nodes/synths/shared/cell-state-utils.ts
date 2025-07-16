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
 * Get context menu value string for radio group
 */
export function getContextMenuValue(cellState: CellState): string {
  if (cellState.type === 'replicate') return `replicate-${cellState.count}`;
  if (cellState.type === 'slow') return `slow-${cellState.count}`;
  if (cellState.type === 'elongate') return `elongate-${cellState.duration}`;
  if (cellState.type === 'speed') return `speed-${cellState.multiplier}`;
  return cellState.type;
}

/**
 * Parse context menu value string back to CellState
 */
export function parseContextMenuValue(value: string): CellState {
  if (value === 'off') {
    return { type: 'off' };
  } else if (value === 'normal') {
    return { type: 'normal' };
  } else if (value.startsWith('replicate-')) {
    const count = parseInt(value.split('-')[1]);
    return { type: 'replicate', count };
  } else if (value.startsWith('slow-')) {
    const count = parseInt(value.split('-')[1]);
    return { type: 'slow', count };
  } else if (value.startsWith('elongate-')) {
    const duration = parseInt(value.split('-')[1]);
    return { type: 'elongate', duration };
  } else if (value.startsWith('speed-')) {
    const multiplier = parseInt(value.split('-')[1]);
    return { type: 'speed', multiplier };
  } else {
    return { type: 'off' };
  }
}
