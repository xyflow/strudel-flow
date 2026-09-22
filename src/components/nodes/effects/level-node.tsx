import WorkflowNode from '../workflow-node';
import type { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/parameter-knob';

const PARAMETERS = [
  {
    key: 'gain',
    label: 'gain',
    initial: 1,
    min: 0,
    max: 2,
    step: 0.01,
    unit: '×',
  },
  { key: 'pan', label: 'pan', initial: 0.5, min: 0, max: 1, step: 0.01 },
  {
    key: 'postgain',
    label: 'postgain',
    initial: 1,
    min: 0,
    max: 2,
    step: 0.01,
    unit: '×',
  },
] as const;

export function LevelNode({ id, data }: WorkflowNodeProps) {
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
              format={(value) =>
                `${Number(value.toFixed(2))}${'unit' in dial ? dial.unit : ''}`
              }
              onChange={(value) => update(id, { [dial.key]: String(value) })}
            />
          ))}
        </div>
      </div>
    </WorkflowNode>
  );
}

LevelNode.strudelOutput = (node: AppNode, pattern: string): string => {
  const calls: string[] = [];
  for (const { key, initial } of PARAMETERS) {
    const value = Number(node.data[key] ?? initial);
    if (Number.isFinite(value) && value !== initial) {
      calls.push(`${key}(${value})`);
    }
  }
  return [pattern, ...calls].filter(Boolean).join('.');
};
