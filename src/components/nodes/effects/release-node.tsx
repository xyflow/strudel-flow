import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Slider } from '@/components/ui/slider';

export function ReleaseNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const release = useStrudelStore((state) =>
    parseFloat(state.config[id]?.release || '0.1')
  );

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
              updateNode(id, { release: value[0].toString() })
            }
            min={0.01}
            max={3.0}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

ReleaseNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const release = useStrudelStore.getState().config[node.id]?.release;
  if (!release) return strudelString;

  const releaseCall = `release(${release})`;
  return strudelString ? `${strudelString}.${releaseCall}` : releaseCall;
};
