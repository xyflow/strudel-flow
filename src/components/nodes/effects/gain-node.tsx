import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function GainNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const gain = data.gain ? parseFloat(data.gain) : 1;

  // Handler for gain changes
  const handleGainChange = (value: number[]) => {
    updateNodeData(id, { gain: value[0].toString() });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-4 bg-card text-card-foreground rounded-md min-w-80">
        {/* Gain control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Gain</label>
            <span className="text-xs text-muted-foreground">
              {gain.toFixed(1)}x{' '}
              {gain > 1
                ? `(+${(20 * Math.log10(gain)).toFixed(1)}dB)`
                : gain < 1
                ? `(${(20 * Math.log10(gain)).toFixed(1)}dB)`
                : '(0dB)'}
            </span>
          </div>
          <Slider
            value={[gain]}
            onValueChange={handleGainChange}
            min={0.1}
            max={5}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

GainNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const gain = node.data.gain ? parseFloat(node.data.gain) : 1;
  if (gain === 1) return strudelString;

  const gainCall = `gain(${gain})`;
  return strudelString ? `${strudelString}.${gainCall}` : gainCall;
};
