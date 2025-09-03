/**
 * Button utility functions
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

export function toggleCell(
  stepIdx: number,
  noteIdx: number,
  grid: boolean[][],
  noteGroups: Record<number, number[][]>,
  selectedButtons: Set<string>,
  updateNodeData: (nodeId: string, updates: Record<string, unknown>) => void,
  setNoteGroups: (groups: Record<number, number[][]>) => void,
  setSelectedButtons: (buttons: Set<string>) => void,
  nodeId: string,
  event?: React.MouseEvent
) {
  const buttonKey = `${stepIdx}-${noteIdx}`;

  if (event?.shiftKey) {
    const newSelected = new Set(selectedButtons);
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
      const clearedSelection = new Set(
        Array.from(newSelected).filter((key) => !key.startsWith(`${stepIdx}-`))
      );
      setSelectedButtons(clearedSelection);
    } else {
      setSelectedButtons(newSelected);
    }
  } else {
    const newGrid = grid.map((row) => [...row]);
    const wasOn = newGrid[stepIdx][noteIdx];

    // Check if this button is part of a group
    const stepGroups = noteGroups[stepIdx] || [];
    const groupIndex = stepGroups.findIndex((group) => group.includes(noteIdx));
    const isInGroup = groupIndex >= 0;

    // If button is in a group and currently on, clicking should turn it off and remove from group
    if (isInGroup && wasOn) {
      // Turn off the button
      newGrid[stepIdx][noteIdx] = false;

      // Remove this button from the group
      const updatedGroup = stepGroups[groupIndex].filter(
        (idx) => idx !== noteIdx
      );
      const newGroups = { ...noteGroups };

      if (updatedGroup.length < 2) {
        // If group has less than 2 members, remove the entire group
        newGroups[stepIdx] = stepGroups.filter((_, idx) => idx !== groupIndex);
        if (newGroups[stepIdx].length === 0) {
          delete newGroups[stepIdx];
        }
      } else {
        // Update the group with remaining members
        newGroups[stepIdx] = stepGroups.map((group, idx) =>
          idx === groupIndex ? updatedGroup : group
        );
      }

      // Update state (no more buttonModifiers)
      updateNodeData(nodeId, { grid: newGrid });
      setNoteGroups(newGroups);
    } else {
      // Normal toggle behavior for non-grouped buttons or turning on
      newGrid[stepIdx][noteIdx] = !wasOn;
      updateNodeData(nodeId, { grid: newGrid });
    }
  }
}

export function isButtonSelected(
  stepIdx: number,
  noteIdx: number,
  selectedButtons: Set<string>
): boolean {
  return selectedButtons.has(`${stepIdx}-${noteIdx}`);
}

export const getButtonClasses = (
  isSelected: boolean,
  isInGroup: boolean,
  groupIndex: number,
  isPressed: boolean
) => {
  const base =
    'transition-all ease-out duration-150 rounded-md text-xs font-mono select-none';
  if (isSelected) return `${base} bg-accent-foreground`;
  if (isInGroup) {
    const groupColors = [
      'bg-chart-5',
      'bg-chart-2',
      'bg-chart-3',
      'bg-chart-4',
    ];
    return `${base} ${groupColors[groupIndex % groupColors.length]}`;
  }
  if (isPressed) return `${base} !duration-0 bg-primary`;
  return `${base} bg-card-foreground/20 hover:bg-popover-foreground/50`;
};
