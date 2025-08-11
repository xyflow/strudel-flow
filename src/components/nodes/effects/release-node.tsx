import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function ReleaseNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const release = parseFloat(data.release || '0.1');

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Release Time: {release.toFixed(3)}s
          </label>
          <Slider
            value={[release]}
            onValueChange={(value) =>
              updateNodeData(id, { release: value[0].toString() })
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

ReleaseNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const release = parseFloat(node.data.release || '0.1');
  if (release === 0.1) return strudelString;

  const releaseCall = `release("${release}")`;
  return strudelString ? `${strudelString}.${releaseCall}` : releaseCall;
};
