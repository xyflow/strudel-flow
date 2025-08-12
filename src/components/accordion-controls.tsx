import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { KEY_OPTIONS, SCALE_TYPE_OPTIONS } from '@/data/sound-options';

export interface KeyScaleOctaveControlsProps {
  selectedKey: string;
  onKeyChange: (key: string) => void;
  selectedScale: string;
  onScaleChange: (scale: string) => void;
  octave: number;
  onOctaveChange: (octave: number) => void;
  showKey?: boolean;
  showScale?: boolean;
  showOctave?: boolean;
  allowedScales?: string[];
}

export interface PadControlsProps {
  steps: number;
  onStepsChange: (steps: number) => void;
  mode: 'arp' | 'chord';
  onModeChange: (mode: 'arp' | 'chord') => void;
  noteGroups: Record<number, number[][]>;
  onClearGroups: () => void;
  selectedButtons: Set<string>;
  onClearSelection: () => void;
}

export interface ChordControlsProps {
  chordComplexity: 'triad' | 'seventh' | 'ninth' | 'eleventh';
  onChordComplexityChange: (
    complexity: 'triad' | 'seventh' | 'ninth' | 'eleventh'
  ) => void;
}

function KeyScaleOctaveControls({
  selectedKey,
  onKeyChange,
  selectedScale,
  onScaleChange,
  octave,
  onOctaveChange,
  showKey = true,
  showScale = true,
  showOctave = true,
  allowedScales,
}: KeyScaleOctaveControlsProps) {
  return (
    <div className="flex flex-wrap gap-2 w-0 min-w-full">
      {showKey && (
        <div className="flex items-center gap-1">
          <span className="text-xs whitespace-nowrap">Key:</span>
          <Select value={selectedKey} onValueChange={onKeyChange}>
            <SelectTrigger className="w-16 h-7 text-xs">
              <SelectValue placeholder="Key" />
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
      )}
      {showScale && (
        <div className="flex items-center gap-1">
          <span className="text-xs whitespace-nowrap">Scale:</span>
          <Select value={selectedScale} onValueChange={onScaleChange}>
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue placeholder="Scale" />
            </SelectTrigger>
            <SelectContent>
              {SCALE_TYPE_OPTIONS.filter(
                (scaleType) =>
                  !allowedScales || allowedScales.includes(scaleType.value)
              ).map((scaleType) => (
                <SelectItem key={scaleType.value} value={scaleType.value}>
                  {scaleType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {showOctave && (
        <div className="flex items-center gap-1">
          <span className="text-xs whitespace-nowrap">Octave: </span>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 w-7 p-0 text-xs"
            onClick={() => onOctaveChange(Math.max(octave - 1, 1))}
          >
            -
          </Button>
          <span className="text-xs whitespace-nowrap border bg-background rounded px-2 py-1 min-w-[28px] text-center">
            {octave}
          </span>{' '}
          <Button
            variant="secondary"
            size="sm"
            className="h-7 w-7 p-0 text-xs"
            onClick={() => onOctaveChange(Math.min(octave + 1, 8))}
          >
            +
          </Button>
        </div>
      )}
    </div>
  );
}

function PadControls({
  steps,
  onStepsChange,
  mode,
  onModeChange,
  noteGroups,
  onClearGroups,
  selectedButtons,
  onClearSelection,
}: PadControlsProps) {
  return (
    <div className="flex flex-wrap gap-2 w-0 min-w-full">
      <div className="flex items-center gap-1">
        <span className="text-xs whitespace-nowrap">Steps: </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 w-7 p-0 text-xs"
          onClick={() => onStepsChange(Math.max(steps - 1, 1))}
        >
          -
        </Button>
        <span className="text-xs whitespace-nowrap border bg-background rounded px-2 py-1 min-w-[28px] text-center">
          {steps}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 w-7 p-0 text-xs"
          onClick={() => onStepsChange(Math.min(steps + 1, 16))}
        >
          +
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs whitespace-nowrap">Mode:</span>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={() => onModeChange(mode === 'arp' ? 'chord' : 'arp')}
        >
          {mode === 'arp' ? 'Arp' : 'Chord'}
        </Button>
      </div>
      {Object.keys(noteGroups).some(
        (stepIdx) => noteGroups[parseInt(stepIdx)].length > 0
      ) && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2 whitespace-nowrap"
          onClick={onClearGroups}
        >
          Clear Groups
        </Button>
      )}
      {selectedButtons.size > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2 whitespace-nowrap"
          onClick={onClearSelection}
        >
          Clear Selection
        </Button>
      )}
    </div>
  );
}

const CHORD_COMPLEXITY_OPTIONS = [
  { value: 'triad', label: 'Triad' },
  { value: 'seventh', label: '7th' },
  { value: 'ninth', label: '9th' },
  { value: 'eleventh', label: '11th' },
];

function ChordControls({
  chordComplexity,
  onChordComplexityChange,
}: ChordControlsProps) {
  return (
    <div className="flex flex-wrap gap-2 w-0 min-w-full">
      <div className="flex items-center gap-1">
        <span className="text-xs whitespace-nowrap">Complexity:</span>
        <Select value={chordComplexity} onValueChange={onChordComplexityChange}>
          <SelectTrigger className="w-20 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHORD_COMPLEXITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface AccordionControlsProps {
  children?: React.ReactNode;
  keyScaleOctaveProps?: KeyScaleOctaveControlsProps;
  padControlsProps?: PadControlsProps;
  chordControlsProps?: ChordControlsProps;
}

export const AccordionControls: React.FC<AccordionControlsProps> = ({
  children,
  keyScaleOctaveProps,
  padControlsProps,
  chordControlsProps,
}) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="controls" className="border-none">
        <AccordionTrigger className="text-xs font-mono py-2 px-0">
          Controls
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden">
          <div className="flex flex-col gap-2 w-0 min-w-full">
            {keyScaleOctaveProps && (
              <div className="w-0 min-w-full">
                <KeyScaleOctaveControls {...keyScaleOctaveProps} />
              </div>
            )}
            {padControlsProps && (
              <div className="w-0 min-w-full">
                <PadControls {...padControlsProps} />
              </div>
            )}
            {chordControlsProps && (
              <div className="w-0 min-w-full">
                <ChordControls {...chordControlsProps} />
              </div>
            )}
            {children && <div className="w-0 min-w-full">{children}</div>}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
