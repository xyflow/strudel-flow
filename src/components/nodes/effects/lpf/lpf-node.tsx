import { DEFAULT_FILTER } from './lpf';
import WorkflowNode from '@/components/nodes/workflow-node';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/parameter-knob';

export function LpfNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const [frequency = 1000, resonance = 1] = (data.lpf || DEFAULT_FILTER)
    .split(' ')
    .map(Number);
  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex justify-center gap-6 px-5 pt-1 pb-5">
        <ParameterKnob
          label="lpf"
          value={frequency}
          min={100}
          max={5000}
          step={50}
          format={(value) =>
            value >= 1000 ? `${(value / 1000).toFixed(2)}k` : `${value} Hz`
          }
          onChange={(value) =>
            updateNodeData(id, { lpf: `${value} ${resonance}` })
          }
        />
        <ParameterKnob
          label="lpq"
          value={resonance}
          min={0.1}
          max={10}
          step={0.1}
          format={(value) => value.toFixed(1)}
          onChange={(value) =>
            updateNodeData(id, { lpf: `${frequency} ${value}` })
          }
        />
      </div>
    </WorkflowNode>
  );
}
