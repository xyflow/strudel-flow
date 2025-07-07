import { useMemo } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Slider } from '@/components/ui/slider';

export function AttackNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const nodeConfig = useStrudelStore((state) => state.config[id]);
  
  const config = useMemo(() => {
    return {
      attack: parseFloat(nodeConfig?.attack || '0.01'),
    };
  }, [nodeConfig?.attack]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Attack Time: {config.attack.toFixed(3)}s
          </label>
          <Slider
            value={[config.attack]}
            onValueChange={(value) => updateNode(id, { attack: value[0].toString() })}
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
