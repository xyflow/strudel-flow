import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';

interface PlyNodeInternalState {
  selectedMultiplier: string;
  selectedProbability: string;
}

const PLY_MULTIPLIERS = [
  { id: 'x2', label: '×2', multiplier: '2', description: 'Double each note' },
  { id: 'x3', label: '×3', multiplier: '3', description: 'Triple each note' },
  {
    id: 'x4',
    label: '×4',
    multiplier: '4',
    description: 'Quadruple each note',
  },
  { id: 'x5', label: '×5', multiplier: '5', description: '5 times each note' },
  { id: 'x8', label: '×8', multiplier: '8', description: '8 times each note' },
  {
    id: 'random',
    label: 'Rand',
    multiplier: 'rand.range(2,5)',
    description: 'Random 2-5x',
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

export function PlyNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const savedInternalState = (data as { internalState?: PlyNodeInternalState })
    ?.internalState;
  const [selectedMultiplier, setSelectedMultiplier] = useState(
    savedInternalState?.selectedMultiplier || 'x2'
  );
  const [selectedProbability, setSelectedProbability] = useState(
    savedInternalState?.selectedProbability || 'always'
  );
  const [hasRestoredState, setHasRestoredState] = useState(false);

  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setSelectedMultiplier(savedInternalState.selectedMultiplier);
      setSelectedProbability(savedInternalState.selectedProbability);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  useEffect(() => {
    const internalState: PlyNodeInternalState = {
      selectedMultiplier,
      selectedProbability,
    };
    updateNodeData(id, { internalState });
  }, [selectedMultiplier, selectedProbability, id, updateNodeData]);

  useEffect(() => {
    const multiplierData = PLY_MULTIPLIERS.find(
      (m) => m.id === selectedMultiplier
    );
    const probabilityData = PROBABILITY_OPTIONS.find(
      (p) => p.id === selectedProbability
    );

    if (multiplierData && probabilityData) {
      updateNode(id, {
        plyMultiplier: multiplierData.multiplier,
        plyProbability: probabilityData.probability,
      });
    }
  }, [selectedMultiplier, selectedProbability, id, updateNode]);

  const getCurrentMultiplier = () =>
    PLY_MULTIPLIERS.find((m) => m.id === selectedMultiplier);
  const getCurrentProbability = () =>
    PROBABILITY_OPTIONS.find((p) => p.id === selectedProbability);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Multiplier</label>
          <div className="grid grid-cols-3 gap-1">
            {PLY_MULTIPLIERS.map((multiplier) => (
              <Button
                key={multiplier.id}
                variant={
                  selectedMultiplier === multiplier.id ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedMultiplier(multiplier.id)}
                title={multiplier.description}
              >
                {multiplier.label}
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

        <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
          <div className="font-bold">
            {getCurrentMultiplier()?.label} • {getCurrentProbability()?.label}
          </div>
          <div className="opacity-70">
            {getCurrentMultiplier()?.description}
          </div>
          <div className="mt-1">
            .ply({getCurrentMultiplier()?.multiplier})
            {getCurrentProbability()?.probability !== '1' &&
              `.sometimes(${getCurrentProbability()?.probability})`}
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

PlyNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const multiplier = config?.plyMultiplier;
  const probability = config?.plyProbability;

  if (!multiplier) return strudelString;

  let plyCall = `.ply(${multiplier})`;
  if (probability && probability !== '1') {
    plyCall = `.sometimes(${probability}, x => x${plyCall})`;
  }
  return strudelString + plyCall;
};
