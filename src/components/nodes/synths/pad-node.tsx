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
  createButtonKey,
  getButtonGroupIndex,
  createGroupsFromSelection,
  clearSelectionForStep,
  getButtonClasses,
  getCellStateDisplay,
  applyRowModifier,
  ModifierContextMenu,
  CellState,
} from './shared';

const generateNotes = () => [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`];

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
  } = useGridAsStepSequencer(steps, notes.length);

  // Individual button modifiers - instead of row modifiers
  const [buttonModifiers, setButtonModifiers] = useState<
    Record<string, CellState>
  >({});

  // Get modifier state for a specific button
  const getButtonModifier = (stepIdx: number, noteIdx: number): CellState => {
    const key = createButtonKey(stepIdx, noteIdx);
    return buttonModifiers[key] || { type: 'off' };
  };

  // Set modifier state for a specific button
  const setButtonModifier = (
    stepIdx: number,
    noteIdx: number,
    state: CellState
  ) => {
    const key = createButtonKey(stepIdx, noteIdx);
    setButtonModifiers((prev) => ({
      ...prev,
      [key]: state,
    }));
  };

  // Handle context menu for button modifiers
  const handleModifierSelect = (
    stepIdx: number,
    noteIdx: number,
    modifier: CellState
  ) => {
    // Set the modifier
    setButtonModifier(stepIdx, noteIdx, modifier);

    // Also turn on the button if it's not already on (but only if modifier is not 'off')
    if (modifier.type !== 'off') {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        if (!next[stepIdx][noteIdx]) {
          next[stepIdx][noteIdx] = true;
        }
        return next;
      });
    }
  };

  // Get display text for a button with modifier
  const getButtonDisplayText = (stepIdx: number, noteIdx: number): string => {
    const modifier = getButtonModifier(stepIdx, noteIdx);
    return getCellStateDisplay(modifier);
  };

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
        const wasOn = next[stepIdx][noteIdx];
        next[stepIdx][noteIdx] = !next[stepIdx][noteIdx];

        // If turning off the button, also clear its modifier
        if (wasOn && !next[stepIdx][noteIdx]) {
          setButtonModifier(stepIdx, noteIdx, { type: 'off' });
        }

        return next;
      });
    }
  };

  // Check if a button is selected
  const isButtonSelected = (stepIdx: number, noteIdx: number): boolean => {
    return selectedButtons.has(createButtonKey(stepIdx, noteIdx));
  };

  // Handle row modifier click - REMOVED: No longer needed as we use individual button modifiers

  // Combine octave, key and scale type to create final scale string
  const getFinalScale = () => {
    return `${selectedKey}${octave}:${selectedScaleType}`;
  };

  // Update strudel whenever grid, buttonModifiers, or noteGroups changes
  useEffect(() => {
    // Custom pattern generation using individual button modifiers
    const stepPatterns = grid.map((row, stepIdx) => {
      // Get active individual notes with their modifiers
      const individualNotes = row
        .map((on, noteIdx) => {
          if (!on) return null;
          const note = notes[noteIdx];
          const modifier = getButtonModifier(stepIdx, noteIdx);
          return applyRowModifier(note, modifier);
        })
        .filter(Boolean);

      // Get groups for this step and convert to patterns
      const stepGroups = noteGroups[stepIdx] || [];
      const groupPatterns = stepGroups.map((group) => {
        const groupNoteValues = group.map((noteIdx) => notes[noteIdx]);
        return `<${groupNoteValues.join(' ')}>`;
      });

      // Combine individual notes and groups
      const allPatterns = [...individualNotes, ...groupPatterns];

      if (allPatterns.length === 0) return '';

      // Both modes use brackets, but different separators
      const separator = mode === 'arp' ? ' ' : ', ';
      const notesPattern = allPatterns.join(separator);
      return `[${notesPattern}]`;
    });

    // Filter out empty patterns and join with spaces
    const pattern = stepPatterns.filter(Boolean).join(' ');

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
    buttonModifiers,
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
                const modifier = getButtonModifier(stepIdx, noteIdx);
                const hasModifier =
                  modifier.type !== 'off' && modifier.type !== 'normal';
                const modifierText = getButtonDisplayText(stepIdx, noteIdx);

                const buttonClass = getButtonClasses(
                  isSelected,
                  isInGroup,
                  groupIndex,
                  on
                );

                const finalClass = buttonClass;

                return (
                  <ModifierContextMenu
                    key={`${stepIdx}-${noteIdx}`}
                    currentState={modifier}
                    onModifierSelect={(newModifier) =>
                      handleModifierSelect(stepIdx, noteIdx, newModifier)
                    }
                    label="Note Modifiers"
                  >
                    <button
                      className={finalClass}
                      onClick={(event) => toggleCell(stepIdx, noteIdx, event)}
                      title={
                        hasModifier
                          ? `Modified: ${modifier.type} - Right-click to change`
                          : 'Right-click for modifier options'
                      }
                    >
                      {modifierText}
                    </button>
                  </ModifierContextMenu>
                );
              })}
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
                    <span className="text-xs">Oct: {octave} </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0 ml-2"
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
