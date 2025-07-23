import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { StrudelConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Define the internal state interface for URL persistence
interface ProbabilityNodeInternalState {
  selectedFunction: string;
  probability: number;
  maskPattern: string;
  customValue: string;
}

const PROBABILITY_FUNCTIONS = [
  { id: 'rarely', label: 'Rarely', color: 'bg-red-500 hover:bg-red-600' },
  {
    id: 'sometimes',
    label: 'Sometimes',
    color: 'bg-yellow-500 hover:bg-yellow-600',
  },
  { id: 'often', label: 'Often', color: 'bg-green-500 hover:bg-green-600' },
  { id: 'always', label: 'Always', color: 'bg-blue-500 hover:bg-blue-600' },
  { id: 'mask', label: 'Mask', color: 'bg-purple-500 hover:bg-purple-600' },
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
  const [customValue, setCustomValue] = useState(
    savedInternalState?.customValue || ''
  );

  // State restoration flag to ensure we only restore once
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      console.log(
        `ProbabilityNode ${id} - Restoring state from saved internal state:`,
        savedInternalState
      );

      setSelectedFunction(savedInternalState.selectedFunction);
      setProbability(savedInternalState.probability);
      setMaskPattern(savedInternalState.maskPattern);
      setCustomValue(savedInternalState.customValue);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: ProbabilityNodeInternalState = {
      selectedFunction,
      probability,
      maskPattern,
      customValue,
    };

    updateNodeData(id, { internalState });
  }, [
    selectedFunction,
    probability,
    maskPattern,
    customValue,
    id,
    updateNodeData,
  ]);

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

    if (customValue.trim()) {
      config.customValue = customValue;
    }

    updateNode(id, config);
  }, [selectedFunction, probability, maskPattern, customValue, id, updateNode]);

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
                className={`h-12 text-white font-bold ${
                  selectedFunction === func.id
                    ? func.color + ' ring-2 ring-white'
                    : func.color + ' opacity-70'
                }`}
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

        {/* Advanced Controls */}
        <Accordion type="single" collapsible>
          <AccordionItem value="advanced">
            <AccordionTrigger className="text-xs font-mono py-2">
              Advanced
            </AccordionTrigger>
            <AccordionContent className="overflow-hidden">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono font-medium">
                  Custom Function
                </label>
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="e.g., ply(2), chunk(4, fast(2))"
                  className="font-mono text-sm px-3 py-2 border rounded-md bg-transparent border-input"
                />
                <div className="text-xs text-muted-foreground">
                  Add custom probability functions
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Current Function Display */}
        <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
          {selectedFunction === 'mask'
            ? `mask("${maskPattern}")`
            : selectedFunction === 'always'
            ? 'No probability filtering'
            : `${selectedFunction}(${probability}${
                customValue ? `, ${customValue}` : ''
              })`}
        </div>
      </div>
    </WorkflowNode>
  );
}

ProbabilityNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const probFunction = useStrudelStore.getState().config[node.id]?.probFunction;
  const probability = useStrudelStore.getState().config[node.id]?.probability;
  const maskPattern = useStrudelStore.getState().config[node.id]?.maskPattern;
  const customValue = useStrudelStore.getState().config[node.id]?.customValue;

  if (!probFunction || probFunction === 'always') return strudelString;
  if (!strudelString) return strudelString;

  let result = '';

  if (probFunction === 'mask') {
    result = `${strudelString}.mask("${maskPattern}")`;
  } else {
    const args = customValue ? `${probability}, ${customValue}` : probability;
    result = `${strudelString}.${probFunction}(${args})`;
  }

  return result;
};
