import { createDefaultRows, DEFAULT_STEPS } from './beat-machine';
import type { BeatMachineRow } from './beat-machine';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AccordionControls } from '@/components/accordion-controls';
import { CellState, ModifierDropdown } from '../modifiers';
import WorkflowNode from '@/components/nodes/workflow-node';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { DRUM_CATEGORIES } from '@/data/sounds';
import { CategorySelectItems } from '@/components/category-select-items';

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
    <div className="flex w-max items-start gap-3">
      <Select
        value={row.instrument}
        onValueChange={(instrument) => onInstrumentChange(rowIndex, instrument)}
      >
        <SelectTrigger className="w-28 shrink-0 h-11! text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <CategorySelectItems categories={DRUM_CATEGORIES} />
        </SelectContent>
      </Select>
      <div className="flex gap-1">
        {row.pattern.map((isActive, step) => {
          // Leave a little more space between groups of four steps.
          const startsBeat = step > 0 && step % 4 === 0;
          return (
            <div
              key={step}
              className={`flex w-12 shrink-0 flex-col items-center gap-1 ${startsBeat ? 'ml-2' : ''}`}
            >
              <button
                type="button"
                aria-label={`${row.instrument}, step ${step + 1}`}
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

export function BeatMachineNode({ id, data, type }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const modifiersEnabled =
    typeof data.modifiersEnabled === 'boolean' ? data.modifiersEnabled : false;

  const steps = typeof data.steps === 'number' ? data.steps : DEFAULT_STEPS;

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
    // Adjust all row patterns to new length
    const newRows = rows.map((row) => {
      let newPattern = row.pattern.slice(0, newSteps);
      if (newPattern.length < newSteps) {
        newPattern = newPattern.concat(
          Array(newSteps - newPattern.length).fill(false),
        );
      }
      // Remove modifiers for steps that no longer exist
      const newModifiers: { [stepIdx: number]: CellState } = {};
      Object.entries(row.modifiers).forEach(([k, v]) => {
        const idx = Number(k);
        if (idx < newSteps) newModifiers[idx] = v;
      });
      return { ...row, pattern: newPattern, modifiers: newModifiers };
    });
    updateNodeData(id, { steps: newSteps, rows: newRows });
  };

  const addTrack = () => {
    const newRows = [
      ...rows,
      {
        instrument: DRUM_CATEGORIES[0].options[0],
        pattern: Array(steps).fill(false),
        modifiers: {},
      },
    ];
    updateNodeData(id, { rows: newRows });
  };
  const removeTrack = () => {
    if (rows.length <= 1) return;
    const newRows = rows.slice(0, -1);
    updateNodeData(id, { rows: newRows });
  };

  const setModifiersEnabled = (enabled: boolean) => {
    updateNodeData(id, { modifiersEnabled: enabled });
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
    updateNodeData(id, { rows: newRows });
  };

  const handleInstrumentChange = (rowIndex: number, instrument: string) => {
    const newRows = rows.map((row, i) =>
      i === rowIndex ? { ...row, instrument } : row,
    );
    updateNodeData(id, { rows: newRows });
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
    updateNodeData(id, { rows: newRows });
  };

  const clearAll = () => {
    const newRows = rows.map((row) => ({
      ...row,
      pattern: Array(steps).fill(false),
      modifiers: {},
    }));
    updateNodeData(id, { rows: newRows });
  };

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-3 px-4 pt-1 pb-3 w-[min(1040px,90vw)]">
        {/* Sequencer rows */}
        <div className="nowheel flex flex-col gap-3 overflow-x-auto rounded-md bg-background/40 p-3">
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
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs">Steps</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 px-0 text-xs"
                  onClick={() => setSteps(steps - 1)}
                  disabled={steps <= 1}
                  aria-label="Decrease steps"
                >
                  -
                </Button>
                <span className="text-xs w-5 text-center">{steps}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 px-0 text-xs"
                  onClick={() => setSteps(steps + 1)}
                  disabled={steps >= 32}
                  aria-label="Increase steps"
                >
                  +
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Tracks</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 px-0 text-xs"
                  onClick={removeTrack}
                  disabled={rows.length <= 1}
                  aria-label="Remove track"
                >
                  -
                </Button>
                <span className="text-xs w-5 text-center">{rows.length}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 px-0 text-xs"
                  onClick={addTrack}
                  aria-label="Add track"
                >
                  +
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Modifiers</span>
                <Switch
                  checked={modifiersEnabled}
                  onCheckedChange={setModifiersEnabled}
                  aria-label="Toggle modifiers"
                />
              </div>
            </div>
          </div>
        </AccordionControls>
      </div>
    </WorkflowNode>
  );
}
