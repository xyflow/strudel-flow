import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function FmNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const fm = parseFloat(data.fm || '0');

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            FM Amount: {fm.toFixed(1)}
          </label>
          <Slider
            value={[fm]}
            onValueChange={(value) =>
              updateNodeData(id, { fm: value[0].toString() })
            }
            min={0}
            max={10}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

FmNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const fm = parseFloat(node.data.fm || '0');
  if (fm === 0) return strudelString;

  const fmCall = `fm(${fm})`;
  return strudelString ? `${strudelString}.${fmCall}` : fmCall;
};
