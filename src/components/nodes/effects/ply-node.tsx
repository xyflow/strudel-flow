import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useStrudelStore } from '@/store/strudel-store';
import { Button } from '@/components/ui/button';

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

  // Read current values from Strudel store
  const config = useStrudelStore((state) => state.config[id] || {});
  const selectedMultiplier = config.plyMultiplierId || 'x2';
  const selectedProbability = config.plyProbabilityId || 'always';

  const handleMultiplierChange = (multiplierId: string) => {
    const multiplierData = PLY_MULTIPLIERS.find((m) => m.id === multiplierId);
    if (multiplierData) {
      updateNode(id, {
        plyMultiplierId: multiplierId,
        plyMultiplier: multiplierData.multiplier,
      });
    }
  };

  const handleProbabilityChange = (probabilityId: string) => {
    const probabilityData = PROBABILITY_OPTIONS.find(
      (p) => p.id === probabilityId
    );
    if (probabilityData) {
      updateNode(id, {
        plyProbabilityId: probabilityId,
        plyProbability: probabilityData.probability,
      });
    }
  };

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
                onClick={() => handleMultiplierChange(multiplier.id)}
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
                onClick={() => handleProbabilityChange(prob.id)}
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
