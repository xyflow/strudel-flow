import { defineNode, generateParameterEffects } from '../define-node';

export default defineNode({
  id: 'level-node',
  title: 'Level',
  category: 'Audio Effects',
  icon: 'Volume2',
  order: 3,
  parameters: {
    gain: {
      control: 'knob',
      label: 'gain',
      default: 1,
      min: 0,
      max: 2,
      step: 0.01,
      unit: '×',
    },
    pan: {
      control: 'knob',
      label: 'pan',
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
    },
    postgain: {
      control: 'knob',
      label: 'postgain',
      default: 1,
      min: 0,
      max: 2,
      step: 0.01,
      unit: '×',
    },
  },
  generate: generateParameterEffects,
});
