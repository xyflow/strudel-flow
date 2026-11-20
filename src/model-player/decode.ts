// Read one `$:` line of a model's code into the chain of nodes that plays it:
// instruments first, then the effects applied to all of them.
import { createNodeByType } from '@/components/nodes/registry';
import {
  effectSpecs,
  soundSpecs,
  sourceSpecs,
  type EffectMethod,
  type EffectSpec,
} from './registry';
import { stringArg, type NodeData } from './spec';
import { fail, formatCall, parseExpr, type Call, type Expr } from './syntax';

export type NodePlan = { type: string; data: NodeData };
export type LinePlan = { sources: NodePlan[]; effects: NodePlan[] };

export function decodeLine(code: string): { plan: LinePlan; notes: string[] } {
  const notes: string[] = [];
  const { sources, rest } = readSources(parseExpr(code));
  return { plan: { sources, effects: readEffects(rest, notes) }, notes };
}

// ---- instruments ----------------------------------------------------------

const INSTRUMENTS =
  'Beats `sound("bd").struct("1 ~ 1 ~")`, Chords `n("<[0,2,4] [3,5,7] [4,6,8] [0,2,4]>").scale("C4:major")` or Pad `n("[0] [2] [4]").scale("C3:major")`';

function readSource(expr: Expr) {
  for (const spec of sourceSpecs) {
    const result = spec.read(expr);
    if (result)
      return { plan: { type: spec.node, data: result.data }, rest: result.rest };
  }
  return null;
}

function readSources(expr: Expr): { sources: NodePlan[]; rest: Call[] } {
  const single = readSource(expr);
  if (single) return { sources: [single.plan], rest: single.rest };
  if (expr.head.name !== 'stack')
    fail(
      `\`${formatCall(expr.head)}\` isn't an instrument. A line starts with one: ${INSTRUMENTS}, or several in \`stack(...)\`.`,
    );
  if (expr.head.args.length === 0) fail('`stack()` needs instruments in it.');
  const sources = expr.head.args.map((arg) => {
    const item = arg.kind === 'expr' ? readSource(arg.expr) : null;
    if (!item)
      fail(
        `Everything in \`stack(...)\` is an instrument: ${INSTRUMENTS}. Got \`${arg.kind === 'expr' ? formatCall(arg.expr.head) : JSON.stringify(arg.value)}\`.`,
      );
    if (item!.rest.length)
      fail(
        `\`.${item!.rest[0].name}(...)\` is inside \`stack(...)\`. Effects apply to a whole line: put them after the \`stack(...)\`, or give that instrument its own \`$:\` line.`,
      );
    return item!.plan;
  });
  return { sources, rest: expr.chain };
}

// ---- effects --------------------------------------------------------------

const methods = new Map<string, { spec: EffectSpec; method: EffectMethod }>();
for (const spec of effectSpecs) {
  for (const method of spec.methods) methods.set(method.name, { spec, method });
}

function unknownEffect(call: Call): never {
  return fail(
    `\`.${call.name}(...)\` isn't something a node can do. Effects: ${[
      'sound',
      ...methods.keys(),
    ]
      .map((name) => `.${name}`)
      .join(' ')}. See the rules for each one's range.`,
  );
}

function readEffects(calls: Call[], notes: string[]): NodePlan[] {
  const plans: NodePlan[] = [];
  let i = 0;
  while (i < calls.length) {
    const call = calls[i];
    if (call.name === 'sound' || call.name === 's') {
      plans.push(...readSounds(call));
      i++;
      continue;
    }
    const first = methods.get(call.name) ?? unknownEffect(call);
    // Consecutive calls of one effect node, each control set once.
    const group = [call];
    const used = new Set([first.method.param]);
    let j = i + 1;
    for (; j < calls.length; j++) {
      const next = methods.get(calls[j].name);
      if (!next || next.spec !== first.spec || used.has(next.method.param))
        break;
      used.add(next.method.param);
      group.push(calls[j]);
    }
    plans.push(...buildEffects(first.spec, group, notes));
    i = j;
  }
  return plans;
}

function readSounds(call: Call): NodePlan[] {
  const names = stringArg(call).trim().split(/\s+/).filter(Boolean);
  if (names.length === 0) fail('`.sound("")` needs a sound name.');
  return names.map((name) => {
    const spec = soundSpecs.find((s) => s.sounds.includes(name));
    if (!spec)
      fail(
        /^[\w-]+$/.test(name)
          ? `"${name}" isn't a sound the Drums or Voice nodes offer. See the rules for the lists.`
          : `\`.sound("${stringArg(call)}")\`: each sound is a plain name, like "bd" or "piano". Patterns of sounds aren't a node.`,
      );
    return { type: spec!.node, data: { sound: name } };
  });
}

