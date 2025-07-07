import { useMemo } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Slider } from '@/components/ui/slider';

export function ReleaseNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const nodeConfig = useStrudelStore((state) => state.config[id]);
  
  const config = useMemo(() => {
    return {
      release: parseFloat(nodeConfig?.release || '0.1'),
    };
  }, [nodeConfig?.release]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Release Time: {config.release.toFixed(3)}s
          </label>
          <Slider
            value={[config.release]}
            onValueChange={(value) => updateNode(id, { release: value[0].toString() })}
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
