import { transpiler } from '@strudel/web';

export type CustomData = { customPattern?: string; customDraft?: string };

export const DEFAULT_CODE =
  'n("<[0,2,4,6] [5,7,9,11]>")\n  .scale("C3:major")\n  .sound("triangle").slow(2).room(0.4)';
function codeExpression(code: string) {
  return code.trim().replace(/;+\s*$/, '');
}
export function codeSyntaxError(code: string): string | null {
  if (!code.trim()) return null;
  try {
    new Function(`return (\n${codeExpression(code)}\n);`);
    transpiler(`(\n${codeExpression(code)}\n)`, { emitWidgets: false });
    return null;
  } catch (error) {
    return `${error instanceof Error ? error.message : 'Invalid syntax'}. Use one pattern expression, or stack(...) for layers.`;
  }
}

export function generatePattern(data: CustomData, strudelString: string) {
  const expression = codeExpression(data.customPattern ?? DEFAULT_CODE);
  if (!expression) return strudelString;
  const pattern = `(\n${expression}\n)`;
  return strudelString ? `stack(${strudelString}, ${pattern})` : pattern;
}
