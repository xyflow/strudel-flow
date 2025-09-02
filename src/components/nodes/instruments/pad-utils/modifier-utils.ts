/**
 * Column modifier types and utilities
 */
export type ColumnModifier =
  | { type: 'off' }
  | { type: 'replicate'; count: number }
  | { type: 'slow'; count: number }
  | { type: 'elongate'; duration: number }
  | { type: 'speed'; multiplier: number };

// Legacy alias for backwards compatibility
export type CellState = ColumnModifier;

/**
 * Modifier option definitions - consolidated to avoid duplication
 */
export const MODIFIER_OPTIONS = {
  replicate: [
    { value: 'replicate-2', label: '!2', count: 2 },
    { value: 'replicate-3', label: '!3', count: 3 },
    { value: 'replicate-4', label: '!4', count: 4 },
  ],
  slow: [
    { value: 'slow-2', label: '/2', count: 2 },
    { value: 'slow-3', label: '/3', count: 3 },
    { value: 'slow-4', label: '/4', count: 4 },
  ],
  elongate: [
    { value: 'elongate-2', label: '@2', duration: 2 },
    { value: 'elongate-3', label: '@3', duration: 3 },
    { value: 'elongate-4', label: '@4', duration: 4 },
  ],
  speed: [
    { value: 'speed-2', label: '*2', multiplier: 2 },
    { value: 'speed-3', label: '*3', multiplier: 3 },
    { value: 'speed-4', label: '*4', multiplier: 4 },
  ],
};

/**
 * Get display text for a column modifier
 */
export function getModifierDisplay(modifier: ColumnModifier): string {
  switch (modifier.type) {
    case 'replicate':
      return `!${modifier.count}`;
    case 'slow':
      return `/${modifier.count}`;
    case 'elongate':
      return `@${modifier.duration}`;
    case 'speed':
      return `*${modifier.multiplier}`;
    default:
      return '';
  }
}

/**
 * Apply a column modifier to a pattern string
 */
export function applyColumnModifier(
  pattern: string,
  modifier: ColumnModifier
): string {
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
 * Get dropdown value string for the current modifier
 */
export function getModifierValue(modifier: ColumnModifier): string {
  if (modifier.type === 'replicate') return `replicate-${modifier.count}`;
  if (modifier.type === 'slow') return `slow-${modifier.count}`;
  if (modifier.type === 'elongate') return `elongate-${modifier.duration}`;
  if (modifier.type === 'speed') return `speed-${modifier.multiplier}`;
  return modifier.type;
}

/**
 * Parse dropdown value string back to ColumnModifier - uses MODIFIER_OPTIONS for validation
 */
export function parseModifierValue(value: string): ColumnModifier {
  // Check against predefined options to ensure consistency
  for (const [type, options] of Object.entries(MODIFIER_OPTIONS)) {
    const option = options.find((opt) => opt.value === value);
    if (option) {
      switch (type) {
        case 'replicate':
          return { type: 'replicate', count: option.count };
        case 'slow':
          return { type: 'slow', count: option.count };
        case 'elongate':
          return { type: 'elongate', duration: option.duration };
        case 'speed':
          return { type: 'speed', multiplier: option.multiplier };
      }
    }
  }

  return { type: 'off' };
}
