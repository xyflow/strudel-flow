import WorkflowNode from '../workflow-node';
import type { WorkflowNodeProps, AppNode } from '..';
import { ParameterControls } from '../parameter-controls';

const PARAMETERS = [
  {
    key: 'distort',
    label: 'distort',
    initial: 0,
    min: 0,
    max: 3,
    step: 0.01,
  },
  { key: 'crush', label: 'crush', initial: 16, min: 1, max: 16, step: 1 },
  { key: 'fm', label: 'fm', initial: 0, min: 0, max: 10, step: 0.1 },
] as const;

export function TextureNode({ id, data }: WorkflowNodeProps) {
  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-4 px-4 pt-1 pb-5">
        <ParameterControls id={id} data={data} parameters={PARAMETERS} />
      </div>
    </WorkflowNode>
  );
}

TextureNode.strudelOutput = (node: AppNode, pattern: string): string => {
  const calls: string[] = [];
  for (const { key, initial } of PARAMETERS) {
    const value = Number(node.data[key] ?? initial);
    if (Number.isFinite(value) && value !== initial) {
      calls.push(`${key}(${value})`);
    }
  }
  return [pattern, ...calls].filter(Boolean).join('.');
};
