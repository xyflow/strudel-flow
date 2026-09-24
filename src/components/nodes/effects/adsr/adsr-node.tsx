import { PARAMETERS } from './adsr';
import WorkflowNode from '@/components/nodes/shared/workflow-node';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import { ParameterControls } from '@/components/nodes/shared/parameter-controls';

export function ADSRNode({ id, data }: WorkflowNodeProps) {
  return (
    <WorkflowNode id={id} data={data}>
      <div className="px-4 pt-1 pb-5">
        <ParameterControls id={id} data={data} parameters={PARAMETERS} />
      </div>
    </WorkflowNode>
  );
}
