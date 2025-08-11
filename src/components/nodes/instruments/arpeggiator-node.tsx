import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { AccordionControls } from '@/components/accordion-controls';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ARP_PATTERNS = [
  { id: 'up', label: 'Up', pattern: [0, 1, 2] },
  { id: 'down', label: 'Down', pattern: [2, 1, 0] },
  { id: 'up-down', label: 'Up-Down', pattern: [0, 1, 2, 1] },
  { id: 'down-up', label: 'Down-Up', pattern: [2, 1, 0, 1] },
  { id: 'inside-out', label: 'Inside-Out', pattern: [1, 0, 2] },
  { id: 'outside-in', label: 'Outside-In', pattern: [0, 2, 1] },
];

const OCTAVE_RANGES = [
  { octaves: 1, label: '1' },
  { octaves: 2, label: '2' },
  { octaves: 3, label: '3' },
  { octaves: 4, label: '4' },
];

const expandPatternAcrossOctaves = (
  basePattern: number[],
  octaves: number
): string => {
  if (octaves === 1) {
    return basePattern.join(' ');
  }
  const expandedPattern: number[] = [];
  for (let octave = 0; octave < octaves; octave++) {
    const octaveOffset = octave * 7;
    basePattern.forEach((note) => {
      expandedPattern.push(note + octaveOffset);
    });
  }
  return expandedPattern.join(' ');
};

function ArpeggioVisualizer({
  pattern,
  isActive,
}: {
  pattern: number[];
  isActive: boolean;
}) {
  const numRows = 3;
  const numCols = pattern.length;

  return (
    <div className="flex items-center justify-center w-full h-12 p-2 bg-muted/50 rounded-md border border-border/50">
      <div className="flex gap-1.5">
        {Array.from({ length: numCols }).map((_, colIndex) => (
          <div key={colIndex} className="flex flex-col-reverse gap-1">
            {Array.from({ length: numRows }).map((_, rowIndex) => {
              const noteInPattern = pattern[colIndex];
              const isSet = noteInPattern === rowIndex;
              return (
                <div
                  key={rowIndex}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    isSet && isActive
                      ? 'bg-primary'
                      : isSet
                      ? 'bg-muted-foreground/40'
                      : 'bg-muted-foreground/10'
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArpeggiatorNode({ id, data, type }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Use node data directly with defaults
  const selectedPattern = data.selectedPattern || '';
  const octaveRange = data.octaveRange || 1;
  const octave = data.octave || 4;
  const selectedChordType = data.selectedChordType || 'major';
  const selectedKey = data.selectedKey || 'C';

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md w-80">
        <div className="grid grid-cols-3 gap-2">
          {ARP_PATTERNS.map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => updateNodeData(id, { selectedPattern: p.id })}
            >
              <ArpeggioVisualizer
                pattern={p.pattern}
                isActive={selectedPattern === p.id}
              />
              <span className="text-xs font-mono">{p.label}</span>
            </div>
          ))}
        </div>
        <AccordionControls
          keyScaleOctaveProps={{
            selectedKey,
            onKeyChange: (key) => updateNodeData(id, { selectedKey: key }),
            selectedScale: selectedChordType,
            onScaleChange: (scale) =>
              updateNodeData(id, { selectedChordType: scale }),
            octave,
            onOctaveChange: (oct) => updateNodeData(id, { octave: oct }),
          }}
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-medium">
              Octave Range
            </label>
            <div className="grid grid-cols-4 gap-1">
              {OCTAVE_RANGES.map((preset) => (
                <Button
                  key={preset.octaves}
                  variant={
                    octaveRange === preset.octaves ? 'default' : 'secondary'
                  }
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() =>
                    updateNodeData(id, { octaveRange: preset.octaves })
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </AccordionControls>
      </div>
    </WorkflowNode>
  );
}

ArpeggiatorNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const data = node.data;
  const selectedPattern = data.selectedPattern || '';
  const octaveRange = data.octaveRange || 1;
  const octave = data.octave || 4;
  const selectedChordType = data.selectedChordType || 'major';
  const selectedKey = data.selectedKey || 'C';

  if (!selectedPattern) return strudelString;

  const patternData = ARP_PATTERNS.find((p) => p.id === selectedPattern);
  if (!patternData) return strudelString;

  const finalPattern = expandPatternAcrossOctaves(
    patternData.pattern,
    octaveRange
  );
  const arpCall = `n("${finalPattern}").scale("${selectedKey}${octave}:${selectedChordType}")`;

  return strudelString ? `${strudelString}.stack(${arpCall})` : arpCall;
};
