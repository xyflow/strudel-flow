import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CellState, ModifierDropdown } from './pad-utils/modifiers';
import WorkflowNode from '@/components/nodes/workflow-node';
import { Button } from '@/components/ui/button';
import { PadButton } from './pad-utils/pad-button';
import { useAppStore } from '@/store/app-context';
import { WorkflowNodeProps, AppNode } from '..';
import { DRUM_OPTIONS } from '@/data/sound-options';

interface BeatMachineRow {
  instrument: string;
  pattern: boolean[];
  modifiers?: { [stepIdx: number]: CellState };
}

function applyStepModifier(pattern: string, modifier?: CellState): string {
  if (modifier && modifier.type === 'modifier') {
    if (modifier.value === 'rarely') {
      return `rarely(${pattern})`;
    }
    return `${pattern}${modifier.value}`;
  }
  return pattern;
}

const patternToString = (pattern: boolean[], modifiers?: { [stepIdx: number]: CellState }) => {
  return pattern
    .map((active, idx) => {
      const base = active ? '1' : '~';
      return applyStepModifier(base, modifiers?.[idx]);
    })
    .join(' ');
};

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
  onModifierSelect: (rowIndex: number, stepIdx: number, modifier: CellState) => void;
  showModifiers: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={row.instrument}
        onValueChange={(instrument) => onInstrumentChange(rowIndex, instrument)}
      >
        <SelectTrigger className="w-24 h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DRUM_OPTIONS.map((sound) => (
            <SelectItem key={sound} value={sound}>
              {sound}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-1">
        {row.pattern.map((isActive, step) => {
          // Steps 0, 4, 8, 12 (1st, 5th, 9th, 13th) get a subtle highlight
          const highlight = step % 4 === 0;
          return (
            <div
              key={step}
              className={`flex flex-col items-center gap-0.5 ${highlight ? 'bg-card-foreground/10 rounded-sm' : ''}`}
            >
              <PadButton
                stepIdx={step}
                noteIdx={rowIndex}
                on={isActive}
                isSelected={false}
                noteGroups={{}}
                toggleCell={() => onStepClick(rowIndex, step)}
              />
              {showModifiers && (
                <ModifierDropdown
                  currentState={row.modifiers?.[step] || { type: 'off' }}
                  onModifierSelect={(modifier) => onModifierSelect(rowIndex, step, modifier)}
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

  // Modifier toggle state (persisted in node data)
  const modifiersEnabled = typeof data.modifiersEnabled === 'boolean' ? data.modifiersEnabled : false;

  // Number of steps (default 16)
  const steps = typeof data.steps === 'number' ? data.steps : 16;

  // Use node data directly with defaults
  // Ensure all rows have a 'modifiers' property for type safety
  const rows = (data.rows || [
    { instrument: 'bd', pattern: Array(steps).fill(false), modifiers: {} },
    { instrument: 'sd', pattern: Array(steps).fill(false), modifiers: {} },
    { instrument: 'hh', pattern: Array(steps).fill(false), modifiers: {} },
  ]).map((row) => {
    // Type guard for modifiers property
    return {
      ...row,
      pattern: Array.isArray(row.pattern) && row.pattern.length === steps ? row.pattern : Array(steps).fill(false),
      modifiers: typeof (row as any).modifiers === 'object' ? (row as any).modifiers : {},
    };
  });

  // Step counter handlers
  const setSteps = (newSteps: number) => {
    if (newSteps < 1 || newSteps > 32) return;
    // Adjust all row patterns to new length
    const newRows = rows.map((row) => {
      let newPattern = row.pattern.slice(0, newSteps);
      if (newPattern.length < newSteps) {
        newPattern = newPattern.concat(Array(newSteps - newPattern.length).fill(false));
      }
      // Remove modifiers for steps that no longer exist
      const newModifiers: { [stepIdx: number]: CellState } = {};
      Object.entries(row.modifiers).forEach(([k, v]) => {
        const idx = Number(k);
        if (idx < newSteps) newModifiers[idx] = v as CellState;
      });
      return { ...row, pattern: newPattern, modifiers: newModifiers };
    });
    updateNodeData(id, { steps: newSteps, rows: newRows });
  };

  // Track counter handlers
  const addTrack = () => {
    const newRows = [
      ...rows,
      {
        instrument: DRUM_OPTIONS[0] || 'bd',
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

  // Modifier toggle handler
  const setModifiersEnabled = (enabled: boolean) => {
    updateNodeData(id, { modifiersEnabled: enabled });
  };

  const toggleStep = (rowIndex: number, step: number) => {
    const newRows = rows.map((row, rIndex) => {
      if (rIndex === rowIndex) {
        const newPattern = row.pattern.map((val, pIndex) =>
          pIndex === step ? !val : val
        );
        return { ...row, pattern: newPattern };
      }
      return row;
    });
    updateNodeData(id, { rows: newRows });
  };

  const handleInstrumentChange = (rowIndex: number, instrument: string) => {
    const newRows = [...rows];
    newRows[rowIndex].instrument = instrument;
    updateNodeData(id, { rows: newRows });
  };

  const handleModifierSelect = (rowIndex: number, stepIdx: number, modifier: CellState) => {
    const newRows = rows.map((row, rIndex) => {
      const modifiers = row.modifiers || {};
      if (rIndex === rowIndex) {
        const newModifiers = { ...modifiers };
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
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-96">
        {/* Sequencer rows */}
        <div className="flex flex-col gap-2 p-3 rounded border">
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
        <div className="flex flex-wrap gap-4 items-center justify-between mt-2">
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
                className="h-6 w-6 px-0 text-xs"
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
                className="h-6 w-6 px-0 text-xs"
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
                className="h-6 w-6 px-0 text-xs"
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
                className="h-6 w-6 px-0 text-xs"
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
                className="scale-75"
              />
            </div>
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

BeatMachineNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const data = node.data;
  const modifiersEnabled = typeof data.modifiersEnabled === 'boolean' ? data.modifiersEnabled : false;
  const steps = typeof data.steps === 'number' ? data.steps : 16;
  const rows = data.rows || [
    { instrument: 'bd', pattern: Array(steps).fill(false), modifiers: {} },
    { instrument: 'sd', pattern: Array(steps).fill(false), modifiers: {} },
    { instrument: 'hh', pattern: Array(steps).fill(false), modifiers: {} },
  ];

  // If modifiers are disabled, ignore them in output
  const patterns = rows.map(
    (row) =>
      `sound("${row.instrument}").struct("${patternToString(row.pattern, modifiersEnabled ? (typeof (row as any).modifiers === 'object' ? (row as any).modifiers : {}) : {})}")`
  );

  const validPatterns = patterns.filter(
    (p) => !p.includes(Array(steps).fill('~').join(''))
  );

  if (validPatterns.length === 0) {
    return strudelString;
  }

  const beatCall =
    validPatterns.length === 1
      ? validPatterns[0]
      : `stack(${validPatterns.join(', ')})`;

  return strudelString ? `${strudelString}.stack(${beatCall})` : beatCall;
};
