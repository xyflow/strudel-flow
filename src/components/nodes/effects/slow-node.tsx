import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function SlowNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const factor = data.slow ? parseFloat(data.slow) : 0.5;

  const handleSliderChange = (values: number[]) => {
    const value = values[0];
    updateNodeData(id, { slow: value.toString() });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Speed</label>
          <span className="text-sm text-muted-foreground">{factor}x</span>
        </div>

        <Slider
          value={[factor]}
          onValueChange={handleSliderChange}
          min={0.1}
          max={2}
          step={0.05}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.1x</span>
          <span>2x</span>
        </div>
      </div>
    </WorkflowNode>
  );
}

SlowNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const slow = node.data.slow ? parseFloat(node.data.slow) : 0.5;
  if (slow === 0.5) return strudelString;

  const slowCall = `slow(${slow})`;
  return strudelString ? `${strudelString}.${slowCall}` : slowCall;
};
