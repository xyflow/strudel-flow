// How a model player writes each kind of node as Strudel code.
//
// Every node type gets exactly one spec, so the code a model may write stays
// tied to what the visual nodes can do:
// - Instruments and sound pickers have a `*.code.ts` file next to their node,
//   which reads the node's code back into node data within the limits of its
//   controls. Those limits live in the node's own plain module, which the UI
//   reads too.
// - Knob and select effects need no file. Their calls are the parameters'
//   labels, so src/model-player/registry.ts derives their spec.
// - Nodes models may not use say so with `kind: 'excluded'`.
// src/model-player/rules.test.ts fails while any node type has no spec.
import { CodeError, fail, formatCall, type Call, type Expr } from './syntax';

export type NodeData = Record<string, unknown>;

export type SourceSpec = {
  node: string;
  kind: 'source';
  /**
   * Read the instrument at the start of `expr`: its head call and the chain
   * calls that belong to it. Return null when `expr` is not this instrument,
   * and throw a CodeError when it is but goes beyond what the node allows.
   * The data returned is what the node's controls would write.
   */
  read(expr: Expr): { data: NodeData; rest: Call[] } | null;
  /** This node's section of the rules document (Markdown). */
  rules(): string;
};

export type SoundSpec = {
  node: string;
  kind: 'sound';
  sounds: readonly string[];
  rules(): string;
};

export type ExcludedSpec = { node: string; kind: 'excluded'; reason: string };

export type CodeSpec = SourceSpec | SoundSpec | ExcludedSpec;

export const defineCode = <T extends CodeSpec>(spec: T): T => spec;

export { CodeError, fail };

/** The single string argument of `call`. */
export function stringArg(call: Call): string {
  if (call.args.length !== 1 || call.args[0].kind !== 'string')
    fail(`\`${formatCall(call)}\` takes one "quoted string".`);
  return (call.args[0] as { value: string }).value;
}

/**
 * Split mini-notation into its top-level steps: whitespace separates steps,
 * except inside [brackets] and <angle brackets>.
 */
export function miniSteps(mini: string): string[] {
  const steps: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of mini.trim()) {
    if ('[<'.includes(ch)) depth++;
    if (']>'.includes(ch)) depth--;
    if (depth < 0) fail(`\`${mini}\` has an unmatched \`${ch}\`.`);
    if (/\s/.test(ch) && depth === 0) {
      if (current) steps.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (depth !== 0) fail(`\`${mini}\` has an unclosed bracket.`);
  if (current) steps.push(current);
  return steps;
}

export function inRange(value: number, min: number, max: number, what: string) {
  if (!Number.isInteger(value) || value < min || value > max)
    fail(`${what} must be a whole number from ${min} to ${max}.`);
  return value;
}

export function oneOf<T extends string>(
  value: string,
  options: readonly T[],
  what: string,
): T {
  if (!options.includes(value as T))
    fail(`${what} must be one of: ${options.join(', ')}. Got "${value}".`);
  return value as T;
}

/** Markdown list of a sound set, compact enough to read. */
export function soundList(sounds: readonly string[]) {
  return sounds.map((sound) => `\`${sound}\``).join(', ');
}
