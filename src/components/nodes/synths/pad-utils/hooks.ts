/**
 * Common hooks for synth nodes
 */

import { useState, useEffect } from 'react';
import {
  cleanupSoundGroupsForSteps,
  cleanupSelectedButtonsForSteps,
  createButtonKey,
  createGroupsFromSelection,
  clearSelectionForStep,
} from './button-utils';
import { CellState } from './index';

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

export function usePadGrid(steps: number, notes: string[], initialState?: any) {
  const {
    grid,
    setGrid,
    selectedButtons,
    setSelectedButtons,
    soundGroups: noteGroups,
    setSoundGroups: setNoteGroups,
  } = useGridAsStepSequencer(steps, notes.length);

  const [buttonModifiers, setButtonModifiers] = useState<
    Record<string, CellState>
  >({});
  const [hasRestoredState, setHasRestoredState] = useState(false);

  useEffect(() => {
    if (initialState && !hasRestoredState) {
      setTimeout(() => {
        if (initialState.grid) setGrid(initialState.grid);
        if (initialState.buttonModifiers)
          setButtonModifiers(initialState.buttonModifiers);
        if (initialState.selectedButtons)
          setSelectedButtons(new Set(initialState.selectedButtons));
        if (initialState.noteGroups) setNoteGroups(initialState.noteGroups);
      }, 50);
      setHasRestoredState(true);
    }
  }, [
    initialState,
    hasRestoredState,
    setGrid,
    setSelectedButtons,
    setNoteGroups,
  ]);

  const getButtonModifier = (stepIdx: number, noteIdx: number) => {
    const key = createButtonKey(stepIdx, noteIdx);
    return buttonModifiers[key] || { type: 'off' };
  };

  const setButtonModifier = (
    stepIdx: number,
    noteIdx: number,
    state: CellState
  ) => {
    const key = createButtonKey(stepIdx, noteIdx);
    setButtonModifiers((prev) => ({ ...prev, [key]: state }));
  };

  const handleModifierSelect = (
    stepIdx: number,
    noteIdx: number,
    modifier: CellState
  ) => {
    setButtonModifier(stepIdx, noteIdx, modifier);
    if (modifier.type !== 'off') {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        if (!next[stepIdx][noteIdx]) {
          next[stepIdx][noteIdx] = true;
        }
        return next;
      });
    }
  };

  const toggleCell = (
    stepIdx: number,
    noteIdx: number,
    event?: React.MouseEvent
  ) => {
    const buttonKey = createButtonKey(stepIdx, noteIdx);
    if (event?.shiftKey) {
      setSelectedButtons((prev) => {
        const newSelected = new Set(prev);
        if (newSelected.has(buttonKey)) {
          newSelected.delete(buttonKey);
        } else {
          newSelected.add(buttonKey);
        }
        const newGroups = createGroupsFromSelection(
          newSelected,
          stepIdx,
          noteGroups
        );
        if (newGroups !== noteGroups) {
          setNoteGroups(newGroups);
          return clearSelectionForStep(newSelected, stepIdx);
        }
        return newSelected;
      });
    } else {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        const wasOn = next[stepIdx][noteIdx];
        next[stepIdx][noteIdx] = !next[stepIdx][noteIdx];
        if (wasOn && !next[stepIdx][noteIdx]) {
          setButtonModifier(stepIdx, noteIdx, { type: 'off' });
        }
        return next;
      });
    }
  };

  const isButtonSelected = (stepIdx: number, noteIdx: number) =>
    selectedButtons.has(createButtonKey(stepIdx, noteIdx));

  return {
    grid,
    noteGroups,
    selectedButtons,
    buttonModifiers,
    getButtonModifier,
    setButtonModifier,
    handleModifierSelect,
    toggleCell,
    isButtonSelected,
    setNoteGroups,
    setSelectedButtons,
  };
}
