/**
 * Simple button utilities
 */

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
 * Create groups from selected buttons in a step
 */
export function createGroupsFromSelection(
  selectedButtons: Set<string>,
  stepIdx: number,
  currentGroups: Record<number, number[][]>
): Record<number, number[][]> {
  const stepButtons = Array.from(selectedButtons)
    .filter((key) => key.startsWith(`${stepIdx}-`))
    .map((key) => parseInt(key.split('-')[1]))
    .sort((a, b) => a - b);

  if (stepButtons.length < 2) return currentGroups;

  const newGroups = { ...currentGroups };
  if (!newGroups[stepIdx]) newGroups[stepIdx] = [];

  // Only add if group doesn't already exist
  const exists = newGroups[stepIdx].some(
    (group) =>
      group.length === stepButtons.length &&
      group.every((val, i) => val === stepButtons[i])
  );

  if (!exists) {
    newGroups[stepIdx].push(stepButtons);
  }

  return newGroups;
}
