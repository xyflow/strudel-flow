import { PARAMETERS, DEFAULTS } from './time';
import WorkflowNode from '@/components/nodes/shared/workflow-node';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import { useAppStore } from '@/store/app-store';
import { ParameterControls } from '@/components/nodes/shared/parameter-controls';

export function TimeNode(props: WorkflowNodeProps) {
  const update = useAppStore((state) => state.updateNodeData);
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
              aria-pressed={
                (props.data.direction ?? DEFAULTS.direction) === direction
              }
              onClick={() => update(props.id, { direction })}
              className="nodrag flex-1 rounded-md px-3 py-2 text-[10px] text-muted-foreground transition hover:text-foreground aria-pressed:bg-muted aria-pressed:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
        <ParameterControls
          id={props.id}
          data={props.data}
          parameters={PARAMETERS}
        />
      </div>
    </WorkflowNode>
  );
}
