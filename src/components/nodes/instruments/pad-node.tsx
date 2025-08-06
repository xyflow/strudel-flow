import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';

import { applyRowModifier, CellState } from './pad-utils';
import { PadButton } from './pad-utils/pad-button';
import { AccordionControls } from '@/components/accordion-controls';

const generateNotes = () => [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`];

export function PadNode({ id, data, type }: WorkflowNodeProps) {
  const [notes] = useState(generateNotes());
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const updateNode = useStrudelStore((state) => state.updateNode);

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
  const toggleCell = (stepIdx: number, noteIdx: number) => {
    const newGrid = grid.map((row) => [...row]);
    newGrid[stepIdx][noteIdx] = !newGrid[stepIdx][noteIdx];
    updateNodeData(id, { grid: newGrid });
  };

  const getButtonModifier = (stepIdx: number, noteIdx: number) => {
    return buttonModifiers[`${stepIdx}-${noteIdx}`] || { type: 'none' };
  };

  const handleModifierSelect = (
    stepIdx: number,
    noteIdx: number,
    modifier: CellState
  ) => {
    const newModifiers = {
      ...buttonModifiers,
      [`${stepIdx}-${noteIdx}`]: modifier,
    };
    updateNodeData(id, { buttonModifiers: newModifiers });
  };

  const isButtonSelected = (stepIdx: number, noteIdx: number) => {
    return selectedButtons.has(`${stepIdx}-${noteIdx}`);
  };

  // Generate pattern whenever relevant data changes
  useEffect(() => {
    const getModifier = (stepIdx: number, noteIdx: number) => {
      return buttonModifiers[`${stepIdx}-${noteIdx}`] || { type: 'none' };
    };

    const stepPatterns = grid.map((row, stepIdx) => {
      const individualNotes = row
        .map((on, noteIdx) => {
          if (!on) return null;
          const note = notes[noteIdx];
          const modifier = getModifier(stepIdx, noteIdx);
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

      const separator = mode === 'arp' ? ' ' : ', ';
      const notesPattern = allPatterns.join(separator);
      return `[${notesPattern}]`;
    });

    const pattern = stepPatterns.filter(Boolean).join(' ');
    const finalScale = `${selectedKey}${octave}:${selectedScaleType}`;

    updateNode(id, {
      notes: pattern,
      scale:
        pattern && pattern.trim() && !/^[~\s]*$/.test(pattern.trim())
          ? finalScale
          : undefined,
    });
  }, [
    grid,
    buttonModifiers,
    noteGroups,
    notes,
    mode,
    octave,
    selectedKey,
    selectedScaleType,
    id,
    updateNode,
  ]);

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
            triggerText="Controls"
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
  const notes = useStrudelStore.getState().config[node.id]?.notes;
  const scale = useStrudelStore.getState().config[node.id]?.scale;

  if (!notes) return strudelString;

  const calls = [];
  calls.push(`n("${notes}")`);
  if (scale) calls.push(`scale("${scale}")`);

  const notePattern = calls.join('.');
  return strudelString ? `${strudelString}.${notePattern}` : notePattern;
};
