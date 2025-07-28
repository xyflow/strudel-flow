import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Slider } from '@/components/ui/slider';

export function FMNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const fm = useStrudelStore((state) =>
    parseFloat(state.config[id]?.fm || '0.01')
  );

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            FM: {fm.toFixed(3)}s
          </label>
          <Slider
            value={[fm]}
            onValueChange={(value) =>
              updateNode(id, { fm: value[0].toString() })
            }
            min={0.001}
            max={2.0}
            step={0.001}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

FMNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const fm = useStrudelStore.getState().config[node.id]?.fm;
  if (!fm) return strudelString;

  const fmCall = `fm("${fm}")`;
  return strudelString ? `${strudelString}.${fmCall}` : fmCall;
};
