import { useState, useEffect, useMemo } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
import { useStepManagement } from './shared';

// Step states for arpeggiator pads
type StepState = { type: 'off' } | { type: 'note'; noteNumber: number };

// Default 16-step grid
const DEFAULT_STEPS = 16;

export function ArpeggiatorNode({ id, data }: WorkflowNodeProps) {
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScaleType, setSelectedScaleType] = useState('major');
  const [octave, setOctave] = useState(4);
  const { steps: numSteps, setSteps: setNumSteps } = useStepManagement(8);
  const updateNode = useStrudelStore((state) => state.updateNode);

  // State for each step pad
  const [stepStates, setStepStates] = useState<Record<number, StepState>>(
    () => {
      const initialStates: Record<number, StepState> = {};
      for (let i = 0; i < DEFAULT_STEPS; i++) {
        initialStates[i] = { type: 'off' };
      }
      return initialStates;
    }
  );

  // Generate pattern based on current step states
  const notePattern = useMemo(() => {
    const sequence: string[] = [];

    // Only process up to numSteps
    for (let i = 0; i < numSteps; i++) {
      const state = stepStates[i];

      if (state.type === 'off') {
        sequence.push('~');
      } else if (state.type === 'note') {
        sequence.push(state.noteNumber.toString());
      }
    }

    return sequence.join(' ');
  }, [stepStates, numSteps]);

  // Check if pattern has any notes
  const hasNotes = useMemo(() => {
    return /[0-9]/.test(notePattern);
  }, [notePattern]);

  // Handle step pad click - cycle through states
  const handleStepClick = (stepIndex: number) => {
    setStepStates((prev) => {
      const currentState = prev[stepIndex];
      let nextState: StepState;

      if (currentState.type === 'off') {
        // Off -> First note (0)
        nextState = { type: 'note', noteNumber: 0 };
      } else if (currentState.type === 'note') {
        const currentNoteNumber = currentState.noteNumber;

        if (currentNoteNumber < 9) {
          // Next note number (0-9)
          nextState = { type: 'note', noteNumber: currentNoteNumber + 1 };
        } else {
          // If at max note number, go back to off
          nextState = { type: 'off' };
        }
      } else {
        // Rest -> Off
        nextState = { type: 'off' };
      }

      return {
        ...prev,
        [stepIndex]: nextState,
      };
    });
  };

  // Get display text for step pad
  const getStepDisplay = (stepIndex: number) => {
    const state = stepStates[stepIndex];

    if (state.type === 'off') {
      return '';
    }

    if (state.type === 'note') {
      return state.noteNumber.toString();
    }

    return '';
  };

  // Get pad color based on state
  const getStepColor = (stepIndex: number) => {
    const state = stepStates[stepIndex];

    if (state.type === 'off') {
      return 'bg-muted text-muted-foreground border-border hover:bg-muted/70 hover:shadow-md';
    }

    if (state.type === 'note') {
      return 'bg-blue-500 hover:bg-blue-600 text-white border-border';
    }

    return 'bg-muted text-muted-foreground border-border hover:bg-muted/70';
  };

  // Update node when pattern changes
  useEffect(() => {
    // Only include scale if there are notes
    const nodeUpdate: { notes: string; scale?: string } = {
      notes: notePattern,
    };

    if (hasNotes) {
      const finalScale = `${selectedKey}${octave}:${selectedScaleType}`;
      nodeUpdate.scale = finalScale;
    }

    updateNode(id, nodeUpdate);
  }, [
    notePattern,
    hasNotes,
    id,
    updateNode,
    selectedKey,
    selectedScaleType,
    octave,
  ]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-4 bg-card text-card-foreground rounded-md min-w-80">
        {/* Step Grid */}
        <div className="space-y-2">
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: DEFAULT_STEPS }, (_, i) => {
              const stepDisplay = getStepDisplay(i);
              const stepColor = getStepColor(i);

              return (
                <Button
                  key={i}
                  className={`w-12 h-31 border transition-all duration-200 shadow-sm text-xs font-mono ${stepColor} hover:shadow-md active:shadow-inner active:bg-opacity-80 ${
                    i >= numSteps ? 'opacity-30' : ''
                  }`}
                  onClick={() => handleStepClick(i)}
                  title={`Step ${i + 1} - Click to cycle through notes/off${
                    i >= numSteps ? ' (inactive)' : ''
                  }`}
                  disabled={i >= numSteps}
                >
                  {stepDisplay}
                </Button>
              );
            })}
          </div>
          {/* Number of Steps */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Steps: {numSteps}</label>
            <Slider
              value={[numSteps]}
              onValueChange={(value) => setNumSteps(value[0])}
              min={1}
              max={16}
              step={1}
              className="w-full"
            />
          </div>
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </WorkflowNode>
  );
}
