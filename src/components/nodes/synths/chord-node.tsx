import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { KEY_OPTIONS } from '@/data/sound-options';

// Define chord types and complexities
type ChordComplexity = 'triad' | 'seventh' | 'ninth' | 'eleventh';

const CHORD_COMPLEXITY_OPTIONS = [
  { value: 'triad', label: 'Triad' },
  { value: 'seventh', label: '7th' },
  { value: 'ninth', label: '9th' },
  { value: 'eleventh', label: '11th' },
];

// Scale degrees for major and minor keys
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

// Convert scale degrees to chord patterns using scale degree notation
const getChordNotes = (
  scaleStep: number,
  complexity: ChordComplexity
): string => {
  // Build chord based on complexity using scale degrees
  const chordIntervals = {
    triad: [0, 2, 4], // Root, third, fifth
    seventh: [0, 2, 4, 6], // Root, third, fifth, seventh
    ninth: [0, 2, 4, 6, 1], // Root, third, fifth, seventh, ninth (next octave second)
    eleventh: [0, 2, 4, 6, 1, 3], // Root, third, fifth, seventh, ninth, eleventh
  };

  const chordStructure = chordIntervals[complexity];
  const chordNotes = chordStructure.map((interval) => {
    // Scale degrees are relative to the chosen scale step
    return (scaleStep + interval) % 7;
  });

  return `[${chordNotes.join(', ')}]`;
};

export function ChordNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);

  const [selectedKey, setSelectedKey] = useState('C');
  const [scaleType, setScaleType] = useState<'major' | 'minor'>('major');
  const [chordComplexity, setChordComplexity] =
    useState<ChordComplexity>('triad');
  const [octave, setOctave] = useState(4);
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());

  // Handle key press
  const handleKeyPress = (scaleStep: number) => {
    setPressedKeys((prev) => {
      const newPressed = new Set(prev);
      if (newPressed.has(scaleStep)) {
        newPressed.delete(scaleStep);
      } else {
        newPressed.add(scaleStep);
      }
      return newPressed;
    });
  };

  // Generate pattern based on pressed keys
  useEffect(() => {
    if (pressedKeys.size === 0) {
      updateNode(id, { notes: '' });
      return;
    }

    const chords = Array.from(pressedKeys)
      .sort()
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
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md">
        {/* Piano-style keyboard */}
        <div className="relative">
          {/* White keys */}
          <div className="flex gap-0.5">
            {currentScaleDegrees.map((scaleDegree, index) => {
              const isPressed = pressedKeys.has(index);
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

        {/* Legend */}
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

        {/* Controls */}
        <Accordion type="single" collapsible>
          <AccordionItem value="controls">
            <AccordionTrigger className="text-xs font-mono py-2">
              Chord Controls
            </AccordionTrigger>
            <AccordionContent className="overflow-hidden">
              <div className="flex flex-col gap-3 text-xs font-mono">
                {/* Row 1: Key and Scale */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center gap-1">
                    <span>Key:</span>
                    <Select value={selectedKey} onValueChange={setSelectedKey}>
                      <SelectTrigger className="w-16 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KEY_OPTIONS.map((key) => (
                          <SelectItem key={key.value} value={key.value}>
                            {key.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>Scale:</span>
                    <Select
                      value={scaleType}
                      onValueChange={(value) =>
                        setScaleType(value as 'major' | 'minor')
                      }
                    >
                      <SelectTrigger className="w-20 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="major">Major</SelectItem>
                        <SelectItem value="minor">Minor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Complexity and Octave */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center gap-1">
                    <span>Complexity:</span>
                    <Select
                      value={chordComplexity}
                      onValueChange={(value) =>
                        setChordComplexity(value as ChordComplexity)
                      }
                    >
                      <SelectTrigger className="w-20 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHORD_COMPLEXITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>Octave: {octave}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0 ml-2"
                      onClick={() => setOctave((prev) => Math.max(prev - 1, 2))}
                    >
                      -
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setOctave((prev) => Math.min(prev + 1, 8))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Row 3: Clear button */}
                {pressedKeys.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => setPressedKeys(new Set())}
                    >
                      Clear All
                    </Button>
                    <span className="text-muted-foreground">
                      {pressedKeys.size} chord
                      {pressedKeys.size !== 1 ? 's' : ''} active
                    </span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
