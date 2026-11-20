// The rules document a model player reads before it plays. Generated from
// the node definitions and their code specs, so it changes when they do.
// A copy is checked in at docs/model-player-rules.md (see rules.test.ts).
import { createNodeByType, nodeDefinitions } from '@/components/nodes/registry';
import { codeSpecs, effectSpecs, soundSpecs, sourceSpecs } from './registry';
import type { EffectSpec } from './registry';

export const EXAMPLE_PART = `$: sound("bd").struct("1 ~ ~ ~ 1 ~ ~ ~").gain(0.9)
$: n("[0] [2] [4] [6]").scale("A3:minor").sound("sawtooth").lpf(1200).lpq(4)
// $: n("<[0,2,4] [3,5,7] [4,6,8] [0,2,4]>").scale("A3:minor").sound("pad")`;

function effectSection(spec: EffectSpec) {
  const { definition } = spec;
  const controls = spec.methods.map((method) => {
    if ('option' in method) return `\`.${method.name}()\``;
    const { min, max, step, default: fallback } = method.knob;
    return `\`.${method.name}(x)\`: ${min} to ${max}, step ${step}, default ${fallback}`;
  });
  const base = createNodeByType({ type: spec.node }).data;
  const defaults = definition.generatePattern(base, 'input').replace(/^input/, '');
  return `- **${definition.title}**: ${controls.join('; ')}. ${
    defaults
      ? `It always writes all of its calls, so at its defaults it is \`${defaults}\`; calls you leave out keep their defaults.`
      : 'Calls at their default value are left out.'
  }`;
}

export function rulesDocument(): string {
  const excluded = Object.values(codeSpecs).filter(
    (spec) => spec.kind === 'excluded',
  );
  return `# Playing Strudel Together as a model

You're a player in a Strudel Together jam room. Your partner builds their part with the app's visual nodes, and you hear each other in one mix, in time. You write your part as Strudel code, but only code the visual nodes can produce: each line you write becomes nodes, as if a person had built them. Code outside these rules is rejected, with the reason.

## Your part

\`\`\`js
${EXAMPLE_PART}
\`\`\`

- Your part is a list of \`$:\` lines. Each line is one chain of nodes: one or more instruments, then effects that apply to the whole line, in the order you write them.
- Several instruments share a line with \`stack(a, b)\`. Effects go after the \`stack(...)\`, never inside it.
- Pause a line by commenting it out: \`// $: ...\`. Uncomment it to bring it back. Delete a line to remove it.
- \`set_code\` replaces your whole part. \`edit_code\` changes one piece of it. Lines you don't change keep their nodes as they are.
- What you get back is your part as it now plays. Small things may come out differently (a value snapped to its control's step, a default left out); you're told when they do.
- The tempo (\`setcpm\`) and play/stop belong to the room. You can't change them, so leave \`setcpm\` out.
- Nothing else from Strudel: no variables, no other functions, no other mini-notation.

## Instruments

Every line starts with one or more of these.

${sourceSpecs.map((spec) => spec.rules()).join('\n\n')}

## Sounds

Write sounds after the instruments, like an effect. \`.sound("a b")\` is two sound nodes in a row.

${soundSpecs.map((spec) => spec.rules()).join('\n\n')}

## Effects

${effectSpecs.map(effectSection).join('\n')}

## Not available

${excluded
  .map(
    (spec) =>
      `- **${nodeDefinitions[spec.node].title}**: ${'reason' in spec ? spec.reason : ''}`,
  )
  .join('\n')}
`;
}
