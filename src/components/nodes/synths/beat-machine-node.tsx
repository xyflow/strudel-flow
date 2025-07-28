import { useMemo } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';

export function BeatMachineNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Get current patterns from strudel store with optimized selectors
  const kickPatternString = useStrudelStore(
    (state) => state.config[id]?.beatKickPattern || ''
  );
  const snarePatternString = useStrudelStore(
    (state) => state.config[id]?.beatSnarePattern || ''
  );
  const hihatPatternString = useStrudelStore(
    (state) => state.config[id]?.beatHihatPattern || ''
  );

  const stringToPattern = (patternString: string): boolean[] => {
    if (!patternString) return Array(8).fill(false);
    return patternString.split(' ').map((char) => char === '1');
  };

  const patternToString = (pattern: boolean[]) => {
    return pattern.map((active) => (active ? '1' : '~')).join(' ');
  };

  // Memoize pattern conversions to prevent unnecessary recalculations
  const kickPattern = useMemo(
    () => stringToPattern(kickPatternString),
    [kickPatternString]
  );
  const snarePattern = useMemo(
    () => stringToPattern(snarePatternString),
    [snarePatternString]
  );
  const hihatPattern = useMemo(
    () => stringToPattern(hihatPatternString),
    [hihatPatternString]
  );

  const toggleStep = (type: 'kick' | 'snare' | 'hihat', step: number) => {
    const currentPattern =
      type === 'kick'
        ? kickPattern
        : type === 'snare'
        ? snarePattern
        : hihatPattern;
    const newPattern = currentPattern.map((active, idx) =>
      idx === step ? !active : active
    );
    const patternKey =
      type === 'kick'
        ? 'beatKickPattern'
        : type === 'snare'
        ? 'beatSnarePattern'
        : 'beatHihatPattern';

    updateNode(id, { [patternKey]: patternToString(newPattern) });
  };

  const clearAll = () => {
    const emptyPattern = patternToString(Array(8).fill(false));
    updateNode(id, {
      beatKickPattern: emptyPattern,
      beatSnarePattern: emptyPattern,
      beatHihatPattern: emptyPattern,
    });
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

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-96">
        {/* 8-Step Sequencer Grid */}
        <div className="flex flex-col gap-2 p-3 rounded border">
          {/* Step Numbers Header */}
          <div className="flex items-center gap-1">
            <div className="w-12 text-xs font-mono font-medium">Step</div>
            {Array(8)
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

  if (kickPattern && kickPattern !== Array(8).fill('~').join(' ')) {
    calls.push(`sound("bd").struct("${kickPattern}")`);
  }

  if (snarePattern && snarePattern !== Array(8).fill('~').join(' ')) {
    calls.push(`sound("sd").struct("${snarePattern}")`);
  }

  if (hihatPattern && hihatPattern !== Array(8).fill('~').join(' ')) {
    calls.push(`sound("hh").struct("${hihatPattern}")`);
  }

  if (calls.length === 0) return strudelString;

  const beatCall = calls.length === 1 ? calls[0] : `stack(${calls.join(', ')})`;
  return strudelString ? `${strudelString}.stack(${beatCall})` : beatCall;
};
