import { defineNode } from '../../define-node';
import { DrumSoundsNode } from './drum-sounds-node';
import { generatePattern, type DrumSoundsData } from './drum-sounds';

export default defineNode({
  id: 'drum-sounds-node',
  title: 'Drums',
  category: 'Synths',
  icon: 'Music',
  order: 8,
  parameters: {},
  defaults: {} as DrumSoundsData,
  component: DrumSoundsNode,
  generate: generatePattern,
});
