import { parseProgram } from '@/lib/parse-pattern-program';
import { transpiler } from '@strudel/web';

export type CustomData = { customPattern?: string; customDraft?: string };

export const DEFAULT_CODE =
  'n("<[0,2,4,6] [5,7,9,11]>")\n  .scale("C3:major")\n  .sound("triangle").slow(2).room(0.4)';
function codeExpression(code: string) {
  const program = parseProgram(code);
  const expression = code.slice(program.expression.start, program.expression.end);
  const setup = program.statements
    .map((statement) => code.slice(statement.start, statement.end))
    .join('\n');
  return setup
    ? `(await (async () => {\n${setup}\nreturn (${expression});\n})())`
    : expression;
}
export function codeSyntaxError(code: string): string | null {
  if (!code.trim()) return null;
  try {
    transpiler(`(\n${codeExpression(code)}\n)`, { emitWidgets: false });
    return null;
  } catch (error) {
    return `${error instanceof Error ? error.message : 'Invalid syntax'}. End with a pattern expression, or stack(...) for layers.`;
  }
}

export function generatePattern(data: CustomData, strudelString: string) {
  const code = data.customPattern ?? DEFAULT_CODE;
  if (!code.trim()) return strudelString;
  const expression = codeExpression(code);
  const pattern = `(\n${expression}\n)`;
  return strudelString ? `stack(${strudelString}, ${pattern})` : pattern;
}
