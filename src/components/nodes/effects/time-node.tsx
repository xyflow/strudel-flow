import WorkflowNode from '../workflow-node';
import type { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { ParameterControls } from '../parameter-controls';

export function TimeNode(props: WorkflowNodeProps) {
  const update = useAppStore((state) => state.updateNodeData);
  const dials = [
    {
      key: 'rate',
      label: 'fast',
      initial: 1,
      min: 0.125,
      max: 8,
      step: 0.125,
      unit: '×',
    },
    {
      key: 'lateOffset',
      label: 'late',
      initial: 0,
      min: 0,
      max: 1,
      step: 0.01,
    },
  ] as const;
  return (
    <WorkflowNode id={props.id} data={props.data}>
      <div className="space-y-4 px-4 pt-1 pb-5">
        <div className="flex gap-1 rounded-md bg-background/60 p-1">
          {(
            [
              ['forward', 'Forward'],
              ['reverse', 'rev'],
              ['pingpong', 'palindrome'],
            ] as const
          ).map(([direction, label]) => (
            <button
              key={direction}
              aria-pressed={(props.data.direction ?? 'forward') === direction}
              onClick={() => update(props.id, { direction })}
              className="nodrag flex-1 rounded-md px-3 py-2 text-[10px] text-muted-foreground transition hover:text-foreground aria-pressed:bg-muted aria-pressed:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
        <ParameterControls id={props.id} data={props.data} parameters={dials} />
      </div>
    </WorkflowNode>
  );
}

TimeNode.strudelOutput = (node: AppNode, pattern: string): string => {
  const calls: string[] = [];
  const fast = Number(node.data.rate ?? 1);
  if (Number.isFinite(fast) && fast !== 1) calls.push(`fast(${fast})`);
  if (node.data.direction === 'reverse') calls.push('rev()');
  if (node.data.direction === 'pingpong') calls.push('palindrome()');
  const late = Number(node.data.lateOffset ?? 0);
  if (Number.isFinite(late) && late !== 0) calls.push(`late(${late})`);
  return [pattern, ...calls].filter(Boolean).join('.');
};
