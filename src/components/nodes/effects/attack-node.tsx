import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function AttackNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const attack = parseFloat(data.attack || '0.01');

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
              updateNodeData(id, { attack: value[0].toString() })
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
  const attack = parseFloat(node.data.attack || '0.01');
  if (attack === 0.01) return strudelString;
  const attackCall = `attack("${attack}")`;
  return strudelString ? `${strudelString}.${attackCall}` : attackCall;
};
