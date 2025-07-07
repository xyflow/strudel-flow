import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Slider } from '@/components/ui/slider';
import { useMemo } from 'react';

export function SizeNode({ id, data }: WorkflowNodeProps) {
  const strudelStore = useStrudelStore();
  const config = useMemo(
    () => strudelStore.config[id] || {},
    [id, strudelStore.config]
  );
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Extract value or set default
  const size = config.size ? parseFloat(config.size) : 4;

  // Handler for size changes
  const handleSizeChange = (value: number[]) => {
    updateNode(id, { size: value[0].toString() });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Size: {size}
          </label>
          <Slider
            value={[size]}
            onValueChange={handleSizeChange}
            min={1}
            max={16}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}
