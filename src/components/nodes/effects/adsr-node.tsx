import WorkflowNode from '../workflow-node';
import type { WorkflowNodeProps, AppNode } from '..';
import { ParameterControls } from '../parameter-controls';

const PARAMETERS = [
  { key: 'attack', label: 'attack', initial: 0.1, min: 0, max: 2, step: 0.01 },
  { key: 'decay', label: 'decay', initial: 0.1, min: 0, max: 2, step: 0.01 },
  {
    key: 'sustain',
    label: 'sustain',
    initial: 0.7,
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: 'release',
    label: 'release',
    initial: 0.2,
    min: 0,
    max: 2,
    step: 0.01,
  },
] as const;

export function ADSRNode({ id, data }: WorkflowNodeProps) {
  return (
    <WorkflowNode id={id} data={data}>
      <div className="px-4 pt-1 pb-5">
        <ParameterControls id={id} data={data} parameters={PARAMETERS} />
      </div>
    </WorkflowNode>
  );
}

ADSRNode.strudelOutput = (node: AppNode, pattern: string) => {
  const calls = PARAMETERS.flatMap(({ key, initial }) => {
    const value = parseFloat(node.data[key] || String(initial));
    return value === initial ? [] : [`${key}("${value}")`];
  });
  return [pattern, ...calls].filter(Boolean).join('.');
};
