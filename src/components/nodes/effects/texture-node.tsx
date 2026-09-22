import WorkflowNode from '../workflow-node';
import type { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/parameter-knob';

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
  const update = useAppStore((state) => state.updateNodeData);
  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-4 px-4 pt-1 pb-5">
        <div className="flex justify-center gap-4">
          {PARAMETERS.map((dial) => (
            <ParameterKnob
              key={dial.key}
              label={dial.label}
              value={Number(data[dial.key] ?? dial.initial)}
              min={dial.min}
              max={dial.max}
              step={dial.step}
              format={(value) => String(Number(value.toFixed(2)))}
              onChange={(value) => update(id, { [dial.key]: String(value) })}
            />
          ))}
        </div>
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
