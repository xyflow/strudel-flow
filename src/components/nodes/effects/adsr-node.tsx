// Strudel output for ADSR envelope
ADSRNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const attack = parseFloat(node.data.attack || '0.1');
  const decay = parseFloat(node.data.decay || '0.1');
  const sustain = parseFloat(node.data.sustain || '0.7');
  const release = parseFloat(node.data.release || '0.2');
  let result = strudelString;
  if (attack !== 0.1) result = result ? `${result}.attack("${attack}")` : `attack("${attack}")`;
  if (decay !== 0.1) result = result ? `${result}.decay("${decay}")` : `decay("${decay}")`;
  if (sustain !== 0.7) result = result ? `${result}.sustain("${sustain}")` : `sustain("${sustain}")`;
  if (release !== 0.2) result = result ? `${result}.release("${release}")` : `release("${release}")`;
  return result || strudelString;
};

import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function ADSRNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const attack = parseFloat(data.attack || '0.1');
  const decay = parseFloat(data.decay || '0.1');
  const sustain = parseFloat(data.sustain || '0.7');
  const release = parseFloat(data.release || '0.2');

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Attack: {attack.toFixed(2)}
          </label>
          <Slider
            value={[attack]}
            onValueChange={value => updateNodeData(id, { attack: value[0].toString() })}
            min={0}
            max={2}
            step={0.01}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Decay: {decay.toFixed(2)}
          </label>
          <Slider
            value={[decay]}
            onValueChange={value => updateNodeData(id, { decay: value[0].toString() })}
            min={0}
            max={2}
            step={0.01}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Sustain: {sustain.toFixed(2)}
          </label>
          <Slider
            value={[sustain]}
            onValueChange={value => updateNodeData(id, { sustain: value[0].toString() })}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Release: {release.toFixed(2)}
          </label>
          <Slider
            value={[release]}
            onValueChange={value => updateNodeData(id, { release: value[0].toString() })}
            min={0}
            max={2}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}
