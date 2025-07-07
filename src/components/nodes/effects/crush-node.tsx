import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Slider } from '@/components/ui/slider';
import { useMemo } from 'react';

export function CrushNode({ id, data }: WorkflowNodeProps) {
  const strudelStore = useStrudelStore();
  const config = useMemo(
    () => strudelStore.config[id] || {},
    [id, strudelStore.config]
  );
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Extract value or set default
  const crush = config.crush ? parseFloat(config.crush) : 16;

  // Handler for crush changes
  const handleCrushChange = (value: number[]) => {
    updateNode(id, { crush: value[0].toString() });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Bit Depth: {crush}
          </label>
          <Slider
            value={[crush]}
            onValueChange={handleCrushChange}
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
