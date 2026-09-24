import { DEFAULTS } from './phaser';
import WorkflowNode from '@/components/nodes/workflow-node';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/parameter-knob';
export function PhaserNode({ id, data }: WorkflowNodeProps) {
  const update = useAppStore((state) => state.updateNodeData);
  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex justify-center gap-3 px-4 pt-1 pb-5">
        <ParameterKnob
          label="phaser"
          value={Number(data.phaser ?? DEFAULTS.phaser)}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(value) =>
            update(id, {
              phaserdepth: String(data.phaserdepth ?? DEFAULTS.phaserdepth),
              phaser: String(value),
            })
          }
        />
        <ParameterKnob
          label="phaserdepth"
          value={Number(data.phaserdepth ?? DEFAULTS.phaserdepth)}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) =>
            update(id, {
              phaser: String(data.phaser ?? DEFAULTS.phaser),
              phaserdepth: String(value),
            })
          }
        />
      </div>
    </WorkflowNode>
  );
}
