import { createElement } from 'react';
import type { NodeDefinition } from './define-node';
import { CallControls } from './shared/call-controls';
import {
  callsFromValues,
  serializeCalls,
  sourceCalls,
  type SimpleNode,
  type StrudelCall,
} from '@/lib/strudel-calls';

export function simpleNode(
  id: string,
  values: SimpleNode,
  category?: NodeDefinition['category'],
): NodeDefinition {
  const defaults = callsFromValues(values);
  if (!defaults.length) throw new Error(`Node ${id} needs at least one value.`);
  serializeCalls(defaults);
  const title = defaults[0].name;
  const getCalls = (data: Record<string, unknown>) =>
    (data.calls ?? defaults) as StrudelCall[];
  return {
    id,
    title,
    category:
      category ?? (sourceCalls.has(title) ? 'Instruments' : 'Audio Effects'),
    icon: sourceCalls.has(title) ? 'Music' : 'Waves',
    parameters: {},
    defaults: { calls: defaults },
    getValues: () => ({}),
    updateValues: (_data, updates) => updates,
    generatePattern: (data, input) => serializeCalls(getCalls(data), input),
    renderControls: (data, update) =>
      createElement(CallControls, {
        calls: getCalls(data),
        boundArguments: data.argumentSlots as number[] | undefined,
        onChange: (calls) => update({ calls }),
      }),
  };
}
