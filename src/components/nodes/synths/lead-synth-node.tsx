import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import { StrudelConfig } from '@/types';

// Define the internal state interface for URL persistence
interface LeadSynthNodeInternalState {
  selectedScale: string;
  selectedMovement: string;
  selectedKey: string;
}

const SCALES = [
  { id: 'major', label: '😄', scale: 'major', name: 'Major' },
  { id: 'minor', label: '😢', scale: 'minor', name: 'Minor' },
  { id: 'pentatonic', label: '🎋', scale: 'pentatonic', name: 'Pentatonic' },
  { id: 'blues', label: '🔵', scale: 'blues', name: 'Blues' },
  { id: 'dorian', label: '🏛️', scale: 'dorian', name: 'Dorian' },
  { id: 'mixolydian', label: '🎸', scale: 'mixolydian', name: 'Mixolydian' },
  { id: 'chromatic', label: '🌈', scale: 'chromatic', name: 'Chromatic' },
  {
    id: 'harmonicMinor',
    label: '🎭',
    scale: 'harmonic minor',
    name: 'Harmonic Minor',
  },
];

const MOVEMENTS = [
  { id: 'stepwise', label: '🪜', pattern: '0 1 2 3 4 3 2 1', name: 'Steps' },
  { id: 'leaps', label: '🦘', pattern: '0 3 1 4 2 5 3 6', name: 'Leaps' },
  { id: 'arpeggiated', label: '🎵', pattern: '0 2 4 7 4 2', name: 'Arpeggio' },
  {
    id: 'chromatic',
    label: '🐍',
    pattern: '0 1 2 3 4 5 6 7',
    name: 'Chromatic',
  },
  { id: 'octaves', label: '🎯', pattern: '0 7 0 7 0 7', name: 'Octaves' },
  { id: 'random', label: '🎲', pattern: '[0 1 2 3 4 5 6 7]', name: 'Random' },
  {
    id: 'sequence',
    label: '🔄',
    pattern: '0 1 2 ~ 1 2 3 ~ 2 3 4 ~',
    name: 'Sequence',
  },
  { id: 'wave', label: '🌊', pattern: '0 2 4 2 0 -2 0 2', name: 'Wave' },
];

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function LeadSynthNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: LeadSynthNodeInternalState }
  )?.internalState;

  // Initialize state with saved values or defaults
  const [selectedScale, setSelectedScale] = useState(
    savedInternalState?.selectedScale || 'major'
  );
  const [selectedMovement, setSelectedMovement] = useState(
    savedInternalState?.selectedMovement || 'stepwise'
  );
  const [selectedKey, setSelectedKey] = useState(
    savedInternalState?.selectedKey || 'C'
  );

  // State restoration flag to ensure we only restore once
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setSelectedScale(savedInternalState.selectedScale);
      setSelectedMovement(savedInternalState.selectedMovement);
      setSelectedKey(savedInternalState.selectedKey);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: LeadSynthNodeInternalState = {
      selectedScale,
      selectedMovement,
      selectedKey,
    };

    updateNodeData(id, { internalState });
  }, [selectedScale, selectedMovement, selectedKey, id, updateNodeData]);

  // Update strudel whenever settings change
  useEffect(() => {
    const scaleData = SCALES.find((s) => s.id === selectedScale);
    const movementData = MOVEMENTS.find((m) => m.id === selectedMovement);

    if (scaleData && movementData) {
      const config: Partial<StrudelConfig> = {
        leadScale: scaleData.scale,
        leadMovement: movementData.pattern,
        leadKey: selectedKey,
      };

      updateNode(id, config);
    }
  }, [selectedScale, selectedMovement, selectedKey, id, updateNode]);

  const getCurrentScale = () => SCALES.find((s) => s.id === selectedScale);
  const getCurrentMovement = () =>
    MOVEMENTS.find((m) => m.id === selectedMovement);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        {/* Scale Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Scale</label>
          <div className="grid grid-cols-4 gap-2">
            {SCALES.map((scale) => (
              <Button
                key={scale.id}
                variant={selectedScale === scale.id ? 'default' : 'outline'}
                className="h-16 flex flex-col items-center justify-center"
                onClick={() => setSelectedScale(scale.id)}
              >
                <div className="text-2xl mb-1">{scale.label}</div>
                <div className="text-xs">{scale.name}</div>
              </Button>
            ))}
          </div>
        </div>

        {/* Movement Pattern */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Movement</label>
          <div className="grid grid-cols-4 gap-2">
            {MOVEMENTS.map((movement) => (
              <Button
                key={movement.id}
                variant={
                  selectedMovement === movement.id ? 'default' : 'outline'
                }
                className="h-16 flex flex-col items-center justify-center"
                onClick={() => setSelectedMovement(movement.id)}
              >
                <div className="text-2xl mb-1">{movement.label}</div>
                <div className="text-xs">{movement.name}</div>
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
                className={
                  selectedKey === key
                    ? 'bg-primary text-primary-foreground'
                    : ''
                }
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
            {getCurrentScale()?.name} {getCurrentScale()?.label} •{' '}
            {getCurrentMovement()?.name} {getCurrentMovement()?.label}
          </div>
          <div className="opacity-70">Key: {selectedKey}</div>
          <div className="mt-1">
            n("{getCurrentMovement()?.pattern}").scale("{selectedKey}4:
            {getCurrentScale()?.scale}")
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

LeadSynthNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const scale = config?.leadScale;
  const movement = config?.leadMovement;
  const key = config?.leadKey;

  if (!scale || !movement || !key) return strudelString;

  // Build the simplified lead synth call
  const leadCall = `n("${movement}").scale("${key}4:${scale}")`;

  return strudelString ? `${strudelString}.stack(${leadCall})` : leadCall;
};
