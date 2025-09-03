import React from 'react';
import { getButtonGroupIndex, getButtonClasses } from './button-utils';

interface PadButtonProps {
  stepIdx: number;
  noteIdx: number;
  on: boolean;
  isSelected: boolean;
  noteGroups: Record<number, number[][]>;
  toggleCell: (
    stepIdx: number,
    noteIdx: number,
    event?: React.MouseEvent
  ) => void;
}

export const PadButton: React.FC<PadButtonProps> = ({
  stepIdx,
  noteIdx,
  on,
  isSelected,
  noteGroups,
  toggleCell,
}) => {
  const groupIndex = getButtonGroupIndex(stepIdx, noteIdx, noteGroups);
  const isInGroup = groupIndex >= 0;

  const buttonClass = `${getButtonClasses(
    isSelected,
    isInGroup,
    groupIndex,
    on
  )} w-12 h-10`;

  return (
    <button
      className={buttonClass}
      onPointerDown={(event) => toggleCell(stepIdx, noteIdx, event)}
      title={`Note ${noteIdx + 1}, Step ${stepIdx + 1}`}
    >
      {/* No modifier text - just a clean button */}
    </button>
  );
};
