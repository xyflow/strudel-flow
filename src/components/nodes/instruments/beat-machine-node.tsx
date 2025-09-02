import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Button } from '@/components/ui/button';
import { PadButton } from './pad-utils/pad-button';
import { DRUM_OPTIONS } from '@/data/sound-options';
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
}

const patternToString = (pattern: boolean[]) => {
  return pattern.map((active) => (active ? '1' : '~')).join(' ');
};

function SequencerRow({
  row,
  rowIndex,
  onStepClick,
  onInstrumentChange,
}: {
  row: BeatMachineRow;
  rowIndex: number;
  onStepClick: (rowIndex: number, step: number) => void;
  onInstrumentChange: (rowIndex: number, instrument: string) => void;
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
        {row.pattern.map((isActive, step) => (
          <PadButton
            key={step}
            stepIdx={step}
            noteIdx={rowIndex}
            on={isActive}
            isSelected={false}
            noteGroups={{}}
            toggleCell={() => onStepClick(rowIndex, step)}
          />
        ))}
      </div>
    </div>
  );
}

export function BeatMachineNode({ id, data, type }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Use node data directly with defaults
  const rows = data.rows || [
    { instrument: 'bd', pattern: Array(8).fill(false) },
    { instrument: 'sd', pattern: Array(8).fill(false) },
    { instrument: 'hh', pattern: Array(8).fill(false) },
  ];

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

  const clearAll = () => {
    const newRows = rows.map((row) => ({
      ...row,
      pattern: Array(8).fill(false),
    }));
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
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      </div>
    </WorkflowNode>
  );
}

BeatMachineNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const data = node.data;
  const rows = data.rows || [
    { instrument: 'bd', pattern: Array(8).fill(false) },
    { instrument: 'sd', pattern: Array(8).fill(false) },
    { instrument: 'hh', pattern: Array(8).fill(false) },
  ];

  const patterns = rows.map(
    (row) =>
      `sound("${row.instrument}").struct("${patternToString(row.pattern)}")`
  );

  const validPatterns = patterns.filter(
    (p) => !p.includes(Array(8).fill('~').join(''))
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
