import { createElement } from 'react';
import { defineNode } from '../../define-node';
import { SynthSelectNode } from './synth-select-node';
import { generatePattern, type VoiceData } from './synth-select';

export default defineNode({
  id: 'synth-select-node',
  title: 'Sound',
  category: 'Synths',
  icon: 'CheckCheck',
  order: 9,
  parameters: {},
  defaults: {} as VoiceData,
  component: (props) =>
    createElement(SynthSelectNode, {
      ...props,
      values: props.values.signal
        ? {
            ...props.values,
            sound:
              props.values.signal === 'tri'
                ? 'triangle'
                : props.values.signal === 'saw'
                  ? 'sawtooth'
                  : props.values.signal,
          }
        : props.values,
      onChange: (updates) =>
        props.onChange(
          props.values.signal && updates.sound
            ? {
                signal:
                  updates.sound === 'triangle'
                    ? 'tri'
                    : updates.sound === 'sawtooth'
                      ? 'saw'
                      : updates.sound,
              }
            : updates,
        ),
    }),
  generate: generatePattern,
});
