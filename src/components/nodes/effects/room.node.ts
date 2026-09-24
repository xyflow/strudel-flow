import { defineNode } from '../define-node';
const format = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
export default defineNode({
  id: 'room-node',
  title: 'Space',
  category: 'Audio Effects',
  icon: 'CheckCheck',
  order: 12,
  parameters: {
    room: {
      control: 'knob',
      label: 'room',
      default: 0,
      min: 0,
      max: 1,
      step: 0.01,
      format,
    },
    roomsize: {
      control: 'knob',
      label: 'rsize',
      default: 1,
      min: 0,
      max: 10,
      step: 0.1,
      format,
    },
    roomfade: {
      control: 'knob',
      label: 'rfade',
      default: 0.5,
      min: 0,
      max: 10,
      step: 0.1,
      format,
    },
    roomlp: {
      control: 'knob',
      label: 'rlp',
      default: 10000,
      min: 0,
      max: 20000,
      step: 100,
      format,
    },
    roomdim: {
      control: 'knob',
      label: 'rdim',
      default: 8000,
      min: 0,
      max: 20000,
      step: 100,
      format,
    },
  },
  generate: (_values, input, { data }) => {
    const calls = [
      data.room && `room("${data.room}")`,
      data.roomsize && `rsize(${data.roomsize})`,
      data.roomfade && `rfade(${data.roomfade})`,
      data.roomlp && `rlp(${data.roomlp})`,
      data.roomdim && `rdim(${data.roomdim})`,
    ].filter(Boolean);
    return [input, ...calls].filter(Boolean).join('.');
  },
});
