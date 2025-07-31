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

/**
 * Get group colors for UI
 */
export const GROUP_COLORS = [
  'bg-blue-500 border-blue-600',
  'bg-green-500 border-green-600',
  'bg-purple-500 border-purple-600',
  'bg-pink-500 border-pink-600',
  'bg-orange-500 border-orange-600',
];

/**
 * Get button CSS classes based on state
 */
export function getButtonClasses(
  isSelected: boolean,
  isInGroup: boolean,
  groupIndex: number,
  hasSound: boolean
): string {
  let buttonClass = `w-20 h-10 rounded-md border transition-all duration-200 shadow-sm text-xs font-mono `;

  if (isSelected) {
    // Selected for grouping - bright yellow
    buttonClass +=
      'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-300 shadow-inner';
  } else if (isInGroup) {
    // Part of a group - use group color
    const groupColor = GROUP_COLORS[groupIndex % GROUP_COLORS.length];
    buttonClass += `${groupColor} text-white hover:opacity-90 ${
      hasSound ? 'shadow-inner' : 'opacity-70'
    }`;
  } else if (hasSound) {
    // Has a sound - primary color
    buttonClass +=
      'bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-inner';
  } else {
    // No sound - muted
    buttonClass +=
      'bg-muted text-muted-foreground border-border hover:bg-muted/70 hover:shadow-md';
  }

  buttonClass += ' hover:shadow-md active:shadow-inner active:bg-opacity-80';

  return buttonClass;
}
