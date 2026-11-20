// Every node type's code spec: the `*.code.ts` files next to the nodes, plus
// specs derived for knob and select effects (see spec.ts).
import { nodeDefinitions } from '@/components/nodes/registry';
import type { NodeDefinition, Parameter } from '@/components/nodes/define-node';
import type { CodeSpec, SourceSpec, SoundSpec } from './spec';

type Knob = Extract<Parameter, { control: 'knob' }>;

export type EffectMethod =
  | { name: string; param: string; knob: Knob }
  /** A select option, written as a call with no arguments, like `rev()`. */
  | { name: string; param: string; option: string };

export type EffectSpec = {
  node: string;
  kind: 'effect';
  definition: NodeDefinition;
  methods: EffectMethod[];
};

export type AnySpec = CodeSpec | EffectSpec;

const files = import.meta.glob<CodeSpec>('../components/nodes/**/*.code.ts', {
  eager: true,
  import: 'default',
});

/**
 * Knob and select effects are written as their parameters' labels: a knob
 * labelled `lpf` is `.lpf(value)`, a select option labelled `rev` is `.rev()`.
 * Nodes with other controls need a `*.code.ts` file.
 */
function deriveEffect(definition: NodeDefinition): EffectSpec | null {
  if (definition.category === 'Instruments') return null;
  const entries = Object.entries(definition.parameters);
  if (entries.length === 0) return null;
  const methods: EffectMethod[] = [];
  for (const [param, parameter] of entries) {
    if (parameter.control === 'knob') {
      methods.push({ name: parameter.label, param, knob: parameter });
    } else if (parameter.control === 'select') {
      for (const option of parameter.options) {
        if (option.value !== parameter.default)
          methods.push({ name: option.label, param, option: option.value });
      }
    } else {
      return null;
    }
  }
  return { node: definition.id, kind: 'effect', definition, methods };
}

export const codeSpecs: Record<string, AnySpec> = Object.create(null);
for (const spec of Object.values(files)) {
  if (!nodeDefinitions[spec.node])
    throw new Error(`A *.code.ts file names an unknown node: ${spec.node}`);
  if (codeSpecs[spec.node])
    throw new Error(`Two *.code.ts files for one node: ${spec.node}`);
  codeSpecs[spec.node] = spec;
}
for (const definition of Object.values(nodeDefinitions)) {
  if (codeSpecs[definition.id]) continue;
  const derived = deriveEffect(definition);
  if (derived) codeSpecs[definition.id] = derived;
}

/** Node types with no code spec. Must stay empty (rules.test.ts). */
export const nodesWithoutSpec = Object.keys(nodeDefinitions).filter(
  (id) => !codeSpecs[id],
);

const inNodeOrder = Object.keys(nodeDefinitions)
  .map((id) => codeSpecs[id])
  .filter(Boolean);
export const sourceSpecs = inNodeOrder.filter(
  (spec): spec is SourceSpec => spec.kind === 'source',
);
export const soundSpecs = inNodeOrder.filter(
  (spec): spec is SoundSpec => spec.kind === 'sound',
);
export const effectSpecs = inNodeOrder.filter(
  (spec): spec is EffectSpec => spec.kind === 'effect',
);
