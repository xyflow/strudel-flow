import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Slider } from '@/components/ui/slider';

export function AttackNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const attack = useStrudelStore((state) =>
    parseFloat(state.config[id]?.attack || '0.01')
  );

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Attack Time: {attack.toFixed(3)}s
          </label>
          <Slider
            value={[attack]}
            onValueChange={(value) =>
              updateNode(id, { attack: value[0].toString() })
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

AttackNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const attack = useStrudelStore.getState().config[node.id]?.attack;
  if (!attack) return strudelString;

  const attackCall = `attack("${attack}")`;
  return strudelString ? `${strudelString}.${attackCall}` : attackCall;
};
