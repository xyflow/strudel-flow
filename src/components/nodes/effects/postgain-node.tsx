import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Slider } from '@/components/ui/slider';
import { useMemo } from 'react';

export function PostGainNode({ id, data }: WorkflowNodeProps) {
  const strudelStore = useStrudelStore();
  const config = useMemo(
    () => strudelStore.config[id] || {},
    [id, strudelStore.config]
  );
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Extract value or set default
  const postgain = config.postgain ? parseFloat(config.postgain) : 1.5;

  // Handler for postgain changes
  const handlePostgainChange = (value: number[]) => {
    updateNode(id, { postgain: value[0].toString() });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            PostGain: {postgain.toFixed(1)}
          </label>
          <Slider
            value={[postgain]}
            onValueChange={handlePostgainChange}
            min={0.1}
            max={5.0}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}
