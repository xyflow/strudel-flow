/**
 * Utility functions for pattern generation
 */

import { CellState } from './';
import { applyRowModifier } from './cell-state-utils';

/**
 * Generate pattern for simple drum machine style nodes
 */
export function generateDrumPattern(
  padStates: Record<string, CellState>,
  soundOptions: string[]
): string {
  const activePads = soundOptions
    .filter((sound) => padStates[sound]?.type !== 'off')
    .map((sound) => {
      const state = padStates[sound];
      return applyRowModifier(sound, state);
    });

  return activePads.join(' ');
}
