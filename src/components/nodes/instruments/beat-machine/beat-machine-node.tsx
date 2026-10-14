import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DRUM_CATEGORIES } from '@/data/sounds';
import { CategorySelectItems } from '@/components/nodes/shared/category-select-items';
import type { CustomControlsProps } from '../../define-node';
import type { BeatMachineData } from './beat-machine';
import { createDefaultRows, DEFAULT_STEPS } from './beat-machine';
import type { BeatMachineRow } from './beat-machine';
import { Switch } from '@/components/ui/switch';
import { AccordionControls } from '@/components/nodes/shared/accordion-controls';
import { Stepper } from '@/components/nodes/shared/stepper';
import { CellState, ModifierDropdown } from '../../shared/modifiers';

function SequencerRow({
  row,
  rowIndex,
  onStepClick,
  onInstrumentChange,
  onModifierSelect,
  showModifiers,
}: {
  row: BeatMachineRow;
  rowIndex: number;
  onStepClick: (rowIndex: number, step: number) => void;
  onInstrumentChange: (rowIndex: number, instrument: string) => void;
  onModifierSelect: (
    rowIndex: number,
    stepIdx: number,
    modifier: CellState,
  ) => void;
  showModifiers: boolean;
}) {
  return (
    <div className="relative flex w-max items-start gap-2">
      <Select
        value={row.instrument}
        onValueChange={(instrument) => onInstrumentChange(rowIndex, instrument)}
      >
        <SelectTrigger
          aria-label={`Track ${rowIndex + 1} instrument`}
          className="nodrag w-28 shrink-0 h-11! text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <CategorySelectItems categories={DRUM_CATEGORIES} />
        </SelectContent>
      </Select>
      <div className="flex gap-1">
        {row.pattern.map((isActive, step) => {
          const startsBeat = step > 0 && step % 4 === 0;
          return (
            <div
              key={step}
              className={`flex w-12 shrink-0 flex-col items-center gap-1 ${startsBeat ? 'ml-2' : ''}`}
            >
              <button
                type="button"
                aria-label={`Track ${rowIndex + 1}, step ${step + 1}`}
                aria-pressed={isActive}
                onClick={() => onStepClick(rowIndex, step)}
                className={`nodrag h-11 w-12 shrink-0 rounded-md border font-mono text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted text-muted-foreground hover:border-muted-foreground/60 hover:bg-accent'
                }`}
              ></button>
              {showModifiers && (
                <ModifierDropdown
                  currentState={row.modifiers?.[step] || { type: 'off' }}
                  onModifierSelect={(modifier) =>
                    onModifierSelect(rowIndex, step, modifier)
                  }
                  modifierGroups={{
                    Speed: [
                      { value: '*2', label: '*2' },
                      { value: '*3', label: '*3' },
                      { value: '*4', label: '*4' },
                    ],
                    Elongate: [
                      { value: '@2', label: '@2' },
                      { value: '@3', label: '@3' },
                      { value: '@4', label: '@4' },
                    ],
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BeatMachineNode({
  values: data,
  onChange,
}: CustomControlsProps<BeatMachineData>) {
  const modifiersEnabled =
    typeof data.modifiersEnabled === 'boolean' ? data.modifiersEnabled : false;

  const steps =
    typeof data.steps === 'number'
      ? data.steps
      : data.rows?.[0]?.pattern.length || DEFAULT_STEPS;

  const rows = (data.rows || createDefaultRows(steps)).map((row) => {
    return {
      ...row,
      pattern:
        Array.isArray(row.pattern) && row.pattern.length === steps
          ? row.pattern
          : Array(steps).fill(false),
      modifiers: row.modifiers ?? {},
    };
  });

  const setSteps = (newSteps: number) => {
    if (newSteps < 1 || newSteps > 32) return;
    const newRows = rows.map((row) => {
      let newPattern = row.pattern.slice(0, newSteps);
      if (newPattern.length < newSteps) {
        newPattern = newPattern.concat(
          Array(newSteps - newPattern.length).fill(false),
        );
      }
      const newModifiers: { [stepIdx: number]: CellState } = {};
      Object.entries(row.modifiers).forEach(([k, v]) => {
        const idx = Number(k);
        if (idx < newSteps) newModifiers[idx] = v;
      });
      return { ...row, pattern: newPattern, modifiers: newModifiers };
    });
    onChange({ steps: newSteps, rows: newRows });
  };

  const addTrack = () => {
    const newRows = [
      ...rows,
      {
        instrument: 'bd',
        pattern: Array(steps).fill(false),
        modifiers: {},
      },
    ];
    onChange({ rows: newRows });
  };
  const removeTrack = () => {
    if (rows.length <= 1) return;
    const newRows = rows.slice(0, -1);
    onChange({ rows: newRows });
  };

  const setModifiersEnabled = (enabled: boolean) => {
    onChange({ modifiersEnabled: enabled });
  };

  const toggleStep = (rowIndex: number, step: number) => {
    const newRows = rows.map((row, rIndex) => {
      if (rIndex === rowIndex) {
        const newPattern = row.pattern.map((val, pIndex) =>
          pIndex === step ? !val : val,
        );
        return { ...row, pattern: newPattern };
      }
      return row;
    });
    onChange({ rows: newRows });
  };

  const handleInstrumentChange = (rowIndex: number, instrument: string) => {
    onChange({
      rows: rows.map((row, index) =>
        index === rowIndex ? { ...row, instrument } : row,
      ),
    });
  };

  const handleModifierSelect = (
    rowIndex: number,
    stepIdx: number,
    modifier: CellState,
  ) => {
    const newRows = rows.map((row, rIndex) => {
      const modifiers = row.modifiers || {};
      if (rIndex === rowIndex) {
        const newModifiers: Record<number, CellState> = { ...modifiers };
        if (modifier.type === 'off') {
          delete newModifiers[stepIdx];
        } else {
          newModifiers[stepIdx] = modifier;
        }
        return { ...row, modifiers: newModifiers };
      }
      return { ...row, modifiers };
    });
    onChange({ rows: newRows });
  };

  return (
    <div className="flex w-max flex-col gap-1 px-2 pt-1 pb-1">
      <div className="flex flex-col gap-2 rounded-md bg-background/40 p-2">
        {rows.map((row, index) => (
          <SequencerRow
            key={index}
            row={row}
            rowIndex={index}
            onStepClick={toggleStep}
            onInstrumentChange={handleInstrumentChange}
            onModifierSelect={handleModifierSelect}
            showModifiers={modifiersEnabled}
          />
        ))}
      </div>
      <AccordionControls>
        <div className="flex flex-wrap items-end gap-3">
          <Stepper
            label="Steps"
            value={steps}
            min={1}
            max={32}
            onChange={setSteps}
          />
          <Stepper
            label="Tracks"
            value={rows.length}
            min={1}
            max={Infinity}
            onChange={(value) =>
              value > rows.length ? addTrack() : removeTrack()
            }
          />
          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Modifiers
            </span>
            <span className="flex h-10 items-center">
              <Switch
                checked={modifiersEnabled}
                onCheckedChange={setModifiersEnabled}
                aria-label="Toggle modifiers"
              />
            </span>
          </label>
        </div>
      </AccordionControls>
    </div>
  );
}
