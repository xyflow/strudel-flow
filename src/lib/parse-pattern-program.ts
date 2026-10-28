import { parse, type Expression } from 'acorn';
import { expressionValue, signals, type StrudelCall } from './strudel-calls';

export type PatternPart = {
  call?: StrudelCall;
  expression?: string;
  inputs: PatternPart[];
  arguments?: Record<number, PatternPart>;
};

export function parseProgram(code: string) {
  const { body } = parse(code, { ecmaVersion: 'latest' });
  const last = body.pop();
  if (!last || last.type !== 'ExpressionStatement')
    throw new Error('End the code with the pattern you want to convert.');
  return { statements: body, expression: last.expression };
}

export function parsePatternProgram(code: string) {
  const { statements, expression } = parseProgram(code);
  let cps: number | undefined;
  const samples: {
    source?: string;
    sampleMap?: Record<string, string | string[]>;
  }[] = [];
  const remaining: string[] = [];
  for (const statement of statements) {
    const call =
      statement.type === 'ExpressionStatement' &&
      statement.expression.type === 'CallExpression'
        ? statement.expression
        : null;
    if (call?.callee.type === 'Identifier' && call.arguments.length === 1) {
      const arg = call.arguments[0];
      if (
        call.callee.name === 'setcps' &&
        arg.type === 'Literal' &&
        typeof arg.value === 'number' &&
        arg.value > 0
      ) {
        cps = arg.value;
        continue;
      }
      if (call.callee.name === 'samples') {
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          samples.push({ source: arg.value });
          continue;
        }
        if (arg.type === 'ObjectExpression') {
          const sampleMap: Record<string, string | string[]> =
            Object.create(null);
          let valid = true;
          for (const property of arg.properties) {
            if (
              property.type !== 'Property' ||
              property.computed ||
              property.kind !== 'init'
            ) {
              valid = false;
              break;
            }
            const key =
              property.key.type === 'Identifier'
                ? property.key.name
                : property.key.type === 'Literal'
                  ? String(property.key.value)
                  : null;
            const value = expressionValue(property.value as Expression, code);
            if (
              !key ||
              !(
                typeof value === 'string' ||
                (Array.isArray(value) &&
                  value.every((item) => typeof item === 'string'))
              )
            ) {
              valid = false;
              break;
            }
            sampleMap[key] = value as string | string[];
          }
          if (valid) {
            samples.push({ sampleMap });
            continue;
          }
        }
      }
    }
    remaining.push(code.slice(statement.start, statement.end));
  }
  const setup = remaining.join('\n');
  function visit(expression: Expression): PatternPart {
    if (expression.type === 'CallExpression' && !expression.optional) {
      const callee = expression.callee;
      if (expression.arguments.some((arg) => arg.type === 'SpreadElement'))
        return {
          expression: code.slice(expression.start, expression.end),
          inputs: [],
        };
      const args = expression.arguments as Expression[];
      if (
        callee.type === 'Identifier' &&
        callee.name === 'stack' &&
        args.length
      )
        return { call: { name: 'stack', args: [] }, inputs: args.map(visit) };
      const rawStrings = args.flatMap((arg, index) =>
        arg.type === 'Literal' &&
        typeof arg.value === 'string' &&
        code[arg.start] === "'"
          ? [index]
          : [],
      );
      const values = args.map((arg) => expressionValue(arg, code));
      if (callee.type === 'Identifier')
        return {
          call: { name: callee.name, args: values, rawStrings },
          inputs: [],
        };
      if (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        !callee.optional &&
        callee.property.type === 'Identifier' &&
        callee.object.type !== 'Super'
      ) {
        if (callee.property.name === 'stack')
          return {
            call: { name: 'stack', args: [] },
            inputs: [visit(callee.object), ...args.map(visit)],
          };
        let receiver = callee.object;
        let name = callee.property.name;
        while (
          receiver.type === 'MemberExpression' &&
          !receiver.computed &&
          !receiver.optional &&
          receiver.property.type === 'Identifier' &&
          receiver.object.type !== 'Super'
        ) {
          name = `${receiver.property.name}.${name}`;
          receiver = receiver.object;
        }
        const bindings: Record<number, PatternPart> = {};
        args.forEach((arg, index) => {
          if (
            arg.type === 'CallExpression' ||
            (arg.type === 'Identifier' && signals.includes(arg.name))
          )
            bindings[index] = visit(arg);
        });
        return {
          call: { name, args: values, rawStrings },
          inputs: [visit(receiver)],
          arguments: bindings,
        };
      }
    }
    return {
      expression: code.slice(expression.start, expression.end),
      inputs: [],
    };
  }
  return { pattern: visit(expression), setup, samples, cps };
}
