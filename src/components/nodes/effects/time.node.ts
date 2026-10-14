import { defineNode } from '../define-node';
export default defineNode({
  id: 'time-node',
  title: 'Time',
  category: 'Audio Effects',
  icon: 'Clock',
  order: 1,
  parameters: {
    direction: {
      control: 'select',
      label: 'Direction',
      default: 'forward',
      options: [
        { value: 'forward', label: 'Forward' },
        { value: 'reverse', label: 'rev' },
        { value: 'pingpong', label: 'palindrome' },
      ],
    },
    rate: {
      control: 'knob',
      label: 'fast',
      default: 1,
      min: 0.125,
      max: 8,
      step: 0.125,
      unit: '×',
    },
    lateOffset: {
      control: 'knob',
      label: 'late',
      default: 0,
      min: 0,
      max: 1,
      step: 0.01,
    },
  },
  generate: ({ rate, direction, lateOffset }, input) => {
    const calls = [];
    if (rate !== 1) calls.push(`fast(${rate})`);
    if (direction === 'reverse') calls.push('rev()');
    if (direction === 'pingpong') calls.push('palindrome()');
    if (lateOffset !== 0) calls.push(`late(${lateOffset})`);
    return [input, ...calls].filter(Boolean).join('.');
  },
});
