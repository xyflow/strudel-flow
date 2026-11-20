// How a model writes the Pad node: a grid of steps, each playing some of
// eight scale degrees, as an arpeggio or a chord.
import {
  defineCode,
  fail,
  miniSteps,
  oneOf,
  stringArg,
} from '@/model-player/spec';
import { KEY_OPTIONS, OCTAVES, SCALE_TYPE_OPTIONS } from '@/data/sounds';
import {
  DEFAULT_MODIFIER_GROUPS,
  modifierValues,
  type CellState,
} from '../../shared/modifier-options';
import { NOTES, STEPS, createDefaultGrid } from './pad';

const KEYS = KEY_OPTIONS.map((option) => option.value);
const SCALES = SCALE_TYPE_OPTIONS.map((option) => option.value);
const MODIFIERS = modifierValues(DEFAULT_MODIFIER_GROUPS);
const STEP = /^(\[[^\]]*\]|[^[\]!/@*]+)((?:[!/@*]\d+)?)$/;

type Step = { notes: number[]; separator: ' ' | ',' | null; modifier: string };

function readStep(step: string): Step {
  const match = STEP.exec(step);
  if (!match)
    fail(
      `Pad steps look like \`[0 2]\` (arp), \`[0,2]\` (chord) or \`[~]\` (rest), optionally followed by one of ${MODIFIERS.join(' ')}. Got \`${step}\`.`,
    );
  const [, body, modifier] = match!;
  const inner = body.replace(/^\[|\]$/g, '').trim();
  if (modifier) oneOf(modifier, MODIFIERS, `The modifier on \`${step}\``);
  if (inner === '~' || inner === '') {
    if (modifier) fail(`Modifiers only go on steps with notes. Got \`${step}\`.`);
    return { notes: [], separator: null, modifier: '' };
  }
  const separator = inner.includes(',') ? ',' : ' ';
  const parts = inner.split(separator === ',' ? ',' : /\s+/).map((p) => p.trim());
  const notes = parts.map((part) => {
    if (!NOTES.includes(part))
      fail(
        `Pad notes are scale degrees from 0 to ${NOTES.length - 1}. Got \`${step}\`.`,
      );
    return Number(part);
  });
  if (separator === ' ' && notes.some((note, i) => i > 0 && note <= notes[i - 1]))
    fail(
      `A Pad arp plays its notes low to high, each once: write \`[${[...new Set(notes)].sort((a, b) => a - b).join(' ')}]\`, not \`${step}\`.`,
    );
  return {
    notes: [...new Set(notes)].sort((a, b) => a - b),
    separator: notes.length > 1 ? separator : null,
    modifier,
  };
}

export default defineCode({
  node: 'pad-node',
  kind: 'source',
  read(expr) {
    if (expr.head.name !== 'n') return null;
    const mini = stringArg(expr.head).trim();
    if (mini.startsWith('<')) return null; // Chords
    const [scale, ...rest] = expr.chain;
    if (scale?.name !== 'scale')
      fail('A Pad ends with `.scale("C3:major")`, right after `n("...")`.');
    const steps = miniSteps(mini).map(readStep);
    if (steps.length < STEPS.min || steps.length > STEPS.max)
      fail(
        `A Pad has ${STEPS.min} to ${STEPS.max} steps. Got ${steps.length}.`,
      );
    if (steps.every((step) => step.notes.length === 0))
      fail('A Pad needs at least one note.');
    const separators = new Set(steps.map((s) => s.separator).filter(Boolean));
    if (separators.size > 1)
      fail(
        'One Pad is either all arps (`[0 2 4]`) or all chords (`[0,2,4]`). Use two Pads on two lines for both.',
      );
    const match = /^([A-G]#?)(\d*):(.+)$/.exec(stringArg(scale!));
    if (!match)
      fail(
        `A Pad uses .scale("<key><octave>:<scale>"), like "C3:major". Got "${stringArg(scale!)}".`,
      );
    const [, key, octave, scaleType] = match!;
    if (
      octave &&
      (Number(octave) < OCTAVES.min || Number(octave) > OCTAVES.max)
    )
      fail(`The octave must be from ${OCTAVES.min} to ${OCTAVES.max}.`);
    const grid = createDefaultGrid();
    const columnModifiers: Record<number, CellState> = {};
    steps.forEach((step, index) => {
      step.notes.forEach((note) => (grid[index][note] = true));
      if (step.modifier)
        columnModifiers[index] = { type: 'modifier', value: step.modifier };
    });
    return {
      data: {
        steps: steps.length,
        mode: separators.has(',') ? 'chord' : 'arp',
        grid,
        columnModifiers,
        selectedKey: oneOf(key, KEYS, 'The key'),
        selectedScaleType: oneOf(scaleType, SCALES, 'The Pad scale'),
        octave: octave ? Number(octave) : undefined,
      },
      rest,
    };
  },
  rules: () => `### Pad: a step grid of scale degrees

\`\`\`js
n("[0] [2] [4] [2 4] [~]").scale("C3:major")
n("[0,2,4] [~] [3,5] [~]").scale("A3:minor:pentatonic")
\`\`\`

- \`n("...")\` with one bracketed step per slot, then \`.scale("<key><octave>:<scale>")\` right after it. ${STEPS.min} to ${STEPS.max} steps per cycle.
- A step plays scale degrees 0 to ${NOTES.length - 1}: \`[0 2 4]\` as an arp (low to high), or \`[0,2,4]\` as a chord. One Pad is all arps or all chords. \`[~]\` is a rest.
- A step with notes can carry one modifier: ${MODIFIERS.map((m) => `\`[0]${m}\``).join(', ')}.
- Keys: ${KEYS.join(' ')}. Octave ${OCTAVES.min} to ${OCTAVES.max} (or none: "C:major"). Scales: ${SCALES.join(', ')}.`,
});
