export type CustomData = { customPattern?: string; customDraft?: string };

export const DEFAULT_CODE = 'sound("bd sd hh sd")';
function codeExpression(code: string) {
  return code.trim().replace(/;+\s*$/, '');
}
export function codeSyntaxError(code: string): string | null {
  if (!code.trim()) return null;
  try {
    // Parse without invoking the function or running the user's expression.
    new Function(`return (\n${codeExpression(code)}\n);`);
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
