/**
 * Shared UI components for synth nodes
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface StepControlsProps {
  steps: number;
  onStepsChange: (steps: number) => void;
  maxSteps?: number;
  minSteps?: number;
}

export function StepControls({ 
  steps, 
  onStepsChange, 
  maxSteps = 16, 
  minSteps = 1 
}: StepControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs">Steps: {steps}</span>
      <Button
        variant="secondary"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => onStepsChange(Math.max(steps - 1, minSteps))}
      >
        -
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => onStepsChange(Math.min(steps + 1, maxSteps))}
      >
        +
      </Button>
    </div>
  );
}

interface ClearControlsProps {
  onClearGroups?: () => void;
  onClearSelection?: () => void;
  onClearSounds?: () => void;
  hasGroups?: boolean;
  hasSelection?: boolean;
  hasSounds?: boolean;
}

export function ClearControls({
  onClearGroups,
  onClearSelection,
  onClearSounds,
  hasGroups = false,
  hasSelection = false,
  hasSounds = false,
}: ClearControlsProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {hasGroups && onClearGroups && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={onClearGroups}
        >
          Clear All Groups
        </Button>
      )}

      {hasSelection && onClearSelection && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={onClearSelection}
        >
          Clear Selection
        </Button>
      )}

      {hasSounds && onClearSounds && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={onClearSounds}
        >
          Clear All Sounds
        </Button>
      )}
    </div>
  );
}

interface ControlAccordionProps {
  title?: string;
  children: React.ReactNode;
}

export function ControlAccordion({ title = "Controls", children }: ControlAccordionProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="controls">
        <AccordionTrigger className="text-xs font-mono py-2">
          {title}
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden">
          <div className="flex flex-col gap-2 text-xs font-mono w-full">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
