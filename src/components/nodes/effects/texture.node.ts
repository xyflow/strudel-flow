import { defineNode, generateParameterEffects } from '../define-node';

export default defineNode({
  id: 'texture-node',
  title: 'Texture',
  category: 'Audio Effects',
  icon: 'Zap',
  order: 2,
  parameters: {
    distort: {
      control: 'knob',
      label: 'distort',
      default: 0,
      min: 0,
      max: 3,
      step: 0.01,
    },
    crush: {
      control: 'knob',
      label: 'crush',
      default: 16,
      min: 1,
      max: 16,
      step: 1,
    },
    fm: {
      control: 'knob',
      label: 'fm',
      default: 0,
      min: 0,
      max: 10,
      step: 0.1,
    },
  },
  generate: generateParameterEffects,
});
