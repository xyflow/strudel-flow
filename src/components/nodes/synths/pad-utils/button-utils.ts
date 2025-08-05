/**
 * Utility functions for button grouping and sound selection
 */

/**
 * Generate button key from step and track indices
 */
export function createButtonKey(stepIdx: number, trackIdx: number): string {
  return `${stepIdx}-${trackIdx}`;
}

/**
 * Check if a button is part of a group
 */
export function getButtonGroupIndex(
  stepIdx: number,
  trackIdx: number,
  soundGroups: Record<number, number[][]>
): number {
  const stepGroups = soundGroups[stepIdx] || [];
  return stepGroups.findIndex((group) => group.includes(trackIdx));
}

/**
 * Auto-create groups when we have 2 or more selected buttons in the same step
 */
export function createGroupsFromSelection(
  selectedButtons: Set<string>,
  stepIdx: number,
  currentGroups: Record<number, number[][]>
): Record<number, number[][]> {
  const currentStepButtons = Array.from(selectedButtons).filter((key) =>
    key.startsWith(`${stepIdx}-`)
  );

  if (currentStepButtons.length >= 2) {
    const trackIndices = currentStepButtons
      .map((key) => parseInt(key.split('-')[1]))
      .sort((a, b) => a - b);

    const newGroups = { ...currentGroups };
    if (!newGroups[stepIdx]) {
      newGroups[stepIdx] = [];
    }

    // Check if this exact group already exists to avoid duplicates
    const groupExists = newGroups[stepIdx].some(
      (existingGroup) =>
        existingGroup.length === trackIndices.length &&
        existingGroup.every((idx, i) => idx === trackIndices[i])
    );

    if (!groupExists) {
      newGroups[stepIdx].push(trackIndices);
    }

    return newGroups;
  }

  return currentGroups;
}

/**
 * Clear selection for a specific step
 */
export function clearSelectionForStep(
  selectedButtons: Set<string>,
  stepIdx: number
): Set<string> {
  return new Set(
    Array.from(selectedButtons).filter((key) => !key.startsWith(`${stepIdx}-`))
  );
}

/**
 * Clean up sound groups when steps change
 */
export function cleanupSoundGroupsForSteps(
  soundGroups: Record<number, number[][]>,
  maxSteps: number
): Record<number, number[][]> {
  const newGroups = { ...soundGroups };
  Object.keys(newGroups).forEach((stepKey) => {
    const stepIdx = parseInt(stepKey);
    if (stepIdx >= maxSteps) {
      delete newGroups[stepIdx];
    }
  });
  return newGroups;
}

/**
 * Clean up selected buttons when steps change
 */
export function cleanupSelectedButtonsForSteps(
  selectedButtons: Set<string>,
  maxSteps: number
): Set<string> {
  const newSelected = new Set<string>();
  selectedButtons.forEach((key) => {
    const [stepIdx] = key.split('-').map(Number);
    if (stepIdx < maxSteps) {
      newSelected.add(key);
    }
  });
  return newSelected;
}
