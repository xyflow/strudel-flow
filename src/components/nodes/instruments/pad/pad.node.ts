import { defineNode } from '../../define-node';
import { PadNode } from './pad-node';
import { generatePattern, type PadData } from './pad';

export default defineNode({
  id: 'pad-node',
  title: 'Pad',
  category: 'Instruments',
  icon: 'Grid3x3',
  order: 4,
  parameters: {},
  defaults: {} as PadData,
  component: PadNode,
  generate: generatePattern,
});
