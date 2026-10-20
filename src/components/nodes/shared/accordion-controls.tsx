import type { ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Stepper } from './stepper';
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
import { KEY_OPTIONS, SCALE_TYPE_OPTIONS } from '@/data/sounds';

interface KeyScaleOctaveControlsProps {
  selectedKey: string;
  onKeyChange: (key: string) => void;
  selectedScale: string;
  onScaleChange: (scale: string) => void;
  octave: number;
  onOctaveChange: (octave: number) => void;
  allowedScales?: string[];
}

interface PadControlsProps {
  steps: number;
  onStepsChange: (steps: number) => void;
  mode: 'arp' | 'chord';
  onModeChange: (mode: 'arp' | 'chord') => void;
}

const fieldLabel = 'text-[11px] font-medium text-muted-foreground';
const fieldTrigger =
  'nodrag h-10! w-full rounded-md border-border bg-background/60 px-3 text-[13px] font-medium tracking-normal hover:border-primary/50 dark:bg-background/40 dark:hover:bg-background/60';
const optionStyle =
  'rounded-md py-2 text-[13px] tracking-normal data-[state=checked]:bg-primary/10 data-[state=checked]:text-foreground';

function KeyScaleOctaveControls({
  selectedKey,
  onKeyChange,
  selectedScale,
  onScaleChange,
  octave,
  onOctaveChange,
  allowedScales,
}: KeyScaleOctaveControlsProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-18 flex-1 space-y-1.5">
        <div className={fieldLabel}>Key</div>
        <Select value={selectedKey} onValueChange={onKeyChange}>
          <SelectTrigger aria-label="Key" className={fieldTrigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="font-sans tracking-normal">
            {KEY_OPTIONS.map((key) => (
              <SelectItem
                key={key.value}
                value={key.value}
                className={optionStyle}
              >
                {key.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-32 flex-[2] space-y-1.5">
        <div className={fieldLabel}>Scale</div>
        <Select value={selectedScale} onValueChange={onScaleChange}>
          <SelectTrigger aria-label="Scale" className={fieldTrigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72 font-sans tracking-normal">
            {SCALE_TYPE_OPTIONS.filter(
              (scale) => !allowedScales || allowedScales.includes(scale.value),
            ).map((scale) => (
              <SelectItem
                key={scale.value}
                value={scale.value}
                className={optionStyle}
              >
                {scale.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-28 flex-1">
        <Stepper
          label="Octave"
          value={octave}
          min={1}
          max={8}
          onChange={onOctaveChange}
        />
      </div>
    </div>
  );
}

function PadControls({
  steps,
  onStepsChange,
  mode,
  onModeChange,
}: PadControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-28 flex-1">
          <Stepper
            label="Steps"
            value={steps}
            min={1}
            max={16}
            onChange={onStepsChange}
          />
        </div>
        <div className="min-w-36 flex-[2] space-y-1.5">
          <div className={fieldLabel}>Mode</div>
          <div
            role="group"
            aria-label="Pad mode"
            className="flex h-10 gap-1 rounded-md border border-border bg-background/60 p-1"
          >
            {(['arp', 'chord'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => onModeChange(option)}
                className="nodrag flex-1 rounded-sm px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-primary/15 aria-pressed:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                {option === 'arp' ? 'Arp' : 'Chord'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AccordionControlsProps {
  children?: ReactNode;
  keyScaleOctaveProps?: KeyScaleOctaveControlsProps;
  padControlsProps?: PadControlsProps;
}

export function AccordionControls({
  children,
  keyScaleOctaveProps,
  padControlsProps,
}: AccordionControlsProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full font-sans tracking-normal"
    >
      <AccordionItem value="controls" className="border-none">
        <AccordionTrigger className="nodrag items-center py-2 text-xs font-normal tracking-normal text-muted-foreground hover:text-foreground hover:no-underline">
          <span className="flex min-w-0 items-center gap-2">
            <SlidersHorizontal className="size-3.5 shrink-0" />
            {keyScaleOctaveProps ? (
              <>
                <span className="rounded border border-border bg-background/50 px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                  {keyScaleOctaveProps.selectedKey}
                  {keyScaleOctaveProps.octave}
                </span>
                <span className="truncate">
                  {SCALE_TYPE_OPTIONS.find(
                    (scale) =>
                      scale.value === keyScaleOctaveProps.selectedScale,
                  )?.label ?? keyScaleOctaveProps.selectedScale}
                </span>
                {padControlsProps && (
                  <span className="shrink-0 text-[11px]">
                    · {padControlsProps.steps} steps
                  </span>
                )}
              </>
            ) : (
              'Shape'
            )}
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-2">
          <div className="nodrag flex w-0 min-w-full flex-col gap-3 border-t border-border/70 pt-3">
            {keyScaleOctaveProps && (
              <KeyScaleOctaveControls {...keyScaleOctaveProps} />
            )}
            {padControlsProps && <PadControls {...padControlsProps} />}
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
