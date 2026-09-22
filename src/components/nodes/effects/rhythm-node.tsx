import WorkflowNode from '../workflow-node';
import type { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/parameter-knob';

export function RhythmNode(props: WorkflowNodeProps) {
  const update = useAppStore(state => state.updateNodeData);
  const dials = [
    { key: 'repeats', label: 'ply', initial: 1, min: 1, max: 8, step: 1 },
    { key: 'chance', label: 'sometimesBy', initial: 1, min: 0, max: 1, step: 0.05 },
  ] as const;
  return <WorkflowNode id={props.id} data={props.data}><div className="space-y-4 px-4 pt-1 pb-5"><div role="group" aria-label="mask"><div className="mb-2 text-center text-[10px] text-muted-foreground">mask</div><div className="grid grid-cols-4 gap-1">{[['1', 'All'], ['1 0', 'Half'], ['0 1', 'Offbeat'], ['1 1 1 0', 'Skip']].map(([gate, label]) => <button key={gate}
    aria-pressed={(props.data.gate ?? '1') === gate} onClick={() => update(props.id, { gate })}
    className="nodrag rounded-md border border-border px-2 py-3 text-[10px] text-muted-foreground transition hover:border-primary/50 aria-pressed:border-primary/50 aria-pressed:bg-primary/10 aria-pressed:text-primary">{label}</button>)}</div></div><div className="flex justify-center gap-4">{dials.map(dial => <ParameterKnob key={dial.key} label={dial.label}
      value={Number(props.data[dial.key] ?? dial.initial)} min={dial.min} max={dial.max} step={dial.step}
      format={value => `${Number(value.toFixed(2))}${'unit' in dial ? dial.unit : ''}`}
      onChange={value => update(props.id, { [dial.key]: String(value) })} />)}</div></div></WorkflowNode>;
}

RhythmNode.strudelOutput = (node: AppNode, pattern: string): string => {
  const { data } = node;
  const transforms: string[] = [];
  if (data.gate && data.gate !== '1') transforms.push(`mask(${JSON.stringify(data.gate)})`);
  const ply = Number(data.repeats ?? 1);
  if (Number.isFinite(ply) && ply > 1) transforms.push(`ply(${ply})`);
  const sometimesBy = Math.min(1, Math.max(0, Number(data.chance ?? 1)));
  if (!transforms.length || !(sometimesBy > 0)) return pattern;
  const transform = sometimesBy === 1
    ? transforms.join('.')
    : `sometimesBy(${sometimesBy}, x => x.${transforms.join('.')})`;
  return [pattern, transform].filter(Boolean).join('.');
};
