import WorkflowNode from './workflow-node';
import { ParameterKnob } from './parameter-knob';
import { useAppStore } from '@/store/app-store';
import type { WorkflowNodeProps } from '../types';
import { type NodeDefinition } from '../define-node';

export function createDefinitionComponent(definition: NodeDefinition) {
  return function DefinitionNode({ id, data, type }: WorkflowNodeProps) {
    const update = useAppStore((state) => state.updateNodeData);
    const isPlaying = useAppStore((state) => state.isPlaying);
    const values = definition.getValues(data);
    const updateValues = (updates: Record<string, unknown>) =>
      update(id, updates);
    return (
      <WorkflowNode id={id} data={data} type={type}>
        {definition.renderControls ? (
          definition.renderControls(data, updateValues, {
            id,
            isPlaying,
            isMuted: data.state === 'paused',
          })
        ) : (
          <div className="space-y-4 px-4 pt-1 pb-5">
            <div
              className={
                Object.keys(definition.parameters).length > 4
                  ? 'grid grid-cols-3 gap-5'
                  : 'flex flex-wrap justify-center gap-4'
              }
            >
              {Object.entries(definition.parameters).map(([key, parameter]) =>
                parameter.control === 'knob' ? (
                  <ParameterKnob
                    key={key}
                    label={parameter.label}
                    value={Number(values[key])}
                    min={parameter.min}
                    max={parameter.max}
                    step={parameter.step}
                    format={
                      parameter.format ??
                      ((value) =>
                        `${Number(value.toFixed(2))}${parameter.unit ?? ''}`)
                    }
                    onChange={(value) =>
                      updateValues(
                        definition.updateValues(data, { [key]: value }),
                      )
                    }
                  />
                ) : parameter.control === 'select' ? (
                  <label
                    key={key}
                    className="flex flex-col gap-2 text-xs text-muted-foreground"
                  >
                    {parameter.label}
                    <select
                      className="nodrag rounded border border-input bg-background p-2 text-foreground"
                      value={String(values[key])}
                      onChange={(event) =>
                        updateValues(
                          definition.updateValues(data, {
                            [key]: event.target.value,
                          }),
                        )
                      }
                    >
                      {parameter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label
                    key={key}
                    className="flex flex-col gap-2 text-xs text-muted-foreground"
                  >
                    {parameter.label}
                    <input
                      className="nodrag rounded border border-input bg-background p-2 text-foreground"
                      value={String(values[key])}
                      onChange={(event) =>
                        updateValues(
                          definition.updateValues(data, {
                            [key]: event.target.value,
                          }),
                        )
                      }
                    />
                  </label>
                ),
              )}
            </div>
          </div>
        )}
      </WorkflowNode>
    );
  };
}
