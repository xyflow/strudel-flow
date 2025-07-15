import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { KEY_OPTIONS, SCALE_TYPE_OPTIONS } from '@/data/sound-options';
import {
  useStepManagement,
  useGridAsStepSequencer,
  PAD_CLICK_SEQUENCE,
  getNextCellState,
  getCellStateDisplay,
  getCellStateColor,
  createButtonKey,
  getButtonGroupIndex,
  createGroupsFromSelection,
  clearSelectionForStep,
  getButtonClasses,
  generateGridPattern,
} from './shared';

const generateNotes = () => [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`];

export function PadNode({ id, data }: WorkflowNodeProps) {
  const [notes] = useState(generateNotes());
  const { steps, setSteps } = useStepManagement(4);
  const [mode, setMode] = useState<'arp' | 'chord'>('arp');
  const [octave, setOctave] = useState(4);
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScaleType, setSelectedScaleType] = useState('major');
  const updateNode = useStrudelStore((state) => state.updateNode);

  const {
    grid,
    setGrid,
    selectedButtons,
    setSelectedButtons,
    soundGroups: noteGroups,
    setSoundGroups: setNoteGroups,
    rowModifiers,
    setRowModifiers,
  } = useGridAsStepSequencer(steps, notes.length);

  // Toggle a note at a step
  const toggleCell = (
    stepIdx: number,
    noteIdx: number,
    event?: React.MouseEvent
  ) => {
    const buttonKey = createButtonKey(stepIdx, noteIdx);

    if (event?.shiftKey) {
      // Shift+click: toggle selection for grouping
      setSelectedButtons((prev) => {
        const newSelected = new Set(prev);
        if (newSelected.has(buttonKey)) {
          newSelected.delete(buttonKey);
        } else {
          newSelected.add(buttonKey);
        }

        // Auto-create groups when we have 2 or more selected buttons in the same step
        const newGroups = createGroupsFromSelection(
          newSelected,
          stepIdx,
          noteGroups
        );
        if (newGroups !== noteGroups) {
          setNoteGroups(newGroups);
          console.log('Note group created:', { stepIdx, newGroups });

          // Clear selection for this step
          return clearSelectionForStep(newSelected, stepIdx);
        }

        return newSelected;
      });
    } else {
      // Normal click: toggle the note
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[stepIdx][noteIdx] = !next[stepIdx][noteIdx];
        return next;
      });
    }
  };

  // Check if a button is selected
  const isButtonSelected = (stepIdx: number, noteIdx: number): boolean => {
    return selectedButtons.has(createButtonKey(stepIdx, noteIdx));
  };

  // Handle row modifier click - cycle through PAD_CLICK_SEQUENCE
  const handleRowModifierClick = (stepIdx: number) => {
    setRowModifiers((prev) => {
      const next = [...prev];
      const currentState = next[stepIdx];
      const nextState = getNextCellState(currentState, PAD_CLICK_SEQUENCE);
      next[stepIdx] = nextState;
      return next;
    });
  };

  // Combine octave, key and scale type to create final scale string
  const getFinalScale = () => {
    return `${selectedKey}${octave}:${selectedScaleType}`;
  };

  // Update strudel whenever grid, rowModifiers, or noteGroups changes
  useEffect(() => {
    const pattern = generateGridPattern(
      grid,
      noteGroups,
      rowModifiers,
      notes,
      mode
    );

    // Only include scale if there are actual notes (not empty)
    const nodeUpdate: { notes: string; scale?: string } = { notes: pattern };
    if (pattern && pattern.trim() && !/^[~\s]*$/.test(pattern.trim())) {
      const finalScale = getFinalScale();
      nodeUpdate.scale = finalScale;
    } else {
      // Explicitly clear the scale when no notes are present
      updateNode(id, { notes: pattern, scale: undefined });
      return;
    }

    updateNode(id, nodeUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    grid,
    rowModifiers,
    noteGroups,
    notes,
    mode,
    octave,
    selectedKey,
    selectedScaleType,
  ]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-2 p-3 bg-card text-card-foreground rounded-md">
        <div className="flex flex-col gap-1">
          {grid.map((row, stepIdx) => (
            <div key={stepIdx} className="flex gap-1 items-center">
              {row.map((on, noteIdx) => {
                const isSelected = isButtonSelected(stepIdx, noteIdx);
                const groupIndex = getButtonGroupIndex(
                  stepIdx,
                  noteIdx,
                  noteGroups
                );
                const isInGroup = groupIndex >= 0;

                const buttonClass = getButtonClasses(
                  isSelected,
                  isInGroup,
                  groupIndex,
                  on
                );

                return (
                  <button
                    key={noteIdx}
                    className={buttonClass}
                    onClick={(event) => toggleCell(stepIdx, noteIdx, event)}
                  />
                );
              })}
              {/* Row modifier button */}
              <button
                className={`w-12 h-11 font-mono rounded-md transition-all duration-200 shadow-sm ${getCellStateColor(
                  rowModifiers[stepIdx]
                )} ring-1 ring-offset-1 ring-primary/20 hover:shadow-md active:shadow-inner active:bg-opacity-80`}
                onClick={() => handleRowModifierClick(stepIdx)}
                title="Click to cycle through effects"
              >
                {getCellStateDisplay(rowModifiers[stepIdx])}
              </button>
            </div>
          ))}
        </div>

        {/* Controls Accordion */}
        <Accordion type="single" collapsible>
          <AccordionItem value="controls">
            <AccordionTrigger className="text-xs font-mono py-2">
              Controls
            </AccordionTrigger>
            <AccordionContent className="overflow-hidden">
              <div className="flex flex-col gap-2 text-xs font-mono w-full">
                {/* Row 1 */}
                <div className="flex flex-wrap gap-2">
                  {/* Key selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Key:</span>
                    <Select value={selectedKey} onValueChange={setSelectedKey}>
                      <SelectTrigger className="w-16 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KEY_OPTIONS.map((key) => (
                          <SelectItem key={key.value} value={key.value}>
                            {key.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scale type selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Scale:</span>
                    <Select
                      value={selectedScaleType}
                      onValueChange={setSelectedScaleType}
                    >
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCALE_TYPE_OPTIONS.map((scaleType) => (
                          <SelectItem
                            key={scaleType.value}
                            value={scaleType.value}
                          >
                            {scaleType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Octave control */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Oct: {octave}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setOctave((prev) => Math.max(prev - 1, 2))}
                    >
                      -
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setOctave((prev) => Math.min(prev + 1, 8))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex flex-wrap gap-2">
                  {/* Steps control */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Steps: {steps}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0"
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

                  {/* Mode toggle */}
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

                {/* Row 3 - Group Management */}
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
