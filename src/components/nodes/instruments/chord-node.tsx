import { useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
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
  const updateNode = useStrudelStore((state) => state.updateNode);

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

  useEffect(() => {
    if (pressedKeys.length === 0) {
      updateNode(id, { notes: '' });
      return;
    }

    const chords = pressedKeys
      .sort((a, b) => a - b)
      .map((scaleStep) => getChordNotes(scaleStep, chordComplexity));

    const pattern = chords.join(' ');
    updateNode(id, {
      notes: pattern,
      scale: `${selectedKey}${octave}:${scaleType}`,
    });
  }, [
    pressedKeys,
    selectedKey,
    scaleType,
    chordComplexity,
    octave,
    id,
    updateNode,
  ]);

  const currentScaleDegrees = SCALE_DEGREES[scaleType];

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md w-80">
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
                        ? 'bg-blue-500 text-white border-blue-600 shadow-inner'
                        : 'bg-primary text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md'
                    }
                    ${
                      scaleDegree.quality === 'major'
                        ? 'border-b-4 border-b-blue-200'
                        : ''
                    }
                    ${
                      scaleDegree.quality === 'minor'
                        ? 'border-b-4 border-b-green-200'
                        : ''
                    }
                    ${
                      scaleDegree.quality === 'diminished'
                        ? 'border-b-4 border-b-red-200'
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
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <span>Major</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span>Minor</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span>Diminished</span>
          </div>
        </div>
        <AccordionControls
          triggerText="Chord Controls"
          keyScaleOctaveProps={{
            selectedKey,
            onKeyChange: (key) => updateNodeData(id, { selectedKey: key }),
            selectedScale: scaleType,
            onScaleChange: (scale) =>
              updateNodeData(id, { scaleType: scale as 'major' | 'minor' }),
            octave,
            onOctaveChange: (oct) => updateNodeData(id, { octave: oct }),
          }}
          chordControlsProps={{
            chordComplexity,
            onChordComplexityChange: (complexity) =>
              updateNodeData(id, { chordComplexity: complexity }),
            pressedKeys,
            onClearAll: () => updateNodeData(id, { pressedKeys: [] }),
          }}
        />
      </div>
    </WorkflowNode>
  );
}

ChordNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const notes = useStrudelStore.getState().config[node.id]?.notes;
  const scale = useStrudelStore.getState().config[node.id]?.scale;

  if (!notes) return strudelString;

  const calls = [];
  calls.push(`n("${notes}")`);
  if (scale) calls.push(`scale("${scale}")`);

  const notePattern = calls.join('.');
  return strudelString ? `${strudelString}.${notePattern}` : notePattern;
};
