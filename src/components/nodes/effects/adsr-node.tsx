import WorkflowNode from '../workflow-node';
import type { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { ParameterKnob } from '@/components/parameter-knob';
export function ADSRNode({ id, data }: WorkflowNodeProps) {
 const update = useAppStore(state => state.updateNodeData);
 return <WorkflowNode id={id} data={data}><div className="flex justify-center gap-3 px-4 pt-1 pb-5"><ParameterKnob label="attack" value={Number(data.attack ?? 0.1)} min={0} max={2} step={0.01} onChange={value => update(id, {  attack: String(value) })} /><ParameterKnob label="decay" value={Number(data.decay ?? 0.1)} min={0} max={2} step={0.01} onChange={value => update(id, {  decay: String(value) })} /><ParameterKnob label="sustain" value={Number(data.sustain ?? 0.7)} min={0} max={1} step={0.01} onChange={value => update(id, {  sustain: String(value) })} /><ParameterKnob label="release" value={Number(data.release ?? 0.2)} min={0} max={2} step={0.01} onChange={value => update(id, {  release: String(value) })} /></div></WorkflowNode>;
}
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
