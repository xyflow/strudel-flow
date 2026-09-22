import WorkflowNode from '../workflow-node';
import type { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/parameter-knob';
export function PhaserNode({ id, data }: WorkflowNodeProps) {
  const update = useAppStore((state) => state.updateNodeData);
  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex justify-center gap-3 px-4 pt-1 pb-5">
        <ParameterKnob
          label="phaser"
          value={Number(data.phaser ?? 1)}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(value) =>
            update(id, {
              phaserdepth: String(data.phaserdepth ?? 0.5),
              phaser: String(value),
            })
          }
        />
        <ParameterKnob
          label="phaserdepth"
          value={Number(data.phaserdepth ?? 0.5)}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) =>
            update(id, {
              phaser: String(data.phaser ?? 1),
              phaserdepth: String(value),
            })
          }
        />
      </div>
    </WorkflowNode>
  );
}
PhaserNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const phaser = node.data.phaser;
  const phaserdepth = node.data.phaserdepth;

  if (!phaser || !phaserdepth) return strudelString;

  const phaserCall = `phaser(${phaser}).phaserdepth(${phaserdepth})`;
  return strudelString ? `${strudelString}.${phaserCall}` : phaserCall;
};
