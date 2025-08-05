/**
 * Hooks for synth nodes
 */

import { useState, useEffect } from 'react';
import { createGroupsFromSelection, CellState } from './';

/**
 * Hook for managing step count
 */
export function useStepManagement(initialSteps: number = 4) {
  const [steps, setSteps] = useState(initialSteps);
  return { steps, setSteps };
}

interface PadNodeInternalState {
  grid: boolean[][];
  buttonModifiers: Record<string, CellState>;
  selectedButtons: string[];
  noteGroups: Record<number, number[][]>;
}

/**
 * Main hook for managing pad grid state
 */
export function usePadGrid(
  steps: number,
  notes: string[],
  initialState?: PadNodeInternalState
) {
  const [grid, setGrid] = useState<boolean[][]>(
    Array.from({ length: steps }, () => Array(notes.length).fill(false))
  );
  const [selectedButtons, setSelectedButtons] = useState<Set<string>>(
    new Set()
  );
  const [noteGroups, setNoteGroups] = useState<Record<number, number[][]>>({});
  const [buttonModifiers, setButtonModifiers] = useState<
    Record<string, CellState>
  >({});
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Reset grid when steps or notes change
  useEffect(() => {
    setGrid(
      Array.from({ length: steps }, () => Array(notes.length).fill(false))
    );
  }, [steps, notes.length]);

  // Restore state from props
  useEffect(() => {
    if (initialState && !hasRestoredState) {
      if (initialState.grid) setGrid(initialState.grid);
      if (initialState.buttonModifiers)
        setButtonModifiers(initialState.buttonModifiers);
      if (initialState.selectedButtons)
        setSelectedButtons(new Set(initialState.selectedButtons));
      if (initialState.noteGroups) setNoteGroups(initialState.noteGroups);
      setHasRestoredState(true);
    }
  }, [initialState, hasRestoredState]);

  const createButtonKey = (stepIdx: number, noteIdx: number) =>
    `${stepIdx}-${noteIdx}`;

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
      // Group selection mode
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
          // Clear selection for this step after creating group
          return new Set(
            Array.from(newSelected).filter(
              (key) => !key.startsWith(`${stepIdx}-`)
            )
          );
        }
        return newSelected;
      });
    } else {
      // Normal toggle mode
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        const wasOn = next[stepIdx][noteIdx];
        next[stepIdx][noteIdx] = !wasOn;

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
