import { useState, useEffect, useCallback } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import {
  useStepManagement,
  applyRowModifier,
  CellState,
  usePadGrid,
} from './pad-utils';
import { PadButton } from './pad-utils/pad-button';
import { AccordionControls } from '@/components/accordion-controls';

const generateNotes = () => [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`];

interface PadNodeInternalState {
  steps: number;
  mode: 'arp' | 'chord';
  octave: number;
  selectedKey: string;
  selectedScaleType: string;
  grid: boolean[][];
  buttonModifiers: Record<string, CellState>;
  selectedButtons: string[];
  noteGroups: Record<number, number[][]>;
}

export function PadNode({ id, data }: WorkflowNodeProps) {
  const [notes] = useState(generateNotes());
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const savedInternalState = (data as { internalState?: PadNodeInternalState })
    ?.internalState;

  const { steps, setSteps } = useStepManagement(savedInternalState?.steps || 4);
  const [mode, setMode] = useState<'arp' | 'chord'>(
    savedInternalState?.mode || 'arp'
  );
  const [octave, setOctave] = useState(savedInternalState?.octave || 4);
  const [selectedKey, setSelectedKey] = useState(
    savedInternalState?.selectedKey || 'C'
  );
  const [selectedScaleType, setSelectedScaleType] = useState(
    savedInternalState?.selectedScaleType || 'major'
  );
  const updateNode = useStrudelStore((state) => state.updateNode);

  const {
    grid,
    noteGroups,
    selectedButtons,
    buttonModifiers,
    getButtonModifier,
    handleModifierSelect,
    toggleCell,
    isButtonSelected,
    setNoteGroups,
    setSelectedButtons,
  } = usePadGrid(steps, notes, savedInternalState);

  useEffect(() => {
    const internalState: PadNodeInternalState = {
      steps,
      mode,
      octave,
      selectedKey,
      selectedScaleType,
      grid: grid.map((row) => [...row]),
      buttonModifiers,
      selectedButtons: Array.from(selectedButtons),
      noteGroups,
    };

    updateNodeData(id, { internalState });
  }, [
    steps,
    mode,
    octave,
    selectedKey,
    selectedScaleType,
    grid,
    buttonModifiers,
    selectedButtons,
    noteGroups,
    id,
    updateNodeData,
  ]);

  const getFinalScale = useCallback(() => {
    return `${selectedKey}${octave}:${selectedScaleType}`;
  }, [selectedKey, octave, selectedScaleType]);

  useEffect(() => {
    const stepPatterns = grid.map((row, stepIdx) => {
      const individualNotes = row
        .map((on, noteIdx) => {
          if (!on) return null;
          const note = notes[noteIdx];
          const modifier = getButtonModifier(stepIdx, noteIdx);
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
    const nodeUpdate: { notes: string; scale?: string } = { notes: pattern };
    if (pattern && pattern.trim() && !/^[~\s]*$/.test(pattern.trim())) {
      const finalScale = getFinalScale();
      nodeUpdate.scale = finalScale;
    } else {
      updateNode(id, { notes: pattern, scale: undefined });
      return;
    }

    updateNode(id, nodeUpdate);
  }, [
    grid,
    buttonModifiers,
    noteGroups,
    notes,
    mode,
    octave,
    selectedKey,
    selectedScaleType,
    getButtonModifier,
    getFinalScale,
    id,
    updateNode,
  ]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-2 p-3 bg-card text-card-foreground rounded-md">
        <div className="flex flex-col gap-1">
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
        >
          <div className="flex flex-col gap-2 text-xs font-mono w-full">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs">Steps: {steps}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 w-7 p-0 ml-2"
                  onClick={() => setSteps((prev) => Math.max(prev - 1, 1))}
                >
                  -
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setSteps((prev) => Math.min(prev + 1, 16))}
                >
                  +
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">Mode:</span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() =>
                    setMode((prevMode) =>
                      prevMode === 'arp' ? 'chord' : 'arp'
                    )
                  }
                >
                  {mode === 'arp' ? 'Arp' : 'Chord'}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {Object.keys(noteGroups).some(
                (stepIdx) => noteGroups[parseInt(stepIdx)].length > 0
              ) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setNoteGroups({})}
                >
                  Clear All Groups
                </Button>
              )}
              {selectedButtons.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setSelectedButtons(new Set())}
                >
                  Clear Selection
                </Button>
              )}
            </div>
          </div>
        </AccordionControls>
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
