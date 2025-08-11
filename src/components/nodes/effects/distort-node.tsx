import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function DistortNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const distortValue = data.distort || '0.5';

  // Extract values or set defaults
  const amount = distortValue.includes(':')
    ? parseFloat(distortValue.split(':')[0])
    : parseFloat(distortValue);
  const postgain = distortValue.includes(':')
    ? parseFloat(distortValue.split(':')[1])
    : 1;

  // Handler for distortion amount changes
  const handleAmountChange = (value: number[]) => {
    const newAmount = value[0];
    const distortValue =
      postgain !== 1 ? `${newAmount}:${postgain}` : `${newAmount}`;
    updateNodeData(id, { distort: distortValue });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-4 bg-card text-card-foreground rounded-md min-w-80">
        {/* Distortion amount */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Distortion</label>
            <span className="text-xs text-muted-foreground">
              {amount.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[amount]}
            onValueChange={handleAmountChange}
            min={0}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

DistortNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const distort = node.data.distort || '0.5';
  if (distort === '0.5') return strudelString;

  const distortCall = `distort(${distort})`;
  return strudelString ? `${strudelString}.${distortCall}` : distortCall;
};
