import { PARAMETERS } from './texture';
import WorkflowNode from '@/components/nodes/workflow-node';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import { ParameterControls } from '@/components/nodes/parameter-controls';

export function TextureNode({ id, data }: WorkflowNodeProps) {
  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-4 px-4 pt-1 pb-5">
        <ParameterControls id={id} data={data} parameters={PARAMETERS} />
      </div>
    </WorkflowNode>
  );
}
