import React from 'react';
import { ModifierContextMenu, CellState } from './modifier-context-menu';
import { getButtonGroupIndex } from './button-utils';

export const getButtonClasses = (
  isSelected: boolean,
  isInGroup: boolean,
  groupIndex: number,
  isPressed: boolean
) => {
  const base =
    'transition-all duration-150 rounded-md text-xs font-mono select-none';
  if (isSelected) return `${base} bg-yellow-400 text-black`;
  if (isInGroup) {
    const groupColors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
    ];
    return `${base} ${groupColors[groupIndex % groupColors.length]} text-white`;
  }
  if (isPressed) return `${base} bg-blue-400 text-white`;
  return `${base} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600`;
};

export const getCellStateDisplay = (state: CellState): string => {
  if (!state || state.type === 'off' || state.type === 'normal') return '';
  if (state.type === 'skip') return '~';
  if (state.type === 'mute') return 'x';
  if (state.type === 'pan') return `p${state.value}`;
  if (state.type === 'gain') return `g${state.value}`;
  if (state.type === 'delay') return `d${state.value}`;
  if (state.type === 'rate') return `r${state.value}`;
  return '';
};

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
  const hasModifier = modifier.type !== 'off' && modifier.type !== 'normal';
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
