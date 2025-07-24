import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';

interface MaskNodeInternalState {
  selectedPattern: string;
  selectedProbability: string;
}

const MASK_PATTERNS = [
  {
    id: 'quarter',
    label: '1/4',
    pattern: '1 0 0 0',
    description: 'Every 4th step',
  },
  { id: 'half', label: '1/2', pattern: '1 0', description: 'Every 2nd step' },
  {
    id: 'alternate',
    label: 'Alt',
    pattern: '1 0 1 0',
    description: 'Alternating',
  },
  {
    id: 'syncopated',
    label: 'Sync',
    pattern: '0 1 0 1',
    description: 'Off-beat',
  },
  {
    id: 'triplet',
    label: '3/4',
    pattern: '1 1 1 0',
    description: 'Triplet feel',
  },
  {
    id: 'complex',
    label: 'Comp',
    pattern: '1 0 1 1 0 0 1 0',
    description: 'Complex pattern',
  },
];

const PROBABILITY_OPTIONS = [
  {
    id: 'always',
    label: 'Always',
    probability: '1',
    description: 'Always apply',
  },
  {
    id: 'often',
    label: 'Often',
    probability: '0.8',
    description: '80% chance',
  },
  {
    id: 'sometimes',
    label: 'Sometimes',
    probability: '0.5',
    description: '50% chance',
  },
  {
    id: 'rarely',
    label: 'Rarely',
    probability: '0.2',
    description: '20% chance',
  },
];

export function MaskNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const savedInternalState = (data as { internalState?: MaskNodeInternalState })
    ?.internalState;
  const [selectedPattern, setSelectedPattern] = useState(
    savedInternalState?.selectedPattern || 'half'
  );
  const [selectedProbability, setSelectedProbability] = useState(
    savedInternalState?.selectedProbability || 'always'
  );
  const [hasRestoredState, setHasRestoredState] = useState(false);

  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setSelectedPattern(savedInternalState.selectedPattern);
      setSelectedProbability(savedInternalState.selectedProbability);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  useEffect(() => {
    const internalState: MaskNodeInternalState = {
      selectedPattern,
      selectedProbability,
    };
    updateNodeData(id, { internalState });
  }, [selectedPattern, selectedProbability, id, updateNodeData]);

  useEffect(() => {
    const patternData = MASK_PATTERNS.find((p) => p.id === selectedPattern);
    const probabilityData = PROBABILITY_OPTIONS.find(
      (p) => p.id === selectedProbability
    );

    if (patternData && probabilityData) {
      updateNode(id, {
        maskPattern: patternData.pattern,
        maskProbability: probabilityData.probability,
      });
    }
  }, [selectedPattern, selectedProbability, id, updateNode]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Mask Pattern</label>
          <div className="grid grid-cols-3 gap-1">
            {MASK_PATTERNS.map((pattern) => (
              <Button
                key={pattern.id}
                variant={selectedPattern === pattern.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPattern(pattern.id)}
                title={pattern.description}
              >
                {pattern.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Probability</label>
          <div className="grid grid-cols-2 gap-1">
            {PROBABILITY_OPTIONS.map((prob) => (
              <Button
                key={prob.id}
                variant={
                  selectedProbability === prob.id ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedProbability(prob.id)}
                title={prob.description}
              >
                {prob.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

MaskNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const pattern = config?.maskPattern;
  const probability = config?.maskProbability;

  if (!pattern) return strudelString;

  let maskCall = `.mask("${pattern}")`;
  if (probability && probability !== '1') {
    maskCall = `.sometimes(${probability}, x => x${maskCall})`;
  }
  return strudelString + maskCall;
};
