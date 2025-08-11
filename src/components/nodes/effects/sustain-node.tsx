import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function SustainNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const sustain = parseFloat(data.sustain || '1');

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Sustain Level: {sustain.toFixed(2)}
          </label>
          <Slider
            value={[sustain]}
            onValueChange={(value) =>
              updateNodeData(id, { sustain: value[0].toString() })
            }
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
  const sustain = parseFloat(node.data.sustain || '1');
  if (sustain === 1) return strudelString;

  const sustainCall = `sustain("${sustain}")`;
  return strudelString ? `${strudelString}.${sustainCall}` : sustainCall;
};
