import { useState } from 'react';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';

import {
  applyRowModifier,
  toggleCell,
  getButtonModifier,
  handleModifierSelect,
  isButtonSelected,
  CellState,
} from './pad-utils';
import { PadButton } from './pad-utils/pad-button';
import { AccordionControls } from '@/components/accordion-controls';

const generateNotes = () => [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`];

export function PadNode({ id, data, type }: WorkflowNodeProps) {
  const [notes] = useState(generateNotes());
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const steps = data.steps || 5;
  const mode = data.mode || 'arp';
  const octave = data.octave || 2;
  const selectedKey = data.selectedKey || 'C';
  const selectedScaleType = data.selectedScaleType || 'major';
  const grid =
    data.grid ||
    Array(16)
      .fill(null)
      .map(() => Array(8).fill(false));
  const buttonModifiers = data.buttonModifiers || {};
  const selectedButtons = new Set(data.selectedButtons || []);
  const noteGroups = data.noteGroups || {};

  // Simple update functions
  const setSteps = (newSteps: number) =>
    updateNodeData(id, { steps: newSteps });
  const setMode = (newMode: 'arp' | 'chord') =>
    updateNodeData(id, { mode: newMode });
  const setOctave = (newOctave: number) =>
    updateNodeData(id, { octave: newOctave });
  const setSelectedKey = (newKey: string) =>
    updateNodeData(id, { selectedKey: newKey });
  const setSelectedScaleType = (newScale: string) =>
    updateNodeData(id, { selectedScaleType: newScale });
  const setNoteGroups = (newGroups: Record<number, number[][]>) =>
    updateNodeData(id, { noteGroups: newGroups });
  const setSelectedButtons = (newButtons: Set<string>) =>
    updateNodeData(id, { selectedButtons: Array.from(newButtons) });

  // Grid utility functions
  const handleToggleCell = (
    stepIdx: number,
    noteIdx: number,
    event?: React.MouseEvent
  ) =>
    toggleCell(
      stepIdx,
      noteIdx,
      grid,
      buttonModifiers,
      noteGroups,
      selectedButtons,
      updateNodeData,
      setNoteGroups,
      setSelectedButtons,
      id,
      event
    );

  const handleGetButtonModifier = (stepIdx: number, noteIdx: number) =>
    getButtonModifier(stepIdx, noteIdx, buttonModifiers);

  const handleModifierSelectCell = (
    stepIdx: number,
    noteIdx: number,
    modifier: CellState
  ) =>
    handleModifierSelect(
      stepIdx,
      noteIdx,
      modifier,
      grid,
      buttonModifiers,
      updateNodeData,
      id
    );

  const handleIsButtonSelected = (stepIdx: number, noteIdx: number) =>
    isButtonSelected(stepIdx, noteIdx, selectedButtons);

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-2 p-3 bg-card text-card-foreground rounded-md w-full max-w-full overflow-hidden">
        <div className="flex flex-col gap-1 w-full">
          {notes.map((_, noteIdx) => (
            <div key={noteIdx} className="flex gap-1 items-center">
              {Array.from({ length: steps }, (_, stepIdx) => (
                <PadButton
                  key={`${stepIdx}-${noteIdx}`}
                  stepIdx={stepIdx}
                  noteIdx={noteIdx}
                  on={grid[stepIdx]?.[noteIdx] || false}
                  isSelected={handleIsButtonSelected(stepIdx, noteIdx)}
                  noteGroups={noteGroups}
                  modifier={handleGetButtonModifier(stepIdx, noteIdx)}
                  handleModifierSelect={handleModifierSelectCell}
                  toggleCell={handleToggleCell}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="w-full max-w-full overflow-hidden">
          <AccordionControls
            keyScaleOctaveProps={{
              selectedKey,
              onKeyChange: setSelectedKey,
              selectedScale: selectedScaleType,
              onScaleChange: setSelectedScaleType,
              octave,
              onOctaveChange: setOctave,
            }}
            padControlsProps={{
              steps,
              onStepsChange: setSteps,
              mode,
              onModeChange: setMode,
              noteGroups,
              onClearGroups: () => setNoteGroups({}),
              selectedButtons,
              onClearSelection: () => setSelectedButtons(new Set()),
            }}
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

PadNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const data = node.data;
  const notes = [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`];

  const grid =
    data.grid ||
    Array(16)
      .fill(null)
      .map(() => Array(8).fill(false));
  const buttonModifiers = data.buttonModifiers || {};
  const noteGroups = data.noteGroups || {};

  const generateStepPattern = (row: boolean[], stepIdx: number) => {
    // Individual notes
    const individualNotes = row
      .map((on, noteIdx) => {
        if (!on) return null;
        const note = notes[noteIdx];
        const modifier = buttonModifiers[`${stepIdx}-${noteIdx}`] || {
          type: 'off',
        };
        return applyRowModifier(note, modifier);
      })
      .filter(Boolean);

    const stepGroups = noteGroups[stepIdx] || [];
    const groupPatterns = stepGroups.map((group) => {
      const groupNoteValues = group.map((noteIdx) => notes[noteIdx]);
      return `<${groupNoteValues.join(' ')}>`;
    });

    const allPatterns = [...individualNotes, ...groupPatterns];
    if (allPatterns.length === 0) return '';

    const separator = (data.mode || 'arp') === 'arp' ? ' ' : ', ';
    return `[${allPatterns.join(separator)}]`;
  };

  const stepPatterns = grid.map(generateStepPattern).filter(Boolean);
  const pattern = stepPatterns.join(' ');

  if (!pattern || !pattern.trim() || /^[~\s]*$/.test(pattern.trim())) {
    return strudelString;
  }

  const scale = `${data.selectedKey || 'C'}${data.octave || 2}:${
    data.selectedScaleType || 'major'
  }`;
  const calls = [`n("${pattern}")`, `scale("${scale}")`];
  const notePattern = calls.join('.');

  return strudelString ? `${strudelString}.${notePattern}` : notePattern;
};
