import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Slider } from '@/components/ui/slider';
import { useMemo } from 'react';

export function SustainNode({ id, data }: WorkflowNodeProps) {
  const strudelStore = useStrudelStore();
  const config = useMemo(
    () => strudelStore.config[id] || {},
    [id, strudelStore.config]
  );
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Extract value or set default
  const sustain = config.sustain ? parseFloat(config.sustain) : 0.5;

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
