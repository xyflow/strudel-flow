import { ParameterKnob } from '@/components/nodes/shared/parameter-knob';
import type { WorkflowNodeData } from '../registry';

type Parameter = {
  key: keyof WorkflowNodeData;
  label: string;
  initial: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
};

export function ParameterControls({
  onChange,
  data,
  parameters,
}: {
  onChange: (updates: Record<string, string>) => void;
  data: WorkflowNodeData;
  parameters: readonly Parameter[];
}) {
  return (
    <div className="flex justify-center gap-4">
      {parameters.map(({ key, label, initial, min, max, step, unit = '' }) => (
        <ParameterKnob
          key={key}
          label={label}
          value={Number(data[key] ?? initial)}
          min={min}
          max={max}
          step={step}
          format={(value) => `${Number(value.toFixed(2))}${unit}`}
          onChange={(value) => onChange({ [key]: String(value) })}
        />
      ))}
    </div>
  );
}
