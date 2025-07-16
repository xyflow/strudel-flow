/**
 * Common hooks for synth nodes
 */

import { useState, useEffect, useMemo } from 'react';
import { CellState, SoundSelection } from './types';
import {
  cleanupSelectedSoundsForSteps,
  cleanupSoundGroupsForSteps,
  cleanupSelectedButtonsForSteps,
  createButtonKey,
} from './button-utils';

/**
 * Hook for managing step count and cleanup
 */
export function useStepManagement(initialSteps: number = 4) {
  const [steps, setSteps] = useState(initialSteps);
  
  return { steps, setSteps };
}

/**
 * Hook for managing step sequencer state with automatic cleanup
 */
export function useStepSequencerState(steps: number) {
  const [selectedSounds, setSelectedSounds] = useState<SoundSelection>({});
  const [selectedButtons, setSelectedButtons] = useState<Set<string>>(new Set());
  const [soundGroups, setSoundGroups] = useState<Record<number, number[][]>>({});

  // Update state when steps change
  useEffect(() => {
    setSelectedSounds((prev) => cleanupSelectedSoundsForSteps(prev, steps));
    setSoundGroups((prev) => cleanupSoundGroupsForSteps(prev, steps));
    setSelectedButtons((prev) => cleanupSelectedButtonsForSteps(prev, steps));
  }, [steps]);

  return {
    selectedSounds,
    setSelectedSounds,
    selectedButtons,
    setSelectedButtons,
    soundGroups,
    setSoundGroups,
  };
}

/**
 * Hook for managing simple pad states (like drum machine)
 */
export function usePadStates(initialStates: Record<string, CellState>) {
  const [padStates, setPadStates] = useState<Record<string, CellState>>(initialStates);
  
  return { padStates, setPadStates };
}

/**
 * Hook for managing grid-based state using existing step sequencer utilities
 * Converts boolean grid to selectedSounds format for compatibility
 */
export function useGridAsStepSequencer(steps: number, noteCount: number) {
  const [grid, setGrid] = useState<boolean[][]>(
    Array.from({ length: steps }, () => Array(noteCount).fill(false))
  );
  
  const baseState = useStepSequencerState(steps);

  // Convert grid to selectedSounds format (use index 0 to indicate "on")
  const selectedSounds = useMemo(() => {
    const sounds: Record<string, number> = {};
    grid.forEach((row, stepIdx) => {
      row.forEach((isOn, noteIdx) => {
        if (isOn) {
          const buttonKey = createButtonKey(stepIdx, noteIdx);
          sounds[buttonKey] = 0; // Use 0 as "on" indicator
        }
      });
    });
    return sounds;
  }, [grid]);

  // Update grid when steps or noteCount change
  useEffect(() => {
    setGrid((prev) =>
      Array.from({ length: steps }, (_, idx) =>
        prev[idx] ? 
          prev[idx].slice(0, noteCount).concat(Array(Math.max(0, noteCount - (prev[idx]?.length || 0))).fill(false)) : 
          Array(noteCount).fill(false)
      )
    );
  }, [steps, noteCount]);

  return {
    grid,
    setGrid,
    selectedSounds, // Virtual selectedSounds for compatibility
    selectedButtons: baseState.selectedButtons,
    setSelectedButtons: baseState.setSelectedButtons,
    soundGroups: baseState.soundGroups,
    setSoundGroups: baseState.setSoundGroups,
  };
}
