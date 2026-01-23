import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Button } from '@/components/ui/button';
import { PadButton } from './pad-utils/pad-button';
import { DRUM_OPTIONS } from '@/data/sound-options';
import { ModifierDropdown, CellState } from './pad-utils/modifiers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}: {
  row: BeatMachineRow;
  rowIndex: number;
  onStepClick: (rowIndex: number, step: number) => void;
  onInstrumentChange: (rowIndex: number, instrument: string) => void;
  onModifierSelect: (rowIndex: number, stepIdx: number, modifier: CellState) => void;
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BeatMachineNode({ id, data, type }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Use node data directly with defaults
  // Ensure all rows have a 'modifiers' property for type safety
  const rows = (data.rows || [
    { instrument: 'bd', pattern: Array(16).fill(false), modifiers: {} },
    { instrument: 'sd', pattern: Array(16).fill(false), modifiers: {} },
    { instrument: 'hh', pattern: Array(16).fill(false), modifiers: {} },
  ]).map((row) => {
    // Type guard for modifiers property
    return {
      ...row,
      modifiers: typeof (row as any).modifiers === 'object' ? (row as any).modifiers : {},
    };
  });

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
      pattern: Array(16).fill(false),
      modifiers: {},
    }));
    updateNodeData(id, { rows: newRows });
  };


  const addTrack = () => {
    // Use latest rows from current closure
    const newRows = [
      ...rows,
      {
        instrument: DRUM_OPTIONS[0] || 'bd',
        pattern: Array(16).fill(false),
        modifiers: {},
      },
    ];
    updateNodeData(id, { rows: newRows });
  };

  // Remove the last track (if more than one)
  const removeTrack = () => {
    if (rows.length <= 1) return;
    const newRows = rows.slice(0, -1);
    updateNodeData(id, { rows: newRows });
  };

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-96">
        <div className="flex flex-col gap-2 p-3 rounded border">
          {rows.map((row, index) => (
            <SequencerRow
              key={index}
              row={row}
              rowIndex={index}
              onStepClick={toggleStep}
              onInstrumentChange={handleInstrumentChange}
              onModifierSelect={handleModifierSelect}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={addTrack}
              className="text-xs"
            >
              + Add Track
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={removeTrack}
              className="text-xs"
              disabled={rows.length <= 1}
            >
              Remove Track
            </Button>
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

BeatMachineNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const data = node.data;
  const rows = data.rows || [
    { instrument: 'bd', pattern: Array(16).fill(false), modifiers: {} },
    { instrument: 'sd', pattern: Array(16).fill(false), modifiers: {} },
    { instrument: 'hh', pattern: Array(16).fill(false), modifiers: {} },
  ];

  const patterns = rows.map(
    (row) =>
      `sound("${row.instrument}").struct("${patternToString(row.pattern, typeof (row as any).modifiers === 'object' ? (row as any).modifiers : {})}")`
  );

  const validPatterns = patterns.filter(
    (p) => !p.includes(Array(16).fill('~').join(''))
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
