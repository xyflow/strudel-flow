import { useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useNodeState } from '@/hooks/use-node-state';
import { AccordionControls } from '@/components/accordion-controls';
import { cn } from '@/lib/utils';
import { PresetGroup } from '@/components/preset-group';

interface ArpeggiatorInternalState {
  selectedPattern: string;
  octave: number;
  selectedChordType: string;
  selectedKey: string;
}

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
    <div className="flex items-center justify-center w-full h-12 p-2 bg-gray-200 dark:bg-gray-700 rounded-md">
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
                    'w-2 h-2 rounded-full',
                    isSet && isActive
                      ? 'bg-blue-500'
                      : 'bg-gray-400 dark:bg-gray-500',
                    isSet ? 'opacity-100' : 'opacity-25'
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
  const [
    { selectedPattern, octave, selectedChordType, selectedKey },
    setState,
  ] = useNodeState(id, data as { internalState?: ArpeggiatorInternalState }, {
    selectedPattern: '',
    octave: 1,
    selectedChordType: 'major',
    selectedKey: 'C',
  });

  const updateNode = useStrudelStore((state) => state.updateNode);

  useEffect(() => {
    const hasSelection = selectedPattern;

    if (!hasSelection) {
      updateNode(id, {
        arpPattern: undefined,
        arpOctaves: undefined,
        arpChordType: undefined,
        arpKey: undefined,
      });
      return;
    }

    const patternId = selectedPattern || 'up';
    const octaves = octave || 1;
    const chordTypeId = selectedChordType || 'major';
    const key = selectedKey || 'C';

    const patternData = ARP_PATTERNS.find((p) => p.id === patternId);

    if (patternData) {
      const finalPattern = expandPatternAcrossOctaves(
        patternData.pattern,
        octaves
      );

      updateNode(id, {
        arpPattern: finalPattern,
        arpOctaves: octaves,
        arpChordType: chordTypeId,
        arpKey: key,
      });
    }
  }, [selectedPattern, octave, selectedChordType, selectedKey, id, updateNode]);

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md w-80">
        <div className="grid grid-cols-3 gap-2">
          {ARP_PATTERNS.map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() =>
                setState((prev) => ({ ...prev, selectedPattern: p.id }))
              }
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
          triggerText="Arpeggio Controls"
          keyScaleOctaveProps={{
            selectedKey,
            onKeyChange: (key) =>
              setState((prev) => ({ ...prev, selectedKey: key })),
            selectedScale: selectedChordType,
            onScaleChange: (scale) =>
              setState((prev) => ({ ...prev, selectedChordType: scale })),
            octave,
            onOctaveChange: (oct) =>
              setState((prev) => ({ ...prev, octave: oct })),
            showOctave: false,
          }}
        >
          <PresetGroup
            label="Octave Range"
            presets={OCTAVE_RANGES}
            selectedValue={octave}
            onSelect={(oct) =>
              setState((prev) => ({ ...prev, octave: oct as number }))
            }
            idKey="octaves"
          />
        </AccordionControls>
      </div>
    </WorkflowNode>
  );
}

ArpeggiatorNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const pattern = config?.arpPattern;
  const chordType = config?.arpChordType;
  const key = config?.arpKey;

  if (!pattern || !chordType || !key) return strudelString;

  const arpCall = `n("${pattern}").scale("${key}4:${chordType}")`;

  return strudelString ? `${strudelString}.stack(${arpCall})` : arpCall;
};
