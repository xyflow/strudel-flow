import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { StrudelConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ProbabilityNodeInternalState {
  selectedFunction: string;
  probability: number;
  maskPattern: string;
}

const PROBABILITY_FUNCTIONS = [
  { id: 'rarely', label: 'Rarely' },
  {
    id: 'sometimes',
    label: 'Sometimes',
  },
  { id: 'often', label: 'Often' },
  { id: 'always', label: 'Always' },
  { id: 'mask', label: 'Mask' },
];

const MASK_PRESETS = [
  { pattern: '<0 1>/2', label: 'Every Other' },
  { pattern: '<1 0 1 0>/4', label: 'On 1 & 3' },
  { pattern: '<1 1 0 1>/4', label: 'Skip 3rd' },
  { pattern: '<1 0 0 1>/4', label: 'Sparse' },
  { pattern: '<1 1 1 0>/4', label: 'Drop Last' },
  { pattern: '<0 1 1 0>/4', label: 'Middle Two' },
];

export function ProbabilityNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: ProbabilityNodeInternalState }
  )?.internalState;

  // Initialize state with saved values or defaults
  const [selectedFunction, setSelectedFunction] = useState(
    savedInternalState?.selectedFunction || 'sometimes'
  );
  const [probability, setProbability] = useState(
    savedInternalState?.probability || 0.5
  );
  const [maskPattern, setMaskPattern] = useState(
    savedInternalState?.maskPattern || '<0 1>/2'
  );

  // State restoration flag to ensure we only restore once
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setSelectedFunction(savedInternalState.selectedFunction);
      setProbability(savedInternalState.probability);
      setMaskPattern(savedInternalState.maskPattern);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: ProbabilityNodeInternalState = {
      selectedFunction,
      probability,
      maskPattern,
    };

    updateNodeData(id, { internalState });
  }, [selectedFunction, probability, maskPattern, id, updateNodeData]);

  // Update strudel whenever settings change
  useEffect(() => {
    const config: Partial<StrudelConfig> = {
      probFunction: selectedFunction,
    };

    if (selectedFunction === 'mask') {
      config.maskPattern = maskPattern;
    } else if (selectedFunction !== 'always') {
      config.probability = probability;
    }

    updateNode(id, config);
  }, [selectedFunction, probability, maskPattern, id, updateNode]);

  const handleFunctionClick = (functionId: string) => {
    setSelectedFunction(functionId);
  };

  const handleMaskPresetClick = (pattern: string) => {
    setMaskPattern(pattern);
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        {/* Function Buttons */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">
            Probability Function
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PROBABILITY_FUNCTIONS.map((func) => (
              <Button
                key={func.id}
                onClick={() => handleFunctionClick(func.id)}
              >
                {func.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Probability Slider - for rarely, sometimes, often */}
        {selectedFunction !== 'mask' && selectedFunction !== 'always' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-medium">
              Probability: {Math.round(probability * 100)}%
            </label>
            <Slider
              value={[probability]}
              onValueChange={(value) => setProbability(value[0])}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>
        )}

        {/* Mask Pattern Controls */}
        {selectedFunction === 'mask' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-medium">
              Mask Pattern
            </label>
            <input
              type="text"
              value={maskPattern}
              onChange={(e) => setMaskPattern(e.target.value)}
              placeholder="<0 1>/2"
              className="font-mono text-sm px-3 py-2 border rounded-md bg-transparent border-input"
            />
            <div className="grid grid-cols-2 gap-1">
              {MASK_PRESETS.map((preset) => (
                <Button
                  key={preset.pattern}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleMaskPresetClick(preset.pattern)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Current Function Display */}
        <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
          {selectedFunction === 'mask'
            ? `mask("${maskPattern}")`
            : selectedFunction === 'always'
            ? 'No probability filtering'
            : `${selectedFunction}(${probability})`}
        </div>
      </div>
    </WorkflowNode>
  );
}

ProbabilityNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const probFunction = useStrudelStore.getState().config[node.id]?.probFunction;
  const probability = useStrudelStore.getState().config[node.id]?.probability;
  const maskPattern = useStrudelStore.getState().config[node.id]?.maskPattern;

  if (!probFunction || probFunction === 'always') return strudelString;
  if (!strudelString) return strudelString;

  let result = '';

  if (probFunction === 'mask') {
    result = `${strudelString}.mask("${maskPattern}")`;
  } else {
    result = `${strudelString}.${probFunction}(${probability})`;
  }

  return result;
};
