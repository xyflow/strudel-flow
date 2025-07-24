import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Slider } from '@/components/ui/slider';

export function FastNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const factor = useStrudelStore((state) =>
    state.config[id]?.fast ? parseFloat(state.config[id].fast!) : 2
  );

  const handleSliderChange = (values: number[]) => {
    const value = values[0];
    updateNode(id, { fast: value.toString() });
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
  const fast = useStrudelStore.getState().config[node.id]?.fast;
  if (!fast) return strudelString;

  const fastCall = `fast(${fast})`;
  return strudelString ? `${strudelString}.${fastCall}` : fastCall;
};
