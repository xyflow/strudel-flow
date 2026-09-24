export type ScopeData = { scopeScale?: string };
export const DEFAULT_SCOPE_SCALE = 0.25;
export const scopeIdForGroup = (id: string) => `flow-scope-${id}`;

export function generatePattern(
  _data: ScopeData,
  input: string,
  scopeId = 'flow-scope',
) {
  return input ? `${input}.analyze(${JSON.stringify(scopeId)})` : '';
}
