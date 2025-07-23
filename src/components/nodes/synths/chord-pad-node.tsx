import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import { StrudelConfig } from '@/types';

// Define the internal state interface for URL persistence
interface ChordPadNodeInternalState {
  selectedProgression: string;
  selectedVoicing: string;
  selectedStrum: string;
  selectedRhythm: string;
  selectedKey: string;
  selectedSound: string;
}

const CHORD_PROGRESSIONS = [
  {
    id: 'pop',
    label: 'Pop (I-V-vi-IV)',
    chords: '0 4 5 3',
    description: 'Most popular progression',
  },
  {
    id: 'jazz251',
    label: 'Jazz (ii-V-I)',
    chords: '1 4 0',
    description: 'Classic jazz turnaround',
  },
  {
    id: 'circle',
    label: 'Circle of 5ths',
    chords: '0 3 6 1 4 7 2 5',
    description: 'Harmonic cycle',
  },
  {
    id: 'minor',
    label: 'Minor (vi-IV-I-V)',
    chords: '5 3 0 4',
    description: 'Sad but strong',
  },
  {
    id: 'blues',
    label: 'Blues (I-IV-V)',
    chords: '0 3 4',
    description: '12-bar blues base',
  },
  {
    id: 'modal',
    label: 'Modal (i-VII-VI)',
    chords: '0 6 5',
    description: 'Dorian flavor',
  },
  {
    id: 'gospel',
    label: 'Gospel (I-vi-ii-V)',
    chords: '0 5 1 4',
    description: 'Soulful progression',
  },
  {
    id: 'rock',
    label: 'Rock (I-bVII-IV)',
    chords: '0 6 3',
    description: 'Power progression',
  },
];

const CHORD_VOICINGS = [
  {
    id: 'root',
    label: 'Root Position',
    voicing: '[0,2,4]',
    description: 'Standard voicing',
  },
  {
    id: 'first',
    label: '1st Inversion',
    voicing: '[2,4,7]',
    description: 'Bass on 3rd',
  },
  {
    id: 'second',
    label: '2nd Inversion',
    voicing: '[4,7,9]',
    description: 'Bass on 5th',
  },
  {
    id: 'spread',
    label: 'Spread',
    voicing: '[0,4,9,14]',
    description: 'Wide voicing',
  },
  {
    id: 'cluster',
    label: 'Cluster',
    voicing: '[0,1,2,4]',
    description: 'Tight intervals',
  },
  {
    id: 'shell',
    label: 'Shell',
    voicing: '[0,6]',
    description: 'Root and 7th only',
  },
];

const STRUM_PATTERNS = [
  {
    id: 'block',
    label: 'Block',
    pattern: '',
    description: 'All notes together',
  },
  {
    id: 'down',
    label: 'Down Strum',
    pattern: '.early(0,-0.02,-0.04,-0.06)',
    description: 'Top to bottom',
  },
  {
    id: 'up',
    label: 'Up Strum',
    pattern: '.early(-0.06,-0.04,-0.02,0)',
    description: 'Bottom to top',
  },
  {
    id: 'fingerpick',
    label: 'Fingerpick',
    pattern: '.early(0,-0.1,-0.05,-0.15)',
    description: 'Arpeggiated feel',
  },
  {
    id: 'tremolo',
    label: 'Tremolo',
    pattern: '.fast(4)',
    description: 'Rapid repetition',
  },
  {
    id: 'broken',
    label: 'Broken',
    pattern: '.chunk(2)',
    description: 'Split into parts',
  },
];

