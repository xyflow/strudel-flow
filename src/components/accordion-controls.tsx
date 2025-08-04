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
}: KeyScaleOctaveControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {showKey && (
        <div className="flex items-center gap-1">
          <span className="text-xs">Key:</span>
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
          <span className="text-xs">Scale:</span>
          <Select value={selectedScale} onValueChange={onScaleChange}>
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue placeholder="Scale" />
            </SelectTrigger>
            <SelectContent>
              {SCALE_TYPE_OPTIONS.map((scaleType) => (
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
          <span className="text-xs">Oct: {octave} </span>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 w-7 p-0 ml-2"
            onClick={() => onOctaveChange(Math.max(octave - 1, 1))}
          >
            -
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onOctaveChange(Math.min(octave + 1, 8))}
          >
            +
          </Button>
        </div>
      )}
    </div>
  );
}

interface AccordionControlsProps {
  triggerText: string;
  children: React.ReactNode;
  keyScaleOctaveProps?: KeyScaleOctaveControlsProps;
}

export const AccordionControls: React.FC<AccordionControlsProps> = ({
  triggerText,
  children,
  keyScaleOctaveProps,
}) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="controls">
        <AccordionTrigger className="text-xs font-mono py-2">
          {triggerText}
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden">
          <div className="flex flex-col gap-3">
            {keyScaleOctaveProps && (
              <KeyScaleOctaveControls {...keyScaleOctaveProps} />
            )}
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
