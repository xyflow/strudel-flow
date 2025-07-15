import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Slider } from '@/components/ui/slider';

export function CrushNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const crush = useStrudelStore((state) => state.config[id]?.crush ? parseFloat(state.config[id].crush!) : 16);

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

// Define the strudel output transformation
(CrushNode as any).strudelOutput = (node: AppNode, strudelString: string) => {
  const crush = useStrudelStore.getState().config[node.id]?.crush;
  if (!crush) return strudelString;
  
  const crushCall = `crush("${crush}")`;
  return strudelString ? `${strudelString}.${crushCall}` : crushCall;
};
