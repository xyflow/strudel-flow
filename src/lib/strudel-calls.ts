import type { Expression } from 'acorn';

export type ExpressionValue = { expression: string };
export type CallValue =
  | string
  | number
  | boolean
  | null
  | CallValue[]
  | ExpressionValue;
export const isExpressionValue = (value: CallValue): value is ExpressionValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function serializeValue(value: CallValue): string {
  if (isExpressionValue(value)) return `(${value.expression})`;
  if (Array.isArray(value)) return `[${value.map(serializeValue).join(', ')}]`;
  return JSON.stringify(value);
}

export function expressionValue(
  expression: Expression,
  code: string,
): CallValue {
  try {
    return literal(expression);
  } catch {
    return { expression: code.slice(expression.start, expression.end) };
  }
}
export type StrudelCall = {
  name: string;
  args: CallValue[];
  enabled?: boolean;
  rawStrings?: number[];
};
export type SimpleNode = Record<string, CallValue>;
export const signals = [
  'sine',
  'cosine',
  'tri',
  'saw',
  'square',
  'rand',
  'perlin',
];

export const sourceCalls = new Set(['s', 'sound', 'n', 'note']);

function literal(expression: Expression): CallValue {
  if (expression.type === 'Literal') {
    const value = expression.value;
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isFinite(value))
    )
      return value;
  }
  if (
    expression.type === 'UnaryExpression' &&
    (expression.operator === '-' || expression.operator === '+') &&
    expression.argument.type === 'Literal' &&
    typeof expression.argument.value === 'number'
  ) {
    const value =
      expression.operator === '-'
        ? -expression.argument.value
        : expression.argument.value;
    if (Number.isFinite(value)) return value;
  }
  if (expression.type === 'ArrayExpression') {
    return expression.elements.map((item) => {
      if (!item || item.type === 'SpreadElement')
        throw new Error('Array holes and spreads stay in Code.');
      return literal(item);
    });
  }
  throw new Error(
    'Conversion supports literal numbers, strings, booleans and arrays. Expressions and functions stay in Code.',
  );
}

export function serializeLiteral(value: unknown): string {
  if (typeof value === 'string')
    return "'" + JSON.stringify(value).slice(1, -1).replace(/'/g, "\\'") + "'";
  if (Array.isArray(value))
    return `[${value.map(serializeLiteral).join(', ')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .map(
        ([key, entry]) => `${serializeLiteral(key)}:${serializeLiteral(entry)}`,
      )
      .join(', ')}}`;
  return JSON.stringify(value);
}

export function serializeCalls(calls: StrudelCall[], input = '') {
  return [
    input,
    ...calls
      .filter((call) => call.enabled !== false)
      .map(({ name, args, rawStrings }) => {
        if (!/^[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*$/.test(name))
          throw new Error('Invalid Strudel function name.');
        const argumentsCode = args.map((value, index) =>
          rawStrings?.includes(index)
            ? serializeLiteral(value)
            : serializeValue(value),
        );
        return `${name}(${argumentsCode.join(', ')})`;
      }),
  ]
    .filter(Boolean)
    .join('.');
}

export function callsFromValues(values: SimpleNode): StrudelCall[] {
  return Object.entries(values).map(([name, value]) => ({
    name,
    args: [value],
  }));
}
