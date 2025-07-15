import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Slider } from '@/components/ui/slider';

export function SizeNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const size = useStrudelStore((state) =>
    state.config[id]?.size ? parseFloat(state.config[id].size!) : 4
  );

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

SizeNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const size = useStrudelStore.getState().config[node.id]?.size;
  if (!size) return strudelString;

  const sizeCall = `size(${size})`;
  return strudelString ? `${strudelString}.${sizeCall}` : sizeCall;
};
