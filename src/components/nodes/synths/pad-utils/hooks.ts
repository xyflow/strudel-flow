/**
 * Common hooks for synth nodes
 */

import { useState, useEffect } from 'react';
import {
  cleanupSoundGroupsForSteps,
  cleanupSelectedButtonsForSteps,
} from './button-utils';

/**
 * Hook for managing step count and cleanup
 */
export function useStepManagement(initialSteps: number = 4) {
  const [steps, setSteps] = useState(initialSteps);

  return { steps, setSteps };
}

/**
 * Hook for managing grid-based step sequencer state
 */
export function useGridAsStepSequencer(steps: number, noteCount: number) {
  const [grid, setGrid] = useState<boolean[][]>(
    Array.from({ length: steps }, () => Array(noteCount).fill(false))
  );

  const [selectedButtons, setSelectedButtons] = useState<Set<string>>(
    new Set()
  );
  const [soundGroups, setSoundGroups] = useState<Record<number, number[][]>>(
    {}
  );

  // Update state when steps change
  useEffect(() => {
    setSoundGroups((prev) => cleanupSoundGroupsForSteps(prev, steps));
    setSelectedButtons((prev) => cleanupSelectedButtonsForSteps(prev, steps));
  }, [steps]);

  // Update grid when steps or noteCount change
  useEffect(() => {
    setGrid((prev) =>
      Array.from({ length: steps }, (_, idx) =>
        prev[idx]
          ? prev[idx]
              .slice(0, noteCount)
              .concat(
                Array(Math.max(0, noteCount - (prev[idx]?.length || 0))).fill(
                  false
                )
              )
          : Array(noteCount).fill(false)
      )
    );
  }, [steps, noteCount]);

  return {
    grid,
    setGrid,
    selectedButtons,
    setSelectedButtons,
    soundGroups,
    setSoundGroups,
  };
}
