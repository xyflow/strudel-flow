import { defineNode } from '../../define-node';
import { CustomNode } from './custom-node';
import { generatePattern, type CustomData } from './custom';

export default defineNode({
  id: 'custom-node',
  title: 'Code',
  category: 'Instruments',
  icon: 'Code',
  order: 7,
  parameters: {},
  defaults: {} as CustomData,
  component: CustomNode,
  generate: generatePattern,
});
