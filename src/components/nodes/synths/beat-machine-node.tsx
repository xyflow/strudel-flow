import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import { StrudelConfig } from '@/types';

// Define the internal state interface for URL persistence
interface BeatMachineNodeInternalState {
  kickPattern: boolean[];
  snarePattern: boolean[];
  hihatPattern: boolean[];
}

const GENRE_PRESETS = [
  {
    id: 'house',
    label: 'House',
    kick: [
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ],
    snare: [
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ],
    hihat: [
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
    ],
  },
  {
    id: 'techno',
    label: 'Techno',
    kick: [
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ],
    snare: [
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      true,
    ],
    hihat: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  },
  {
    id: 'trap',
    label: 'Trap',
    kick: [
      true,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
      false,
      false,
    ],
    snare: [
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ],
    hihat: [
      false,
      true,
      true,
      false,
      true,
      true,
      false,
      true,
      true,
      false,
      true,
      true,
      false,
      true,
      true,
      false,
    ],
  },
  {
    id: 'funk',
    label: 'Funk',
    kick: [
      true,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
      true,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
    ],
    snare: [
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ],
    hihat: [
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
    ],
  },
  {
    id: 'rock',
    label: 'Rock',
    kick: [
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ],
    snare: [
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
    ],
    hihat: [
      true,
      true,
      false,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      false,
      true,
    ],
  },
  {
    id: 'latin',
    label: 'Latin',
    kick: [
      true,
      false,
      false,
      true,
      false,
      true,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
      true,
      false,
      false,
    ],
    snare: [
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
    ],
    hihat: [
      false,
      true,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
      true,
      false,
      false,
      true,
      false,
      false,
      true,
    ],
  },
];

