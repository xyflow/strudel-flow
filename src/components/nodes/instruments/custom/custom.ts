export type CustomData = { customPattern?: string; customDraft?: string };

export const CODE_EXAMPLES = [
  { label: 'Drums', code: 'sound("bd*4, [~ sd]*2, hh*8")\n  .gain(0.7)' },
  {
    label: 'Bass',
    code: 'note("c2 ~ c2 [eb2 g2]")\n  .sound("sawtooth")\n  .lpf(700).decay(0.15).sustain(0)',
  },
  {
    label: 'Melody',
    code: 'n("0 2 4 <6 7>")\n  .scale("C4:minor")\n  .sound("triangle").room(0.3)',
  },
  {
    label: 'Chords',
    code: 'n("<[0,2,4,6] [5,7,9,11]>")\n  .scale("C3:major")\n  .sound("triangle").slow(2).room(0.4)',
  },
  {
    label: 'Layers',
    code: 'stack(\n  sound("bd*4, [~ sd]*2").gain(0.7),\n  n("0 2 4 7").scale("C4:minor")\n    .sound("triangle").gain(0.5)\n)',
  },
];

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