const RHYTHM_PATTERNS = [
  {
    id: 'whole',
    label: 'Whole Notes',
    rhythm: '1 ~ ~ ~ 1 ~ ~ ~',
    description: 'Long sustain',
  },
  {
    id: 'half',
    label: 'Half Notes',
    rhythm: '1 ~ 1 ~ 1 ~ 1 ~',
    description: 'Steady pulse',
  },
  {
    id: 'quarter',
    label: 'Quarter Notes',
    rhythm: '1 1 1 1',
    description: 'Regular beats',
  },
  {
    id: 'syncopated',
    label: 'Syncopated',
    rhythm: '1 ~ 1 ~ ~ 1 ~ 1',
    description: 'Off-beat accent',
  },
  {
    id: 'reggae',
    label: 'Reggae',
    rhythm: '~ 1 ~ 1',
    description: 'Upstroke feel',
  },
  {
    id: 'latin',
    label: 'Latin',
    rhythm: '1 ~ ~ 1 ~ 1 ~ ~',
    description: 'Latin rhythm',
  },
];

const CHORD_SOUNDS = [
  { id: 'gm_acoustic_grand_piano', label: 'Grand Piano' },
  { id: 'gm_electric_piano_1', label: 'Electric Piano' },
  { id: 'gm_pad_2_warm', label: 'Warm Pad' },
  { id: 'gm_acoustic_guitar_nylon', label: 'Nylon Guitar' },
  { id: 'gm_drawbar_organ', label: 'Organ' },
  { id: 'gm_string_ensemble_1', label: 'Strings' },
];

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function ChordPadNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: ChordPadNodeInternalState }
  )?.internalState;

  // Initialize state with saved values or defaults
  const [selectedProgression, setSelectedProgression] = useState(
    savedInternalState?.selectedProgression || 'pop'
  );
  const [selectedVoicing, setSelectedVoicing] = useState(
    savedInternalState?.selectedVoicing || 'root'
  );
  const [selectedStrum, setSelectedStrum] = useState(
    savedInternalState?.selectedStrum || 'block'
  );
  const [selectedRhythm, setSelectedRhythm] = useState(
    savedInternalState?.selectedRhythm || 'quarter'
  );
  const [selectedKey, setSelectedKey] = useState(
    savedInternalState?.selectedKey || 'C'
  );
  const [selectedSound, setSelectedSound] = useState(
    savedInternalState?.selectedSound || 'gm_acoustic_grand_piano'
  );

  // State restoration flag to ensure we only restore once
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setSelectedProgression(savedInternalState.selectedProgression);
      setSelectedVoicing(savedInternalState.selectedVoicing);
      setSelectedStrum(savedInternalState.selectedStrum);
      setSelectedRhythm(savedInternalState.selectedRhythm);
      setSelectedKey(savedInternalState.selectedKey);
      setSelectedSound(savedInternalState.selectedSound);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: ChordPadNodeInternalState = {
      selectedProgression,
      selectedVoicing,
      selectedStrum,
      selectedRhythm,
      selectedKey,
      selectedSound,
    };

    updateNodeData(id, { internalState });
  }, [
    selectedProgression,
    selectedVoicing,
    selectedStrum,
    selectedRhythm,
    selectedKey,
    selectedSound,
    id,
    updateNodeData,
  ]);

  // Update strudel whenever settings change
  useEffect(() => {
    const progressionData = CHORD_PROGRESSIONS.find(
      (p) => p.id === selectedProgression
    );
    const voicingData = CHORD_VOICINGS.find((v) => v.id === selectedVoicing);
    const strumData = STRUM_PATTERNS.find((s) => s.id === selectedStrum);
    const rhythmData = RHYTHM_PATTERNS.find((r) => r.id === selectedRhythm);

    if (progressionData && voicingData && strumData && rhythmData) {
      const config: Partial<StrudelConfig> = {
        chordProgression: progressionData.chords,
        chordVoicing: voicingData.voicing,
        chordStrum: strumData.pattern,
        chordRhythm: rhythmData.rhythm,
        chordKey: selectedKey,
        chordSound: selectedSound,
      };

      updateNode(id, config);
    }
  }, [
    selectedProgression,
    selectedVoicing,
    selectedStrum,
    selectedRhythm,
    selectedKey,
    selectedSound,
    id,
    updateNode,
  ]);

  const getCurrentProgression = () =>
    CHORD_PROGRESSIONS.find((p) => p.id === selectedProgression);
  const getCurrentVoicing = () =>
    CHORD_VOICINGS.find((v) => v.id === selectedVoicing);
  const getCurrentStrum = () =>
    STRUM_PATTERNS.find((s) => s.id === selectedStrum);
  const getCurrentRhythm = () =>
    RHYTHM_PATTERNS.find((r) => r.id === selectedRhythm);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        {/* Chord Progressions */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">
            Chord Progression
          </label>
          <div className="grid grid-cols-2 gap-1">
            {CHORD_PROGRESSIONS.map((progression) => (
              <Button
                key={progression.id}
                variant={
                  selectedProgression === progression.id ? 'default' : 'outline'
                }
                size="sm"
                className="h-12 text-xs"
                onClick={() => setSelectedProgression(progression.id)}
              >
                <div className="text-center">
                  <div>{progression.label}</div>
                  <div className="text-xs opacity-70">
                    {progression.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Chord Voicings */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Voicing</label>
          <div className="grid grid-cols-3 gap-1">
            {CHORD_VOICINGS.map((voicing) => (
              <Button
                key={voicing.id}
                variant={selectedVoicing === voicing.id ? 'default' : 'outline'}
                size="sm"
                className="h-10 text-xs"
                onClick={() => setSelectedVoicing(voicing.id)}
              >
                <div className="text-center">
                  <div>{voicing.label}</div>
                  <div className="text-xs opacity-70">
                    {voicing.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Strum Patterns */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Strum</label>
          <div className="grid grid-cols-3 gap-1">
            {STRUM_PATTERNS.map((strum) => (
              <Button
                key={strum.id}
                variant={selectedStrum === strum.id ? 'default' : 'outline'}
                size="sm"
                className="h-10 text-xs"
                onClick={() => setSelectedStrum(strum.id)}
              >
                <div className="text-center">
                  <div>{strum.label}</div>
                  <div className="text-xs opacity-70">{strum.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Rhythm Patterns */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Rhythm</label>
          <div className="grid grid-cols-3 gap-1">
            {RHYTHM_PATTERNS.map((rhythm) => (
              <Button
                key={rhythm.id}
                variant={selectedRhythm === rhythm.id ? 'default' : 'outline'}
                size="sm"
                className="h-10 text-xs"
                onClick={() => setSelectedRhythm(rhythm.id)}
              >
                <div className="text-center">
                  <div>{rhythm.label}</div>
                  <div className="text-xs opacity-70">{rhythm.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Sound Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Chord Sound</label>
          <div className="grid grid-cols-3 gap-1">
            {CHORD_SOUNDS.map((sound) => (
              <Button
                key={sound.id}
                variant={selectedSound === sound.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSound(sound.id)}
              >
                {sound.label}
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
            {getCurrentProgression()?.label} • {getCurrentVoicing()?.label}
          </div>
          <div className="opacity-70">
            {getCurrentStrum()?.label} • {getCurrentRhythm()?.label}
          </div>
          <div className="mt-1">
            n("{getCurrentProgression()?.chords}").scale("{selectedKey}
            4:major").chord("{getCurrentVoicing()?.voicing}").struct("
            {getCurrentRhythm()?.rhythm}").s("{selectedSound}")
            {getCurrentStrum()?.pattern}
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

ChordPadNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const progression = config?.chordProgression;
  const voicing = config?.chordVoicing;
  const strum = config?.chordStrum;
  const rhythm = config?.chordRhythm;
  const key = config?.chordKey;
  const sound = config?.chordSound;

  if (!progression || !voicing || !rhythm || !key || !sound)
    return strudelString;

  // Build the chord pad call
  let chordCall = `n("${progression}").scale("${key}4:major").chord("${voicing}").struct("${rhythm}").s("${sound}")`;

  // Add strum pattern if present
  if (strum) {
    chordCall += strum;
  }

  return strudelString ? `${strudelString}.stack(${chordCall})` : chordCall;
};