export function BeatMachineNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: BeatMachineNodeInternalState }
  )?.internalState;

  // Initialize patterns with saved values or defaults
  const [kickPattern, setKickPattern] = useState<boolean[]>(
    savedInternalState?.kickPattern || Array(16).fill(false)
  );
  const [snarePattern, setSnarePattern] = useState<boolean[]>(
    savedInternalState?.snarePattern || Array(16).fill(false)
  );
  const [hihatPattern, setHihatPattern] = useState<boolean[]>(
    savedInternalState?.hihatPattern || Array(16).fill(false)
  );

  // State restoration flag to ensure we only restore once
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setKickPattern(savedInternalState.kickPattern);
      setSnarePattern(savedInternalState.snarePattern);
      setHihatPattern(savedInternalState.hihatPattern);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: BeatMachineNodeInternalState = {
      kickPattern,
      snarePattern,
      hihatPattern,
    };

    updateNodeData(id, { internalState });
  }, [kickPattern, snarePattern, hihatPattern, id, updateNodeData]);

  // Update Strudel whenever patterns change
  useEffect(() => {
    const config: Partial<StrudelConfig> = {
      beatKickPattern: patternToString(kickPattern),
      beatSnarePattern: patternToString(snarePattern),
      beatHihatPattern: patternToString(hihatPattern),
    };

    updateNode(id, config);
  }, [kickPattern, snarePattern, hihatPattern, id, updateNode]);

  const patternToString = (pattern: boolean[]) => {
    return pattern.map((active) => (active ? '1' : '~')).join(' ');
  };

  const toggleStep = (type: 'kick' | 'snare' | 'hihat', step: number) => {
    const setter =
      type === 'kick'
        ? setKickPattern
        : type === 'snare'
        ? setSnarePattern
        : setHihatPattern;
    setter((prev) =>
      prev.map((active, idx) => (idx === step ? !active : active))
    );
  };

  const loadPreset = (preset: (typeof GENRE_PRESETS)[0]) => {
    setKickPattern(preset.kick);
    setSnarePattern(preset.snare);
    setHihatPattern(preset.hihat);
  };

  const clearAll = () => {
    setKickPattern(Array(16).fill(false));
    setSnarePattern(Array(16).fill(false));
    setHihatPattern(Array(16).fill(false));
  };

  const getStepButton = (
    type: 'kick' | 'snare' | 'hihat',
    step: number,
    isActive: boolean
  ) => {
    const isDownbeat = step % 4 === 0;

    return (
      <Button
        key={step}
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        className={`w-8 h-8 p-0 transition-all duration-150 ${
          isDownbeat ? 'ring-1 ring-blue-400' : ''
        }`}
        onClick={() => toggleStep(type, step)}
        title={`${type} - Step ${step + 1}`}
      >
        {isActive ? '●' : '○'}
      </Button>
    );
  };

  const getTotalActiveSteps = () => {
    return (
      kickPattern.filter(Boolean).length +
      snarePattern.filter(Boolean).length +
      hihatPattern.filter(Boolean).length
    );
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-96">
        {/* Controls Row */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
            <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
              {getTotalActiveSteps()} steps
            </div>
          </div>
        </div>

        {/* Genre Presets */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Genre Presets</label>
          <div className="grid grid-cols-3 gap-1">
            {GENRE_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => loadPreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 16-Step Sequencer Grid */}
        <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded border">
          {/* Step Numbers Header */}
          <div className="flex items-center gap-1">
            <div className="w-12 text-xs font-mono font-medium">Step</div>
            {Array(16)
              .fill(0)
              .map((_, step) => (
                <div key={step} className="w-8 text-xs text-center font-mono">
                  {step + 1}
                </div>
              ))}
          </div>

          {/* Kick Row */}
          <div className="flex items-center gap-1">
            <div className="w-12 text-xs font-mono font-medium text-red-600">
              Kick
            </div>
            <div className="flex gap-1">
              {kickPattern.map((isActive, step) =>
                getStepButton('kick', step, isActive)
              )}
            </div>
          </div>

          {/* Snare Row */}
          <div className="flex items-center gap-1">
            <div className="w-12 text-xs font-mono font-medium text-blue-600">
              Snare
            </div>
            <div className="flex gap-1">
              {snarePattern.map((isActive, step) =>
                getStepButton('snare', step, isActive)
              )}
            </div>
          </div>

          {/* Hi-hat Row */}
          <div className="flex items-center gap-1">
            <div className="w-12 text-xs font-mono font-medium text-green-600">
              Hi-hat
            </div>
            <div className="flex gap-1">
              {hihatPattern.map((isActive, step) =>
                getStepButton('hihat', step, isActive)
              )}
            </div>
          </div>
        </div>

        {/* Live Pattern Display */}
        <div className="text-xs font-mono bg-muted px-2 py-1 rounded max-h-20 overflow-y-auto">
          <div className="font-bold">Live Pattern</div>
          <div className="opacity-70">
            <div>K: {patternToString(kickPattern)}</div>
            <div>S: {patternToString(snarePattern)}</div>
            <div>H: {patternToString(hihatPattern)}</div>
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

BeatMachineNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const kickPattern = config?.beatKickPattern;
  const snarePattern = config?.beatSnarePattern;
  const hihatPattern = config?.beatHihatPattern;

  if (!kickPattern && !snarePattern && !hihatPattern) return strudelString;

  const calls: string[] = [];

  if (kickPattern && kickPattern !== Array(16).fill('~').join(' ')) {
    calls.push(`sound("bd").struct("${kickPattern}")`);
  }

  if (snarePattern && snarePattern !== Array(16).fill('~').join(' ')) {
    calls.push(`sound("sd").struct("${snarePattern}")`);
  }

  if (hihatPattern && hihatPattern !== Array(16).fill('~').join(' ')) {
    calls.push(`sound("hh").struct("${hihatPattern}")`);
  }

  if (calls.length === 0) return strudelString;

  const beatCall = calls.length === 1 ? calls[0] : `stack(${calls.join(', ')})`;
  return strudelString ? `${strudelString}.stack(${beatCall})` : beatCall;
};
