import { defineNode } from '../define-node';

export default defineNode({
  id: 'adsr-node',
  title: 'Envelope',
  category: 'Audio Effects',
  icon: 'Activity',
  order: 13,
  parameters: {
    attack: {
      control: 'knob',
      label: 'attack',
      default: 0.1,
      min: 0,
      max: 2,
      step: 0.01,
    },
    decay: {
      control: 'knob',
      label: 'decay',
      default: 0.1,
      min: 0,
      max: 2,
      step: 0.01,
    },
    sustain: {
      control: 'knob',
      label: 'sustain',
      default: 0.7,
      min: 0,
      max: 1,
      step: 0.01,
    },
    release: {
      control: 'knob',
      label: 'release',
      default: 0.2,
      min: 0,
      max: 2,
      step: 0.01,
    },
  },
  generate: (_values, input, { parameters, data }) => {
    const calls = Object.entries(parameters).flatMap(([key, parameter]) => {
      const value = parseFloat(String(data[key] || parameter.default));
      return value === parameter.default ? [] : [`${key}("${value}")`];
    });
    return [input, ...calls].filter(Boolean).join('.');
  },
});
