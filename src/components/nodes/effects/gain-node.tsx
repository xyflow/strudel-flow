import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Slider } from '@/components/ui/slider';
import { useMemo } from 'react';

export function GainNode({ id, data }: WorkflowNodeProps) {
  const strudelStore = useStrudelStore();
  const config = useMemo(
    () => strudelStore.config[id] || {},
    [id, strudelStore.config]
  );
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Extract value or set default
  const gain = config.gain ? parseFloat(config.gain) : 1;

  // Handler for gain changes
  const handleGainChange = (value: number[]) => {
    updateNode(id, { gain: value[0].toString() });
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
