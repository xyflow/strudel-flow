import { useState } from 'react';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';

import {
  applyRowModifier,
  CellState,
  createGroupsFromSelection,
} from './pad-utils';
import { PadButton } from './pad-utils/pad-button';
import { AccordionControls } from '@/components/accordion-controls';

const generateNotes = () => [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`];

export function PadNode({ id, data, type }: WorkflowNodeProps) {
  const [notes] = useState(generateNotes());
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Use node data directly with defaults
  const steps = data.steps || 5;
  const mode = data.mode || 'arp';
  const octave = data.octave || 4;
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

  // Grid utilities
  const toggleCell = (
    stepIdx: number,
    noteIdx: number,
    event?: React.MouseEvent
  ) => {
    const buttonKey = `${stepIdx}-${noteIdx}`;

    if (event?.shiftKey) {
      // Group selection mode
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
        // Clear selection for this step after creating group
        const clearedSelection = new Set(
          Array.from(newSelected).filter(
            (key) => !key.startsWith(`${stepIdx}-`)
          )
        );
        setSelectedButtons(clearedSelection);
      } else {
        setSelectedButtons(newSelected);
      }
    } else {
      // Normal toggle mode
      const newGrid = grid.map((row) => [...row]);
      const wasOn = newGrid[stepIdx][noteIdx];
      newGrid[stepIdx][noteIdx] = !wasOn;

      // If turning off, also reset modifier
      if (wasOn && !newGrid[stepIdx][noteIdx]) {
        const newModifiers = { ...buttonModifiers };
        delete newModifiers[buttonKey];
        updateNodeData(id, { grid: newGrid, buttonModifiers: newModifiers });
      } else {
        updateNodeData(id, { grid: newGrid });
      }
    }
  };

  const getButtonModifier = (stepIdx: number, noteIdx: number) => {
    return buttonModifiers[`${stepIdx}-${noteIdx}`] || { type: 'off' };
  };

  const handleModifierSelect = (
    stepIdx: number,
    noteIdx: number,
    modifier: CellState
  ) => {
    const buttonKey = `${stepIdx}-${noteIdx}`;
    const newModifiers = {
      ...buttonModifiers,
      [buttonKey]: modifier,
    };

    // If modifier is not 'off', also activate the button
    if (modifier.type !== 'off') {
      const newGrid = grid.map((row) => [...row]);
      if (!newGrid[stepIdx][noteIdx]) {
        newGrid[stepIdx][noteIdx] = true;
        updateNodeData(id, { grid: newGrid, buttonModifiers: newModifiers });
      } else {
        updateNodeData(id, { buttonModifiers: newModifiers });
      }
    } else {
      updateNodeData(id, { buttonModifiers: newModifiers });
    }
  };

  const isButtonSelected = (stepIdx: number, noteIdx: number) => {
    return selectedButtons.has(`${stepIdx}-${noteIdx}`);
  };

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
                  isSelected={isButtonSelected(stepIdx, noteIdx)}
                  noteGroups={noteGroups}
                  modifier={getButtonModifier(stepIdx, noteIdx)}
                  handleModifierSelect={handleModifierSelect}
                  toggleCell={toggleCell}
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

  // Get state from node data
  const grid =
    data.grid ||
    Array(16)
      .fill(null)
      .map(() => Array(8).fill(false));
  const buttonModifiers = data.buttonModifiers || {};
  const noteGroups = data.noteGroups || {};
  const mode = data.mode || 'arp';
  const selectedKey = data.selectedKey || 'C';
  const octave = data.octave || 4;
  const selectedScaleType = data.selectedScaleType || 'major';

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

    // Group patterns
    const stepGroups = noteGroups[stepIdx] || [];
    const groupPatterns = stepGroups.map((group) => {
      const groupNoteValues = group.map((noteIdx) => notes[noteIdx]);
      return `<${groupNoteValues.join(' ')}>`;
    });

    const allPatterns = [...individualNotes, ...groupPatterns];
    if (allPatterns.length === 0) return '';

    const separator = mode === 'arp' ? ' ' : ', ';
    return `[${allPatterns.join(separator)}]`;
  };

  const stepPatterns = grid.map(generateStepPattern).filter(Boolean);
  const pattern = stepPatterns.join(' ');

  if (!pattern || !pattern.trim() || /^[~\s]*$/.test(pattern.trim())) {
    return strudelString;
  }

  const scale = `${selectedKey}${octave}:${selectedScaleType}`;
  const calls = [`n("${pattern}")`, `scale("${scale}")`];
  const notePattern = calls.join('.');

  return strudelString ? `${strudelString}.${notePattern}` : notePattern;
};
