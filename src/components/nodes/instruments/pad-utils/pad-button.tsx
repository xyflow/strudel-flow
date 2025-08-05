import React from 'react';
import {
  ModifierContextMenu,
  getButtonGroupIndex,
  CellState,
  getButtonClasses,
  getCellStateDisplay,
} from '.';

interface PadButtonProps {
  stepIdx: number;
  noteIdx: number;
  on: boolean;
  isSelected: boolean;
  noteGroups: Record<number, number[][]>;
  modifier: CellState;
  handleModifierSelect: (
    stepIdx: number,
    noteIdx: number,
    modifier: CellState
  ) => void;
  toggleCell: (
    stepIdx: number,
    noteIdx: number,
    event?: React.MouseEvent
  ) => void;
  withContextMenu?: boolean;
}

export const PadButton: React.FC<PadButtonProps> = ({
  stepIdx,
  noteIdx,
  on,
  isSelected,
  noteGroups,
  modifier,
  handleModifierSelect,
  toggleCell,
  withContextMenu = true,
}) => {
  const groupIndex = getButtonGroupIndex(stepIdx, noteIdx, noteGroups);
  const isInGroup = groupIndex >= 0;
  const hasModifier = modifier.type !== 'off';
  const modifierText = getCellStateDisplay(modifier);

  const buttonClass = `${getButtonClasses(
    isSelected,
    isInGroup,
    groupIndex,
    on
  )} w-12 h-10`;

  const button = (
    <button
      className={buttonClass}
      onClick={(event) => toggleCell(stepIdx, noteIdx, event)}
      title={
        hasModifier
          ? `Modified: ${modifier.type} - Right-click to change`
          : 'Right-click for modifier options'
      }
    >
      {modifierText}
    </button>
  );

  if (withContextMenu) {
    return (
      <ModifierContextMenu
        currentState={modifier}
        onModifierSelect={(newModifier) =>
          handleModifierSelect(stepIdx, noteIdx, newModifier)
        }
        label="Note Modifiers"
      >
        {button}
      </ModifierContextMenu>
    );
  }

  return button;
};
