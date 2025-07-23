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
  selectedSpeed: string;
  selectedChordType: string;
  selectedKey: string;
}

const ARP_PATTERNS = [
  { id: 'up', label: 'Up', pattern: '0 2 4' },
  { id: 'down', label: 'Down', pattern: '4 2 0' },
  { id: 'up-down', label: 'Up-Down', pattern: '0 2 4 2' },
  { id: 'down-up', label: 'Down-Up', pattern: '4 2 0 2' },
  { id: 'inside-out', label: 'Inside-Out', pattern: '2 0 4' },
  { id: 'outside-in', label: 'Outside-In', pattern: '0 4 2' },
  { id: 'random', label: 'Random', pattern: '[0 2 4]' },
  { id: 'octave', label: 'Octave', pattern: '0 2 4 7' },
];

const OCTAVE_RANGES = [
  { octaves: 1, label: '1 Octave' },
  { octaves: 2, label: '2 Octaves' },
  { octaves: 3, label: '3 Octaves' },
  { octaves: 4, label: '4 Octaves' },
];

const SPEED_OPTIONS = [
  { id: 'slow', label: 'Slow', speed: 0.5 },
  { id: 'normal', label: 'Normal', speed: 1 },
  { id: 'fast', label: 'Fast', speed: 2 },
  { id: 'veryfast', label: 'Very Fast', speed: 4 },
  { id: 'triplets', label: 'Triplets', speed: 1.5 },
  { id: 'dotted', label: 'Dotted', speed: 0.75 },
];

const CHORD_TYPES = [
  { id: 'triad', label: 'Triad', notes: '0 2 4' },
  { id: 'seventh', label: '7th', notes: '0 2 4 6' },
  { id: 'ninth', label: '9th', notes: '0 2 4 6 8' },
  { id: 'sus4', label: 'Sus4', notes: '0 3 4' },
  { id: 'add9', label: 'Add9', notes: '0 2 4 8' },
  { id: 'minor', label: 'Minor', notes: '0 2 4' },
];

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

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
  const [selectedSpeed, setSelectedSpeed] = useState(
    savedInternalState?.selectedSpeed || 'normal'
  );
  const [selectedChordType, setSelectedChordType] = useState(
    savedInternalState?.selectedChordType || 'triad'
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
      setSelectedSpeed(savedInternalState.selectedSpeed);
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
      selectedSpeed,
      selectedChordType,
      selectedKey,
    };

    updateNodeData(id, { internalState });
  }, [
    selectedPattern,
    selectedOctaves,
    selectedSpeed,
    selectedChordType,
    selectedKey,
    id,
    updateNodeData,
  ]);

  // Update strudel whenever settings change
  useEffect(() => {
    const patternData = ARP_PATTERNS.find((p) => p.id === selectedPattern);
    const speedData = SPEED_OPTIONS.find((s) => s.id === selectedSpeed);
    const chordData = CHORD_TYPES.find((c) => c.id === selectedChordType);

    if (patternData && speedData && chordData) {
      const config: Partial<StrudelConfig> = {
        arpPattern: patternData.pattern,
        arpOctaves: selectedOctaves,
        arpSpeed: speedData.speed.toString(),
        arpChordType: chordData.notes,
        arpKey: selectedKey,
      };

      updateNode(id, config);
    }
  }, [
    selectedPattern,
    selectedOctaves,
    selectedSpeed,
    selectedChordType,
    selectedKey,
    id,
    updateNode,
  ]);

  const getCurrentPattern = () =>
    ARP_PATTERNS.find((p) => p.id === selectedPattern);
  const getCurrentSpeed = () =>
    SPEED_OPTIONS.find((s) => s.id === selectedSpeed);
  const getCurrentChordType = () =>
    CHORD_TYPES.find((c) => c.id === selectedChordType);

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

        {/* Speed */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Speed</label>
          <div className="grid grid-cols-3 gap-1">
            {SPEED_OPTIONS.map((speed) => (
              <Button
                key={speed.id}
                variant={selectedSpeed === speed.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSpeed(speed.id)}
              >
                {speed.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Chord Type */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Chord Type</label>
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

        {/* Current Selection Display */}
        <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
          <div className="font-bold">
            {getCurrentPattern()?.label} • {getCurrentChordType()?.label} •{' '}
            {getCurrentSpeed()?.label}
          </div>
          <div className="opacity-70">
            Key: {selectedKey} • {selectedOctaves} octave
            {selectedOctaves > 1 ? 's' : ''}
          </div>
          <div className="mt-1">
            n("{getCurrentPattern()?.pattern}").scale("{selectedKey}
            4:major").fast({getCurrentSpeed()?.speed})
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

ArpeggiatorNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const pattern = config?.arpPattern;
  const octaves = config?.arpOctaves;
  const speed = config?.arpSpeed;
  const chordType = config?.arpChordType;
  const key = config?.arpKey;

  if (!pattern || !octaves || !speed || !chordType || !key)
    return strudelString;

  // Build the arpeggiator call
  let arpCall = `n("${pattern}").scale("${key}4:major")`;

  if (parseFloat(speed) !== 1) {
    arpCall += `.fast(${speed})`;
  }

  return strudelString ? `${strudelString}.stack(${arpCall})` : arpCall;
};
