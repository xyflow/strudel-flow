import WorkflowNode from '../workflow-node';
import type { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/parameter-knob';

export function LevelNode(props: WorkflowNodeProps) {
  const update = useAppStore(state => state.updateNodeData);
  const dials = [
    { key: 'gain', label: 'gain', initial: 1, min: 0, max: 2, step: 0.01, unit: '×' },
    { key: 'pan', label: 'pan', initial: 0.5, min: 0, max: 1, step: 0.01 },
    { key: 'postgain', label: 'postgain', initial: 1, min: 0, max: 2, step: 0.01, unit: '×' },
  ] as const;
  return <WorkflowNode id={props.id} data={props.data}><div className="space-y-4 px-4 pt-1 pb-5"><div className="flex justify-center gap-4">{dials.map(dial => <ParameterKnob key={dial.key} label={dial.label}
      value={Number(props.data[dial.key] ?? dial.initial)} min={dial.min} max={dial.max} step={dial.step}
      format={value => `${Number(value.toFixed(2))}${'unit' in dial ? dial.unit : ''}`}
      onChange={value => update(props.id, { [dial.key]: String(value) })} />)}</div></div></WorkflowNode>;
}

LevelNode.strudelOutput = (node: AppNode, pattern: string): string => {
  const calls = [
    ['gain', node.data.gain, 1],
    ['pan', node.data.pan, 0.5],
    ['postgain', node.data.postgain, 1],
  ] as const;
  return [pattern, ...calls.flatMap(([method, value, neutral]) => {
    const number = Number(value ?? neutral);
    return Number.isFinite(number) && number !== neutral ? [`${method}(${number})`] : [];
  })].filter(Boolean).join('.');
};
