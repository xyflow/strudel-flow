import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { Slider } from '@/components/ui/slider';

const ROOM_PARAMS = [
  { key: 'room', label: 'Room', min: 0, max: 1, step: 0.01, default: 0 },
  { key: 'roomsize', label: 'Size', min: 0, max: 10, step: 0.1, default: 1 },
  { key: 'roomfade', label: 'Fade', min: 0, max: 10, step: 0.1, default: 0.5 },
  { key: 'roomlp', label: 'Lowpass', min: 0, max: 20000, step: 100, default: 10000 },
  { key: 'roomdim', label: 'Dimension', min: 0, max: 20000, step: 100, default: 8000 },
] as const;

export function RoomNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-4 p-3 min-w-80">
        {ROOM_PARAMS.map(({ key, label, min, max, step, default: def }) => {
          const value = data[key] ? parseFloat(data[key] as string) : def;
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between">
                <label className="text-sm font-medium">{label}</label>
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
              <Slider
                value={[value]}
                onValueChange={([v]) => updateNodeData(id, { [key]: v.toFixed(2) })}
                min={min}
                max={max}
                step={step}
                className="w-full"
              />
            </div>
          );
        })}
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
