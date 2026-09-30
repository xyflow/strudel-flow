import { defineNode } from '../../define-node';
import { SynthSelectNode } from './synth-select-node';
import { generatePattern, type VoiceData } from './synth-select';

export default defineNode({
  id: 'synth-select-node',
  title: 'Voice',
  category: 'Synths',
  icon: 'CheckCheck',
  order: 9,
  parameters: {},
  defaults: {} as VoiceData,
  component: SynthSelectNode,
  generate: generatePattern,
});
