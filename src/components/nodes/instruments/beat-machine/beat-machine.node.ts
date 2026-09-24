import { defineNode } from '../../define-node';
import { BeatMachineNode } from './beat-machine-node';
import { generatePattern, type BeatMachineData } from './beat-machine';

export default defineNode({
  id: 'beat-machine-node',
  title: 'Beats',
  category: 'Instruments',
  icon: 'Drum',
  order: 6,
  parameters: {},
  defaults: {} as BeatMachineData,
  component: BeatMachineNode,
  generate: generatePattern,
});
