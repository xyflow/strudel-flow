import { defineNode } from '../../define-node';
import { ChordNode } from './chord-node';
import { generatePattern, type ChordData } from './chord';

export default defineNode({
  id: 'chord-node',
  title: 'Chords',
  category: 'Instruments',
  icon: 'Music2',
  order: 5,
  parameters: {},
  defaults: {} as ChordData,
  component: ChordNode,
  generate: generatePattern,
});
