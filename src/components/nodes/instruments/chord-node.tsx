import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';

import { AccordionControls } from '@/components/accordion-controls';

type ChordComplexity = 'triad' | 'seventh' | 'ninth' | 'eleventh';

const SCALE_DEGREES = {
  major: [
    { degree: 'I', label: 'I', quality: 'major' },
    { degree: 'ii', label: 'ii', quality: 'minor' },
    { degree: 'iii', label: 'iii', quality: 'minor' },
    { degree: 'IV', label: 'IV', quality: 'major' },
    { degree: 'V', label: 'V', quality: 'major' },
    { degree: 'vi', label: 'vi', quality: 'minor' },
    { degree: 'vii°', label: 'vii°', quality: 'diminished' },
  ],
  minor: [
    { degree: 'i', label: 'i', quality: 'minor' },
    { degree: 'ii°', label: 'ii°', quality: 'diminished' },
    { degree: 'III', label: 'III', quality: 'major' },
    { degree: 'iv', label: 'iv', quality: 'minor' },
    { degree: 'v', label: 'v', quality: 'minor' },
    { degree: 'VI', label: 'VI', quality: 'major' },
    { degree: 'VII', label: 'VII', quality: 'major' },
  ],
};

const getChordNotes = (
  scaleStep: number,
  complexity: ChordComplexity
): string => {
  const chordIntervals = {
    triad: [0, 2, 4],
    seventh: [0, 2, 4, 6],
    ninth: [0, 2, 4, 6, 1],
    eleventh: [0, 2, 4, 6, 1, 3],
  };

  const chordStructure = chordIntervals[complexity];
  const chordNotes = chordStructure.map((interval) => {
    return (scaleStep + interval) % 7;
  });

  return `[${chordNotes.join(', ')}]`;
};

export function ChordNode({ id, data, type }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Use node data directly with defaults
  const selectedKey = data.selectedKey || 'C';
  const scaleType = data.scaleType || 'major';
  const chordComplexity = data.chordComplexity || 'triad';
  const octave = data.octave || 4;
  const pressedKeys = data.pressedKeys || [];
  const pressedKeysSet = new Set(pressedKeys);

  const handleKeyPress = (scaleStep: number) => {
    const newPressed = new Set(pressedKeys);
    if (newPressed.has(scaleStep)) {
      newPressed.delete(scaleStep);
    } else {
      newPressed.add(scaleStep);
    }
    updateNodeData(id, { pressedKeys: Array.from(newPressed) });
  };

  const currentScaleDegrees =
    SCALE_DEGREES[scaleType as keyof typeof SCALE_DEGREES] ||
    SCALE_DEGREES.major;

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md w-full">
        <div className="relative">
          <div className="flex gap-0.5">
            {currentScaleDegrees.map((scaleDegree, index) => {
              const isPressed = pressedKeysSet.has(index);
              return (
                <button
                  key={index}
                  className={`
                    w-8 h-16 border border-border rounded-b-md transition-all duration-150
                    text-xs font-mono font-bold flex flex-col items-center justify-end pb-2
                    ${
                      isPressed
                        ? 'bg-primary text-primary-foreground border-primary shadow-inner'
                        : 'bg-background text-foreground hover:bg-muted shadow-sm hover:shadow-md'
                    }
                    ${
                      scaleDegree.quality === 'major'
                        ? 'border-b-4 border-b-primary/30'
                        : ''
                    }
                    ${
                      scaleDegree.quality === 'minor'
                        ? 'border-b-4 border-b-accent/30'
                        : ''
                    }
                    ${
                      scaleDegree.quality === 'diminished'
                        ? 'border-b-4 border-b-destructive/30'
                        : ''
                    }
                  `}
                  onClick={() => handleKeyPress(index)}
                  title={`${scaleDegree.degree} chord (${scaleDegree.quality})`}
                >
                  <div className="text-[10px] leading-tight text-center">
                    {scaleDegree.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="text-xs text-muted-foreground flex gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary/30 rounded"></div>
            <span>Major</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-accent/30 rounded"></div>
            <span>Minor</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-destructive/30 rounded"></div>
            <span>Diminished</span>
          </div>
        </div>
        <AccordionControls
          keyScaleOctaveProps={{
            selectedKey,
            onKeyChange: (key) => updateNodeData(id, { selectedKey: key }),
            selectedScale: scaleType,
            onScaleChange: (scale) => {
              // Only allow major and minor scales for chord node
              if (scale === 'major' || scale === 'minor') {
                updateNodeData(id, { scaleType: scale });
              }
            },
            octave,
            onOctaveChange: (oct) => updateNodeData(id, { octave: oct }),
            allowedScales: ['major', 'minor'],
          }}
          chordControlsProps={{
            chordComplexity,
            onChordComplexityChange: (complexity) =>
              updateNodeData(id, { chordComplexity: complexity }),
          }}
        />
      </div>
    </WorkflowNode>
  );
}

ChordNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const data = node.data;

  // Get data directly from node.data with defaults
  const pressedKeys = data.pressedKeys || [];
  const selectedKey = data.selectedKey || 'C';
  const scaleType = data.scaleType || 'major';
  const chordComplexity = data.chordComplexity || 'triad';
  const octave = data.octave || 4;

  if (pressedKeys.length === 0) return strudelString;

  // Process chords inline (same logic as before)
  const chords = pressedKeys
    .sort((a, b) => a - b)
    .map((scaleStep) => getChordNotes(scaleStep, chordComplexity));

  const notes = chords.join(' ');
  const scale = `${selectedKey}${octave}:${scaleType}`;

  const calls = [];
  calls.push(`n("${notes}")`);
  if (scale) calls.push(`scale("${scale}")`);

  const notePattern = calls.join('.');
  return strudelString ? `${strudelString}.${notePattern}` : notePattern;
};
