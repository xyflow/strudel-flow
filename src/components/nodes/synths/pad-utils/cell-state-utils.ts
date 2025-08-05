/**
 * Utility functions for cell state management
 */

export type CellState =
  | { type: 'off' }
  | { type: 'replicate'; count: number }
  | { type: 'slow'; count: number }
  | { type: 'elongate'; duration: number }
  | { type: 'speed'; multiplier: number };

/**
 * Get display text for a cell state
 */
export function getCellStateDisplay(cellState: CellState): string {
  switch (cellState.type) {
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
 * Apply a row modifier to a pattern string
 */
export function applyRowModifier(pattern: string, modifier: CellState): string {
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
  if (value.startsWith('replicate-')) {
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

export const getButtonClasses = (
  isSelected: boolean,
  isInGroup: boolean,
  groupIndex: number,
  isPressed: boolean
) => {
  const base =
    'transition-all duration-150 rounded-md text-xs font-mono select-none';
  if (isSelected) return `${base} bg-yellow-400 text-black`;
  if (isInGroup) {
    const groupColors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
    ];
    return `${base} ${groupColors[groupIndex % groupColors.length]} text-white`;
  }
  if (isPressed) return `${base} bg-blue-400 text-white`;
  return `${base} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600`;
};
