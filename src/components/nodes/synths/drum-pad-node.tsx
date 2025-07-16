import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { DRUM_OPTIONS } from '@/data/sound-options';
import {
  useStepManagement,
  useStepSequencerState,
  DEFAULT_CLICK_SEQUENCE,
  getNextCellState,
  getCellStateDisplay,
  getCellStateColor,
  createButtonKey,
  getButtonGroupIndex,
  createGroupsFromSelection,
  clearSelectionForStep,
  getButtonClasses,
  generateStepPattern,
} from './shared';

const generateTracks = () => Array.from({ length: 8 }, (_, i) => i);

export function DrumPadNode({ id, data }: WorkflowNodeProps) {
  const [tracks] = useState(generateTracks());
  const { steps, setSteps } = useStepManagement(4);
  const {
    selectedSounds,
    setSelectedSounds,
    selectedButtons,
    setSelectedButtons,
    soundGroups,
    setSoundGroups,
    rowModifiers,
    setRowModifiers,
  } = useStepSequencerState(steps);
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Toggle a sound at a step
  const toggleCell = (
    stepIdx: number,
    trackIdx: number,
    event?: React.MouseEvent
  ) => {
    const buttonKey = createButtonKey(stepIdx, trackIdx);

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
          soundGroups
        );
        if (newGroups !== soundGroups) {
          setSoundGroups(newGroups);
          console.log('Sound group created:', { stepIdx, newGroups });

          // Clear selection for this step
          return clearSelectionForStep(newSelected, stepIdx);
        }

        return newSelected;
      });
    } else {
      // Normal click: cycle through sounds, with wraparound to "off"
      setSelectedSounds((prev) => {
        const currentSoundIndex = prev[buttonKey] ?? -1;
        const nextSoundIndex = currentSoundIndex + 1;

        if (nextSoundIndex >= DRUM_OPTIONS.length) {
          // Reached end of sounds, turn off
          const next = { ...prev };
          delete next[buttonKey];
          return next;
        } else {
          // Go to next sound
          return { ...prev, [buttonKey]: nextSoundIndex };
        }
      });
    }
  };

  // Check if a button is selected
  const isButtonSelected = (stepIdx: number, trackIdx: number): boolean => {
    return selectedButtons.has(createButtonKey(stepIdx, trackIdx));
  };

  // Handle row modifier click - cycle through DEFAULT_CLICK_SEQUENCE
  const handleRowModifierClick = (stepIdx: number) => {
    setRowModifiers((prev) => {
      const next = [...prev];
      const currentState = next[stepIdx];
      const nextState = getNextCellState(currentState, DEFAULT_CLICK_SEQUENCE);
      next[stepIdx] = nextState;
      return next;
    });
  };

  // Update strudel whenever selectedSounds, soundGroups, or rowModifiers changes
  useEffect(() => {
    const pattern = generateStepPattern(
      steps,
      tracks,
      selectedSounds,
      soundGroups,
      rowModifiers,
      DRUM_OPTIONS
    );

    console.log('Sounds pattern:', pattern);
    updateNode(id, { sound: pattern });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSounds, soundGroups, rowModifiers, steps, tracks.length]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-2 p-3 bg-card text-card-foreground rounded-md">
        <div className="flex flex-col gap-1">
          {Array.from({ length: steps }, (_, stepIdx) => (
            <div key={stepIdx} className="flex gap-1 items-center">
              {tracks.map((_, trackIdx) => {
                const buttonKey = createButtonKey(stepIdx, trackIdx);
                const isSelected = isButtonSelected(stepIdx, trackIdx);
                const groupIndex = getButtonGroupIndex(
                  stepIdx,
                  trackIdx,
                  soundGroups
                );
                const isInGroup = groupIndex >= 0;
                const soundIndex = selectedSounds[buttonKey];
                const hasSound = soundIndex !== undefined;

                const buttonClass = getButtonClasses(
                  isSelected,
                  isInGroup,
                  groupIndex,
                  hasSound
                );

                // Button content: show sound name
                const buttonContent = hasSound
                  ? DRUM_OPTIONS[soundIndex].slice(0, 4) // Truncate to fit button
                  : '';

                return (
                  <button
                    key={trackIdx}
                    className={buttonClass}
                    onClick={(event) => toggleCell(stepIdx, trackIdx, event)}
                    title={hasSound ? DRUM_OPTIONS[soundIndex] : undefined}
                  >
                    {buttonContent}
                  </button>
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

                {/* Clear controls */}
                <div className="flex flex-wrap gap-2 items-center">
                  {Object.keys(soundGroups).some(
                    (stepIdx) => soundGroups[parseInt(stepIdx)].length > 0
                  ) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => setSoundGroups({})}
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

                  {Object.keys(selectedSounds).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => setSelectedSounds({})}
                    >
                      Clear All Sounds
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

DrumPadNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const sound = config?.sound;

  if (!sound) return strudelString;

  const quotedSound = `"${sound}"`;
  return strudelString ? `${strudelString}.sound(${quotedSound})` : `sound(${quotedSound})`;
};
