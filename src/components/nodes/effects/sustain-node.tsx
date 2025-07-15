import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Slider } from '@/components/ui/slider';

export function SustainNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const sustain = useStrudelStore((state) =>
    state.config[id]?.sustain ? parseFloat(state.config[id].sustain!) : 0.5
  );

  // Handler for sustain changes
  const handleSustainChange = (value: number[]) => {
    updateNode(id, { sustain: value[0].toString() });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Sustain Level: {sustain.toFixed(2)}
          </label>
          <Slider
            value={[sustain]}
            onValueChange={handleSustainChange}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

SustainNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const sustain = useStrudelStore.getState().config[node.id]?.sustain;
  if (!sustain) return strudelString;

  const sustainCall = `sustain(${sustain})`;
  return strudelString ? `${strudelString}.${sustainCall}` : sustainCall;
};
