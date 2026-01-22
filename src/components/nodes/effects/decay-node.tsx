import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function DecayNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const decay = parseFloat(data.decay || '0.1');

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Decay: {decay.toFixed(2)}
          </label>
          <Slider
            value={[decay]}
            onValueChange={value => updateNodeData(id, { decay: value[0].toString() })}
            min={0}
            max={2}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

// Strudel output for Decay node
import type { AppNode } from '..';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
DecayNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const decay = parseFloat(node.data.decay || '0.1');
  let result = strudelString;
  if (decay !== 0.1) result = result ? `${result}.decay("${decay}")` : `decay("${decay}")`;
  return result || strudelString;
};
