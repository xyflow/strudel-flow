import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import { StrudelConfig } from '@/types';

// Define the internal state interface for URL persistence
interface BassGeneratorNodeInternalState {
  selectedPattern: string;
  selectedSound: string;
  selectedOctave: string;
  selectedGroove: string;
  selectedKey: string;
}

const BASS_PATTERNS = [
  {
    id: 'walking',
    label: '🚶 Walking',
    pattern: '0 2 4 5',
    color: 'bg-blue-500',
    description: 'Classic walking bass line',
  },
  {
    id: 'four-floor',
    label: '🏠 Four-Floor',
    pattern: '0 ~ ~ ~ 0 ~ ~ ~',
    color: 'bg-green-500',
    description: 'House music four-on-floor',
  },
  {
    id: 'syncopated',
    label: '🎵 Syncopated',
    pattern: '0 ~ 2 ~ ~ 4 ~',
    color: 'bg-purple-500',
    description: 'Off-beat syncopation',
  },
  {
    id: 'gallop',
    label: '🐎 Gallop',
    pattern: '0 0 ~ 0 0 ~ ~',
    color: 'bg-orange-500',
    description: 'Galloping rhythm',
  },
  {
    id: 'reggae',
    label: '🌴 Reggae',
    pattern: '~ 0 ~ 0',
    color: 'bg-yellow-500',
    description: 'Reggae upstroke feel',
  },
  {
    id: 'funk',
    label: '🕺 Funk',
    pattern: '0 ~ 2 0 ~ ~ 4 ~',
    color: 'bg-red-500',
    description: 'Funky groove pattern',
  },
  {
    id: 'latin',
    label: '💃 Latin',
    pattern: '0 ~ 4 ~ 2 ~ ~',
    color: 'bg-pink-500',
    description: 'Latin rhythm pattern',
  },
  {
    id: 'rock',
    label: '🎸 Rock',
    pattern: '0 0 2 0 0 2 4',
    color: 'bg-gray-500',
    description: 'Rock steady bass',
  },
];

const BASS_SOUNDS = [
  {
    id: 'gm_electric_bass_finger',
    label: '🎸 Electric Bass',
    color: 'bg-blue-500',
    description: 'Classic electric bass',
  },
  {
    id: 'gm_acoustic_bass',
    label: '🎻 Acoustic Bass',
    color: 'bg-brown-500',
    description: 'Upright acoustic bass',
  },
  {
    id: 'gm_synth_bass_1',
    label: '🎛️ Synth Bass 1',
    color: 'bg-purple-500',
    description: 'Analog synth bass',
  },
  {
    id: 'gm_synth_bass_2',
    label: '⚡ Synth Bass 2',
    color: 'bg-pink-500',
    description: 'Digital synth bass',
  },
  {
    id: 'gm_slap_bass_1',
    label: '👋 Slap Bass',
    color: 'bg-orange-500',
    description: 'Slap bass technique',
  },
  {
    id: 'gm_fretless_bass',
    label: '🌊 Fretless',
    color: 'bg-teal-500',
    description: 'Smooth fretless bass',
  },
];

const BASS_OCTAVES = [
  { id: 'low', label: '🔽 Low (C1)', octave: '1', color: 'bg-red-600' },
  { id: 'mid', label: '🎯 Mid (C2)', octave: '2', color: 'bg-red-500' },
  { id: 'high', label: '🔼 High (C3)', octave: '3', color: 'bg-red-400' },
];

