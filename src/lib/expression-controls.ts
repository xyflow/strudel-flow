import { parseExpressionAt, type Expression } from 'acorn';

import { signals } from './strudel-calls';
export type ExpressionControl = {
  start: number;
  end: number;
  label: string;
  name: string;
} & (
  | { kind: 'number'; value: number; quoted: boolean }
  | { kind: 'signal'; value: string }
);

export function expressionControls(
  code: string,
  effect: string,
): ExpressionControl[] {
  const controls: ExpressionControl[] = [];
  function visit(node: Expression, name: string, label: string) {
    if (node.type === 'Literal') {
      const quoted = typeof node.value === 'string';
      if (
        typeof node.value === 'number' ||
        (quoted && /^-?(?:\d+\.?\d*|\.\d+)$/.test(String(node.value)))
      ) {
        const value = Number(node.value);
        if (Number.isFinite(value))
          controls.push({
            start: node.start,
            end: node.end,
            name,
            label,
            kind: 'number',
            value,
            quoted,
          });
      }
    } else if (
      node.type === 'UnaryExpression' &&
      ['-', '+'].includes(node.operator) &&
      node.argument.type === 'Literal' &&
      typeof node.argument.value === 'number'
    ) {
      controls.push({
        start: node.start,
        end: node.end,
        name,
        label,
        kind: 'number',
        value: node.argument.value * (node.operator === '-' ? -1 : 1),
        quoted: false,
      });
    } else if (node.type === 'Identifier' && signals.includes(node.name)) {
      controls.push({
        start: node.start,
        end: node.end,
        name,
        label: 'Signal',
        kind: 'signal',
        value: node.name,
      });
    } else if (node.type === 'CallExpression') {
      const callee = node.callee;
      const method =
        callee.type === 'Identifier'
          ? callee.name
          : callee.type === 'MemberExpression' &&
              !callee.computed &&
              callee.property.type === 'Identifier'
            ? callee.property.name
            : '';
      if (callee.type === 'MemberExpression' && callee.object.type !== 'Super')
        visit(callee.object, name, label);
      if (!method) return;
      node.arguments.forEach((argument, index) => {
        if (argument.type === 'SpreadElement') return;
        const range = method === 'range';
        visit(
          argument,
          range ? effect : method,
          range
            ? index === 0
              ? 'Min'
              : 'Max'
            : `${method}${node.arguments.length > 1 ? ` ${index + 1}` : ''}`,
        );
      });
    } else if (node.type === 'ArrayExpression') {
      node.elements.forEach((element, index) => {
        if (element && element.type !== 'SpreadElement')
          visit(element, name, `${label} ${index + 1}`);
      });
    }
  }
  try {
    visit(
      parseExpressionAt(code, 0, { ecmaVersion: 'latest' }),
      effect,
      effect,
    );
  } catch {
    return [];
  }
  return controls;
}

export function replaceExpressionControl(
  code: string,
  control: ExpressionControl,
  value: string | number,
) {
  const replacement =
    control.kind === 'number' && control.quoted
      ? JSON.stringify(String(value))
      : String(value);
  return code.slice(0, control.start) + replacement + code.slice(control.end);
}

export function numericPatternControls(
  pattern: string,
  effect: string,
): ExpressionControl[] {
  if (!/^[\d\s<>[\],.:!*@/()~+-]+$/.test(pattern)) return [];
  return [...pattern.matchAll(/-?(?:\d+\.?\d*|\.\d+)/g)].map((match, index) => {
    const modifier = pattern[match.index! - 1];
    const timing = ['/', '*', '!', '@'].includes(modifier);
    const name = timing ? 'patternTiming' : effect;
    const label = timing
      ? { '/': 'Slow', '*': 'Fast', '!': 'Repeat', '@': 'Weight' }[modifier]!
      : `Value ${index + 1}`;
    return {
      start: match.index!,
      end: match.index! + match[0].length,
      name,
      label,
      kind: 'number',
      value: Number(match[0]),
      quoted: false,
    };
  });
}
