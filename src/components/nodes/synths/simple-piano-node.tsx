import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import { StrudelConfig } from '@/types';

// Define the internal state interface for URL persistence
interface SimplePianoNodeInternalState {
  selectedPattern: string;
  selectedSound: string;
  selectedKey: string;
}

const PIANO_PATTERNS = [
  {
    id: 'block-chords',
    label: '🎹 Block Chords',
    pattern: '[0,2,4] [5,7,9] [3,5,7] [0,2,4]',
    description: 'Simple 4-chord progression',
  },
  {
    id: 'arpeggios',
    label: '🌊 Arpeggios',
    pattern: '0 2 4 7 4 2',
    description: 'Flowing arpeggiated pattern',
  },
  {
    id: 'bass-chords',
    label: '🎵 Bass + Chords',
    pattern: '[0,-12] [2,7] [4,9] [7,12]',
    description: 'Left hand bass, right hand chords',
  },
  {
    id: 'alberti',
    label: '⚡ Alberti Bass',
    pattern: '0 4 2 4 0 4 2 4',
    description: 'Classical accompaniment style',
  },
  {
    id: 'stride',
    label: '🎼 Stride',
    pattern: '[-12,0] [2,4,7] [-10,2] [0,4,7]',
    description: 'Jazz stride piano style',
  },
  {
    id: 'ballad',
    label: '💫 Ballad',
    pattern: '[0,2,4,7]*2 [5,7,9,12]*2',
    description: 'Slow, expressive chords',
  },
  {
    id: 'blues',
    label: '🔵 Blues',
    pattern: '[0,3,7] [5,8,12] [0,3,7,10]',
    description: '12-bar blues progression',
  },
  {
    id: 'gospel',
    label: '⛪ Gospel',
    pattern: '[0,2,4,7,9] ~ [5,7,9,12,14] ~',
    description: 'Rich gospel chords with rests',
  },
];

const PIANO_SOUNDS = [
  {
    id: 'gm_acoustic_grand_piano',
    label: '🎹 Grand Piano',
    description: 'Classic acoustic grand',
  },
  {
    id: 'gm_bright_acoustic_piano',
    label: '✨ Bright Piano',
    description: 'Crisp and clear',
  },
  {
    id: 'gm_electric_piano_1',
    label: '⚡ Electric Piano',
    description: 'Vintage electric sound',
  },
  {
    id: 'gm_honky_tonk_piano',
    label: '🤠 Honky Tonk',
    description: 'Saloon-style piano',
  },
  {
    id: 'gm_harpsichord',
    label: '🎭 Harpsichord',
    description: 'Baroque elegance',
  },
];

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function SimplePianoNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: SimplePianoNodeInternalState }
  )?.internalState;

  // Initialize state with saved values or defaults
  const [selectedPattern, setSelectedPattern] = useState(
    savedInternalState?.selectedPattern || 'block-chords'
  );
  const [selectedSound, setSelectedSound] = useState(
    savedInternalState?.selectedSound || 'gm_acoustic_grand_piano'
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
      setSelectedSound(savedInternalState.selectedSound);
      setSelectedKey(savedInternalState.selectedKey);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: SimplePianoNodeInternalState = {
      selectedPattern,
      selectedSound,
      selectedKey,
    };

    updateNodeData(id, { internalState });
  }, [selectedPattern, selectedSound, selectedKey, id, updateNodeData]);

  // Update strudel whenever settings change
  useEffect(() => {
    const patternData = PIANO_PATTERNS.find((p) => p.id === selectedPattern);
    if (patternData) {
      const config: Partial<StrudelConfig> = {
        pianoPattern: patternData.pattern,
        pianoSound: selectedSound,
        pianoKey: selectedKey,
      };

      updateNode(id, config);
    }
  }, [selectedPattern, selectedSound, selectedKey, id, updateNode]);

  const handlePatternClick = (patternId: string) => {
    setSelectedPattern(patternId);
  };

  const handleSoundClick = (soundId: string) => {
    setSelectedSound(soundId);
  };

  const getCurrentPattern = () => {
    return PIANO_PATTERNS.find((p) => p.id === selectedPattern);
  };

  const getCurrentSound = () => {
    return PIANO_SOUNDS.find((s) => s.id === selectedSound);
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        {/* Pattern Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Piano Pattern</label>
          <div className="grid grid-cols-2 gap-1">
            {PIANO_PATTERNS.map((pattern) => (
              <Button
                key={pattern.id}
                variant={selectedPattern === pattern.id ? 'default' : 'outline'}
                size="sm"
                className={`h-12 text-xs ${
                  selectedPattern === pattern.id
                    ? 'bg-primary text-primary-foreground'
                    : ''
                }`}
                onClick={() => handlePatternClick(pattern.id)}
              >
                <div className="text-center">
                  <div className="font-bold">{pattern.label}</div>
                  <div className="text-xs opacity-70">
                    {pattern.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Sound Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Piano Sound</label>
          <div className="grid grid-cols-1 gap-1">
            {PIANO_SOUNDS.map((sound) => (
              <Button
                key={sound.id}
                variant={selectedSound === sound.id ? 'default' : 'outline'}
                size="sm"
                className={`text-left justify-start ${
                  selectedSound === sound.id
                    ? 'bg-primary text-primary-foreground'
                    : ''
                }`}
                onClick={() => handleSoundClick(sound.id)}
              >
                <div>
                  <div className="font-bold text-xs">{sound.label}</div>
                  <div className="text-xs opacity-70">{sound.description}</div>
                </div>
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
            {getCurrentPattern()?.label} in {selectedKey}
          </div>
          <div className="opacity-70">{getCurrentSound()?.label}</div>
          <div className="mt-1">
            n("{getCurrentPattern()?.pattern}").scale("{selectedKey}
            4:major").s("{selectedSound}")
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

SimplePianoNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const pattern = config?.pianoPattern;
  const sound = config?.pianoSound;
  const key = config?.pianoKey;

  if (!pattern || !sound || !key) return strudelString;

  const pianoCall = `n("${pattern}").scale("${key}4:major").s("${sound}")`;
  return strudelString ? `${strudelString}.stack(${pianoCall})` : pianoCall;
};