const BASS_GROOVES = [
  { id: 'straight', label: '📏 Straight', modifier: '', color: 'bg-gray-500' },
  {
    id: 'swing',
    label: '🎷 Swing',
    modifier: '.swing(2)',
    color: 'bg-blue-500',
  },
  {
    id: 'shuffle',
    label: '🔀 Shuffle',
    modifier: '.swing(3)',
    color: 'bg-green-500',
  },
  {
    id: 'laid-back',
    label: '😎 Laid Back',
    modifier: '.early(-0.05)',
    color: 'bg-purple-500',
  },
];

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function BassGeneratorNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: BassGeneratorNodeInternalState }
  )?.internalState;

  // Initialize state with saved values or defaults
  const [selectedPattern, setSelectedPattern] = useState(
    savedInternalState?.selectedPattern || 'walking'
  );
  const [selectedSound, setSelectedSound] = useState(
    savedInternalState?.selectedSound || 'gm_electric_bass_finger'
  );
  const [selectedOctave, setSelectedOctave] = useState(
    savedInternalState?.selectedOctave || 'mid'
  );
  const [selectedGroove, setSelectedGroove] = useState(
    savedInternalState?.selectedGroove || 'straight'
  );
  const [selectedKey, setSelectedKey] = useState(
    savedInternalState?.selectedKey || 'C'
  );

  // State restoration flag to ensure we only restore once
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      console.log(
        `BassGeneratorNode ${id} - Restoring state from saved internal state:`,
        savedInternalState
      );

      setSelectedPattern(savedInternalState.selectedPattern);
      setSelectedSound(savedInternalState.selectedSound);
      setSelectedOctave(savedInternalState.selectedOctave);
      setSelectedGroove(savedInternalState.selectedGroove);
      setSelectedKey(savedInternalState.selectedKey);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: BassGeneratorNodeInternalState = {
      selectedPattern,
      selectedSound,
      selectedOctave,
      selectedGroove,
      selectedKey,
    };

    updateNodeData(id, { internalState });
  }, [
    selectedPattern,
    selectedSound,
    selectedOctave,
    selectedGroove,
    selectedKey,
    id,
    updateNodeData,
  ]);

  // Update strudel whenever settings change
  useEffect(() => {
    const patternData = BASS_PATTERNS.find((p) => p.id === selectedPattern);
    const soundData = BASS_SOUNDS.find((s) => s.id === selectedSound);
    const octaveData = BASS_OCTAVES.find((o) => o.id === selectedOctave);
    const grooveData = BASS_GROOVES.find((g) => g.id === selectedGroove);

    if (patternData && soundData && octaveData && grooveData) {
      const config: Partial<StrudelConfig> = {
        bassPattern: patternData.pattern,
        bassSound: soundData.id,
        bassOctave: octaveData.octave,
        bassGroove: grooveData.modifier,
        bassKey: selectedKey,
      };

      updateNode(id, config);
    }
  }, [
    selectedPattern,
    selectedSound,
    selectedOctave,
    selectedGroove,
    selectedKey,
    id,
    updateNode,
  ]);

  const getCurrentPattern = () =>
    BASS_PATTERNS.find((p) => p.id === selectedPattern);
  const getCurrentSound = () => BASS_SOUNDS.find((s) => s.id === selectedSound);
  const getCurrentOctave = () =>
    BASS_OCTAVES.find((o) => o.id === selectedOctave);
  const getCurrentGroove = () =>
    BASS_GROOVES.find((g) => g.id === selectedGroove);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        {/* Bass Patterns */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Bass Pattern</label>
          <div className="grid grid-cols-2 gap-1">
            {BASS_PATTERNS.map((pattern) => (
              <Button
                key={pattern.id}
                className={`h-12 text-white font-bold text-xs ${
                  selectedPattern === pattern.id
                    ? pattern.color + ' ring-2 ring-white'
                    : pattern.color + ' opacity-70'
                }`}
                onClick={() => setSelectedPattern(pattern.id)}
              >
                <div className="text-center">
                  <div>{pattern.label}</div>
                  <div className="text-xs opacity-70">
                    {pattern.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Bass Sounds */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Bass Sound</label>
          <div className="grid grid-cols-2 gap-1">
            {BASS_SOUNDS.map((sound) => (
              <Button
                key={sound.id}
                className={`h-10 text-white font-bold text-xs ${
                  selectedSound === sound.id
                    ? sound.color + ' ring-2 ring-white'
                    : sound.color + ' opacity-70'
                }`}
                onClick={() => setSelectedSound(sound.id)}
              >
                {sound.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Octave Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Octave</label>
          <div className="grid grid-cols-3 gap-1">
            {BASS_OCTAVES.map((octave) => (
              <Button
                key={octave.id}
                className={`h-10 text-white font-bold ${
                  selectedOctave === octave.id
                    ? octave.color + ' ring-2 ring-white'
                    : octave.color + ' opacity-70'
                }`}
                onClick={() => setSelectedOctave(octave.id)}
              >
                {octave.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Groove Style */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Groove</label>
          <div className="grid grid-cols-2 gap-1">
            {BASS_GROOVES.map((groove) => (
              <Button
                key={groove.id}
                className={`h-10 text-white font-bold ${
                  selectedGroove === groove.id
                    ? groove.color + ' ring-2 ring-white'
                    : groove.color + ' opacity-70'
                }`}
                onClick={() => setSelectedGroove(groove.id)}
              >
                {groove.label}
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
            {getCurrentPattern()?.label} • {getCurrentSound()?.label} •{' '}
            {getCurrentOctave()?.label}
          </div>
          <div className="opacity-70">
            {getCurrentGroove()?.label} • Key: {selectedKey}
          </div>
          <div className="mt-1">
            n("{getCurrentPattern()?.pattern}").scale("{selectedKey}
            {getCurrentOctave()?.octave}:major").s("{getCurrentSound()?.id}")
            {getCurrentGroove()?.modifier}
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

BassGeneratorNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const pattern = config?.bassPattern;
  const sound = config?.bassSound;
  const octave = config?.bassOctave;
  const groove = config?.bassGroove;
  const key = config?.bassKey;

  if (!pattern || !sound || !octave || !key) return strudelString;

  // Build the bass call
  let bassCall = `n("${pattern}").scale("${key}${octave}:major").s("${sound}")`;

  // Add groove modifier if present
  if (groove) {
    bassCall += groove;
  }

  return strudelString ? `${strudelString}.stack(${bassCall})` : bassCall;
};
