import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import { StrudelConfig } from '@/types';

// Define the internal state interface for URL persistence
interface ArpeggiatorNodeInternalState {
  selectedPattern: string;
  selectedOctaves: number;
  selectedChordType: string;
  selectedKey: string;
}

const ARP_PATTERNS = [
  { id: 'up', label: 'Up', pattern: [0, 2, 4] },
  { id: 'down', label: 'Down', pattern: [4, 2, 0] },
  { id: 'up-down', label: 'Up-Down', pattern: [0, 2, 4, 2] },
  { id: 'down-up', label: 'Down-Up', pattern: [4, 2, 0, 2] },
  { id: 'inside-out', label: 'Inside-Out', pattern: [2, 0, 4] },
  { id: 'outside-in', label: 'Outside-In', pattern: [0, 4, 2] },
  { id: 'octave', label: 'Octave', pattern: [0, 2, 4, 7] },
];

const OCTAVE_RANGES = [
  { octaves: 1, label: '1' },
  { octaves: 2, label: '2' },
  { octaves: 3, label: '3' },
  { octaves: 4, label: '4' },
];

const CHORD_TYPES = [
  { id: 'major', label: 'Major', scale: 'major' },
  { id: 'minor', label: 'Minor', scale: 'minor' },
  { id: 'dorian', label: 'Dorian', scale: 'dorian' },
  { id: 'mixolydian', label: 'Mixolydian', scale: 'mixolydian' },
  { id: 'pentatonic', label: 'Pentatonic', scale: 'pentatonic' },
  { id: 'blues', label: 'Blues', scale: 'blues' },
];

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Function to expand pattern across multiple octaves
const expandPatternAcrossOctaves = (
  basePattern: number[],
  octaves: number
): string => {
  if (octaves === 1) {
    return basePattern.join(' ');
  }

  const expandedPattern: number[] = [];

  for (let octave = 0; octave < octaves; octave++) {
    const octaveOffset = octave * 7; // 7 scale degrees per octave
    basePattern.forEach((note) => {
      expandedPattern.push(note + octaveOffset);
    });
  }

  return expandedPattern.join(' ');
};

export function ArpeggiatorNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: ArpeggiatorNodeInternalState }
  )?.internalState;

  // Initialize state with saved values or defaults
  const [selectedPattern, setSelectedPattern] = useState(
    savedInternalState?.selectedPattern || 'up'
  );
  const [selectedOctaves, setSelectedOctaves] = useState(
    savedInternalState?.selectedOctaves || 1
  );
  const [selectedChordType, setSelectedChordType] = useState(
    savedInternalState?.selectedChordType || 'major'
  );
  const [selectedKey, setSelectedKey] = useState(
    savedInternalState?.selectedKey || 'C'
  );

  // State restoration flag to ensure we only restore once
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setSelectedPattern(savedInternalState.selectedPattern);
      setSelectedOctaves(savedInternalState.selectedOctaves);
      setSelectedChordType(savedInternalState.selectedChordType);
      setSelectedKey(savedInternalState.selectedKey);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: ArpeggiatorNodeInternalState = {
      selectedPattern,
      selectedOctaves,
      selectedChordType,
      selectedKey,
    };

    updateNodeData(id, { internalState });
  }, [
    selectedPattern,
    selectedOctaves,
    selectedChordType,
    selectedKey,
    id,
    updateNodeData,
  ]);

  // Update strudel whenever settings change
  useEffect(() => {
    const patternData = ARP_PATTERNS.find((p) => p.id === selectedPattern);
    const chordData = CHORD_TYPES.find((c) => c.id === selectedChordType);

    if (patternData && chordData) {
      // Generate the expanded pattern
      let finalPattern: string;

      if (selectedPattern === 'random') {
        // For random pattern, keep it as is - it's already a string
        finalPattern = patternData.pattern as string;
      } else {
        // For other patterns, expand across octaves
        finalPattern = expandPatternAcrossOctaves(
          patternData.pattern as number[],
          selectedOctaves
        );
      }

      const config: Partial<StrudelConfig> = {
        arpPattern: finalPattern,
        arpOctaves: selectedOctaves,
        arpChordType: chordData.scale,
        arpKey: selectedKey,
      };

      updateNode(id, config);
    }
  }, [
    selectedPattern,
    selectedOctaves,
    selectedChordType,
    selectedKey,
    id,
    updateNode,
  ]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        {/* Pattern Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Pattern</label>
          <div className="grid grid-cols-4 gap-1">
            {ARP_PATTERNS.map((pattern) => (
              <Button
                key={pattern.id}
                variant={selectedPattern === pattern.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPattern(pattern.id)}
              >
                {pattern.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Octave Range */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Octave Range</label>
          <div className="grid grid-cols-4 gap-1">
            {OCTAVE_RANGES.map((range) => (
              <Button
                key={range.octaves}
                variant={
                  selectedOctaves === range.octaves ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedOctaves(range.octaves)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Chord Type */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Scale Type</label>
          <div className="grid grid-cols-3 gap-1">
            {CHORD_TYPES.map((chord) => (
              <Button
                key={chord.id}
                variant={selectedChordType === chord.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChordType(chord.id)}
              >
                {chord.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Key</label>
          <div className="grid grid-cols-6 gap-1">
            {KEYS.map((key) => (
              <Button
                key={key}
                variant={selectedKey === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedKey(key)}
              >
                {key}
              </Button>
            ))}
          </div>
        </div>
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
