import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function FastNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const factor = data.fast ? parseFloat(data.fast) : 2;

  const handleSliderChange = (values: number[]) => {
    const value = values[0];
    updateNodeData(id, { fast: value.toString() });
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
          min={0.5}
          max={8}
          step={0.1}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.5x</span>
          <span>8x</span>
        </div>
      </div>
    </WorkflowNode>
  );
}

FastNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const fast = node.data.fast ? parseFloat(node.data.fast) : 2;
  if (fast === 2) return strudelString;

  const fastCall = `fast(${fast})`;
  return strudelString ? `${strudelString}.${fastCall}` : fastCall;
};
