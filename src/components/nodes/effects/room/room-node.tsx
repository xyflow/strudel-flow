import { ROOM_PARAMS } from './room';
import WorkflowNode from '@/components/nodes/shared/workflow-node';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/nodes/shared/parameter-knob';

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
