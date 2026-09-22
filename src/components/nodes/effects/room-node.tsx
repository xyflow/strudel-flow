import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/parameter-knob';

const ROOM_PARAMS = [
  { key: 'room', label: 'room', min: 0, max: 1, step: 0.01, default: 0 },
  { key: 'roomsize', label: 'rsize', min: 0, max: 10, step: 0.1, default: 1 },
  { key: 'roomfade', label: 'rfade', min: 0, max: 10, step: 0.1, default: 0.5 },
  {
    key: 'roomlp',
    label: 'rlp',
    min: 0,
    max: 20000,
    step: 100,
    default: 10000,
  },
  {
    key: 'roomdim',
    label: 'rdim',
    min: 0,
    max: 20000,
    step: 100,
    default: 8000,
  },
] as const;

export function RoomNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="grid grid-cols-3 gap-5 p-3">
        {ROOM_PARAMS.map(
          ({ key, label, min, max, step, default: fallback }) => (
            <ParameterKnob
              key={key}
              label={label}
              value={parseFloat(data[key] ?? String(fallback))}
              min={min}
              max={max}
              step={step}
              format={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)
              }
              onChange={(value) => updateNodeData(id, { [key]: String(value) })}
            />
          ),
        )}
      </div>
    </WorkflowNode>
  );
}

RoomNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const { data } = node;

  const calls = [
    data.room && `room("${data.room}")`,
    data.roomsize && `rsize(${data.roomsize})`,
    data.roomfade && `rfade(${data.roomfade})`,
    data.roomlp && `rlp(${data.roomlp})`,
    data.roomdim && `rdim(${data.roomdim})`,
  ].filter(Boolean);

  if (calls.length === 0) return strudelString;

  const roomCalls = calls.join('.');
  return strudelString ? `${strudelString}.${roomCalls}` : roomCalls;
};
