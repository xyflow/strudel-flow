import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';

const LATE_OFFSETS = [
  { id: 'micro', label: '0.01s', offset: '0.01', description: 'Micro delay' },
  { id: 'small', label: '0.05s', offset: '0.05', description: 'Small delay' },
  { id: 'medium', label: '0.1s', offset: '0.1', description: 'Medium delay' },
  { id: 'large', label: '0.25s', offset: '0.25', description: 'Large delay' },
  { id: 'half', label: '0.5s', offset: '0.5', description: 'Half second' },
];

const LATE_PATTERNS = [
  {
    id: 'constant',
    label: 'Constant',
    pattern: null,
    description: 'Fixed offset',
  },
  {
    id: 'alternating',
    label: 'Alt',
    pattern: '[0 {offset}]',
    description: 'Alternating offset',
  },
  {
    id: 'swing',
    label: 'Swing',
    pattern: '[0 {offset}]*2',
    description: 'Swing feel',
  },
  {
    id: 'triplet',
    label: 'Triplet',
    pattern: '[0 {offset} {offset}]',
    description: 'Triplet timing',
  },
];

export function LateNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Read current values from node.data
  const selectedOffset = data.lateOffsetId || 'small';
  const selectedPattern = data.latePatternId || 'constant';

  const handleOffsetChange = (offsetId: string) => {
    const offsetData = LATE_OFFSETS.find((o) => o.id === offsetId);
    const patternData = LATE_PATTERNS.find((p) => p.id === selectedPattern);

    if (offsetData && patternData) {
      let finalPattern;
      if (patternData.pattern) {
        finalPattern = patternData.pattern.replace(
          /{offset}/g,
          offsetData.offset
        );
      } else {
        finalPattern = offsetData.offset;
      }

      updateNodeData(id, {
        lateOffsetId: offsetId,
        lateOffset: offsetData.offset,
        latePattern: finalPattern,
      });
    }
  };

  const handlePatternChange = (patternId: string) => {
    const offsetData = LATE_OFFSETS.find((o) => o.id === selectedOffset);
    const patternData = LATE_PATTERNS.find((p) => p.id === patternId);

    if (offsetData && patternData) {
      let finalPattern;
      if (patternData.pattern) {
        finalPattern = patternData.pattern.replace(
          /{offset}/g,
          offsetData.offset
        );
      } else {
        finalPattern = offsetData.offset;
      }

      updateNodeData(id, {
        latePatternId: patternId,
        lateOffset: offsetData.offset,
        latePattern: finalPattern,
      });
    }
  };
  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Late Offset</label>
          <div className="grid grid-cols-3 gap-1">
            {LATE_OFFSETS.map((offset) => (
              <Button
                key={offset.id}
                variant={selectedOffset === offset.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleOffsetChange(offset.id)}
                title={offset.description}
              >
                {offset.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Pattern Type</label>
          <div className="grid grid-cols-2 gap-1">
            {LATE_PATTERNS.map((pattern) => (
              <Button
                key={pattern.id}
                variant={selectedPattern === pattern.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePatternChange(pattern.id)}
                title={pattern.description}
              >
                {pattern.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

LateNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const offset = node.data.lateOffset;
  const pattern = node.data.latePattern;

  if (!offset) return strudelString;

  const lateCall =
    pattern && pattern !== offset ? `.late("${pattern}")` : `.late(${offset})`;

  return strudelString + lateCall;
};
