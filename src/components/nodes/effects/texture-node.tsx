import WorkflowNode from '../workflow-node';
import type { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/parameter-knob';

export function TextureNode(props: WorkflowNodeProps) {
  const update = useAppStore(state => state.updateNodeData);
  const dials = [
    { key: 'distort', label: 'distort', initial: 0, min: 0, max: 3, step: 0.01 },
    { key: 'crush', label: 'crush', initial: 16, min: 1, max: 16, step: 1 },
    { key: 'fm', label: 'fm', initial: 0, min: 0, max: 10, step: 0.1 },
  ] as const;
  return <WorkflowNode id={props.id} data={props.data}><div className="space-y-4 px-4 pt-1 pb-5"><div className="flex justify-center gap-4">{dials.map(dial => <ParameterKnob key={dial.key} label={dial.label}
      value={Number(props.data[dial.key] ?? dial.initial)} min={dial.min} max={dial.max} step={dial.step}
      format={value => `${Number(value.toFixed(2))}${'unit' in dial ? dial.unit : ''}`}
      onChange={value => update(props.id, { [dial.key]: String(value) })} />)}</div></div></WorkflowNode>;
}

TextureNode.strudelOutput = (node: AppNode, pattern: string): string => {
  const calls = [
    ['distort', node.data.distort, 0],
    ['crush', node.data.crush, 16],
    ['fm', node.data.fm, 0],
  ] as const;
  return [pattern, ...calls.flatMap(([method, value, neutral]) => {
    const number = Number(value ?? neutral);
    return Number.isFinite(number) && number !== neutral ? [`${method}(${number})`] : [];
  })].filter(Boolean).join('.');
};
