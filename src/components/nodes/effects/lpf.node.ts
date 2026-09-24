import { defineNode } from '../define-node';

export default defineNode({
  id: 'lpf-node',
  title: 'Filter',
  category: 'Audio Effects',
  icon: 'Filter',
  order: 10,
  parameters: {
    cutoff: {
      control: 'knob',
      label: 'lpf',
      default: 1000,
      min: 100,
      max: 5000,
      step: 50,
      format: (value) =>
        value >= 1000 ? `${(value / 1000).toFixed(2)}k` : `${value} Hz`,
    },
    resonance: {
      control: 'knob',
      label: 'lpq',
      default: 1,
      min: 0.1,
      max: 10,
      step: 0.1,
      format: (value) => value.toFixed(1),
    },
  },
  // Existing patches store both controls in one field.
  read: (data) => {
    const [cutoff = 1000, resonance = 1] = String(data.lpf || '1000 1')
      .split(' ')
      .map(Number);
    return { ...data, cutoff, resonance };
  },
  write: (updates, data) => {
    const [cutoff = 1000, resonance = 1] = String(data.lpf || '1000 1')
      .split(' ')
      .map(Number);
    return {
      lpf: `${updates.cutoff ?? cutoff} ${updates.resonance ?? resonance}`,
    };
  },
  generate: ({ cutoff, resonance }, input) =>
    [input, `lpf(${cutoff}).lpq(${resonance})`].filter(Boolean).join('.'),
});
