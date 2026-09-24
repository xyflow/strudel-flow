import { createElement, type ComponentType, type ReactNode } from 'react';
import type { iconMapping } from '@/data/icon-mapping';

export type Parameter =
  | {
      control: 'knob';
      label: string;
      default: number;
      min: number;
      max: number;
      step: number;
      unit?: string;
      format?: (value: number) => string;
    }
  | { control: 'text'; label: string; default: string }
  | {
      control: 'select';
      label: string;
      default: string;
      options: readonly { value: string; label: string }[];
    };
export type Parameters = Record<string, Parameter>;
export type ParameterValues<P extends Parameters> = {
  [K in keyof P]: P[K] extends { control: 'knob' } ? number : string;
};
export type NodeControlsProps<
  P extends Parameters,
  D extends Record<string, unknown> = Record<never, never>,
> = {
  values: D & ParameterValues<P>;
  onChange: (updates: Partial<D & ParameterValues<P>>) => void;
  id: string;
  isPlaying: boolean;
  isMuted: boolean;
};
export type CustomControlsProps<D extends Record<string, unknown>> =
  NodeControlsProps<Record<never, never>, D>;
export type ControlsContext = Pick<
  CustomControlsProps<Record<never, never>>,
  'id' | 'isPlaying' | 'isMuted'
>;
export type NodeDefinition = {
  id: string;
  title: string;
  category: 'Instruments' | 'Synths' | 'Audio Effects';
  icon: keyof typeof iconMapping;
  order?: number;
  parameters: Parameters;
  defaults: Record<string, unknown>;
  getValues: (data: Record<string, unknown>) => Record<string, string | number>;
  updateValues: (
    data: Record<string, unknown>,
    updates: Record<string, unknown>,
  ) => Record<string, unknown>;
  generatePattern: (
    data: Record<string, unknown>,
    input: string,
    scopeId?: string,
  ) => string;
  renderControls?: (
    data: Record<string, unknown>,
    update: (data: Record<string, unknown>) => void,
    context: ControlsContext,
  ) => ReactNode;
};

export function parameterValues<P extends Parameters>(
  parameters: P,
  data: Record<string, unknown>,
): ParameterValues<P> {
  return Object.fromEntries(
    Object.entries(parameters).map(([key, parameter]) => {
      const raw = data[key] ?? parameter.default;
      const value = parameter.control === 'knob' ? Number(raw) : String(raw);
      return [
        key,
        typeof value === 'number' && !Number.isFinite(value)
          ? parameter.default
          : value,
      ];
    }),
  ) as ParameterValues<P>;
}

export function defineNode<
  const P extends Parameters,
  D extends Record<string, unknown> = Record<never, never>,
>(definition: {
  id: string;
  title: string;
  category: NodeDefinition['category'];
  icon: NodeDefinition['icon'];
  order?: number;
  parameters: P;
  defaults?: D;
  read?: (data: Record<string, unknown>) => Record<string, unknown>;
  write?: (
    updates: Partial<D & ParameterValues<P>>,
    data: Record<string, unknown>,
  ) => Record<string, unknown>;
  generate: (
    values: D & ParameterValues<P>,
    input: string,
    context: { parameters: P; scopeId?: string; data: Record<string, unknown> },
  ) => string;
  component?: ComponentType<NodeControlsProps<P, D>>;
}): NodeDefinition {
  const {
    parameters,
    component,
    generate,
    defaults = {} as D,
    read = (data) => data,
    write,
    ...metadata
  } = definition;
  const resolve = (data: Record<string, unknown>) => {
    const values = read(data);
    return {
      ...defaults,
      ...values,
      ...parameterValues(parameters, values),
    } as D & ParameterValues<P>;
  };
  const encode = (updates: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [
        key,
        key in parameters && value !== undefined ? String(value) : value,
      ]),
    );
  const updateValues = (
    data: Record<string, unknown>,
    updates: Record<string, unknown>,
  ) =>
    encode(
      write ? write(updates as Partial<D & ParameterValues<P>>, data) : updates,
    );
  return {
    ...metadata,
    parameters,
    getValues: (data) => parameterValues(parameters, read(data)),
    updateValues,
    defaults: {
      ...defaults,
      ...encode(
        write ? write(resolve({}), {}) : parameterValues(parameters, {}),
      ),
    },
    generatePattern: (data, input, scopeId) =>
      generate(resolve(data), input, {
        parameters,
        scopeId,
        data,
      }),
    renderControls: component
      ? (data, update, context) =>
          createElement(component, {
            ...context,
            values: resolve(data),
            onChange: (updates) => update(updateValues(data, updates)),
          })
      : undefined,
  };
}

// For effects whose parameter names match their Strudel methods.
export function generateParameterEffects(
  values: Record<string, number>,
  input: string,
  { parameters }: { parameters: Parameters },
) {
  const calls = Object.entries(parameters).flatMap(([key, parameter]) =>
    values[key] === parameter.default ? [] : [`${key}(${values[key]})`],
  );
  return [input, ...calls].filter(Boolean).join('.');
}