const decimals = (value: number) =>
  (String(value).split('.')[1] ?? '').length;

/** The value a call sets, checked against the control's limits. */
function controlValue(
  method: EffectMethod,
  call: Call,
  notes: string[],
): number | string {
  if ('option' in method) {
    if (call.args.length) fail(`\`.${call.name}()\` takes no arguments.`);
    return method.option;
  }
  const { min, max, step } = method.knob;
  const arg = call.args[0];
  const value =
    call.args.length === 1 && arg.kind === 'number'
      ? arg.value
      : call.args.length === 1 && arg.kind === 'string'
        ? Number(arg.value)
        : NaN;
  if (!Number.isFinite(value))
    fail(`\`.${call.name}(...)\` takes one number, like \`.${call.name}(${method.knob.default})\`.`);
  if (value < min || value > max)
    fail(`\`.${call.name}(${value})\` is out of range: ${call.name} goes from ${min} to ${max}.`);
  const snapped = Number(
    (min + Math.round((value - min) / step) * step).toFixed(
      Math.max(decimals(step), decimals(min)),
    ),
  );
  if (snapped !== value)
    notes.push(
      `.${call.name}(${value}) became .${call.name}(${snapped}): that control moves in steps of ${step}.`,
    );
  return snapped;
}

function effectData(spec: EffectSpec, values: Record<string, number | string>) {
  const base = createNodeByType({ type: spec.node }).data;
  const all = Object.fromEntries(
    Object.entries(spec.definition.parameters).map(([param, parameter]) => [
      param,
      values[param] ?? parameter.default,
    ]),
  );
  return { ...base, ...spec.definition.updateValues(base, all) };
}

const sameValue = (a: Call, b: Call) =>
  a.args.length === b.args.length &&
  a.args.every((arg, k) => {
    const other = b.args[k];
    const number = (x: typeof arg) =>
      x.kind === 'number' ? x.value : x.kind === 'string' ? Number(x.value) : NaN;
    return number(arg) === number(other);
  });

/**
 * The node(s) for a run of calls. The node's own code generator is the judge:
 * every call written must appear in what the node generates, in order. A
 * call set to its default may be missing, since nodes leave those out.
 */
function buildEffects(
  spec: EffectSpec,
  group: Call[],
  notes: string[],
): NodePlan[] {
  const attempt = (calls: Call[]): NodePlan | null | 'empty' => {
    const values: Record<string, number | string> = {};
    const written: Call[] = [];
    for (const call of calls) {
      const { method } = methods.get(call.name)!;
      const value = controlValue(method, call, notes);
      values[method.param] = value;
      written.push(
        'option' in method
          ? { name: call.name, args: [] }
          : { name: call.name, args: [{ kind: 'number', value: value as number }] },
      );
    }
    const data = effectData(spec, values);
    const generated = parseExpr(
      spec.definition.generatePattern(data, 'input()'),
    ).chain;
    let at = 0;
    for (const call of written) {
      const found = generated.findIndex(
        (g, k) => k >= at && g.name === call.name && sameValue(g, call),
      );
      if (found >= 0) {
        at = found + 1;
        continue;
      }
      const { method } = methods.get(call.name)!;
      const isDefault =
        'knob' in method &&
        call.args[0]?.kind === 'number' &&
        call.args[0].value === method.knob.default;
      if (isDefault && !generated.some((g) => g.name === call.name)) continue;
      return null;
    }
    return generated.length ? { type: spec.node, data } : 'empty';
  };

  const together = attempt(group);
  const plans: (NodePlan | null | 'empty')[] =
    together !== null ? [together] : group.map((call) => attempt([call]));
  plans.forEach((plan, k) => {
    if (plan === null)
      fail(
        `\`.${group[k].name}(...)\` can't be written that way by the ${spec.definition.title} node.`,
      );
  });
  if (plans.includes('empty'))
    notes.push(
      `${group.map((call) => `.${formatCall(call)}`).join('')} is a default setting, which makes no difference, so it was left out.`,
    );
  return plans.filter((plan): plan is NodePlan => typeof plan === 'object');
}
