// How a model writes the Chords node: a progression of chords, one per cycle.
import {
  defineCode,
  fail,
  miniSteps,
  oneOf,
  stringArg,
} from '@/model-player/spec';
import { KEY_OPTIONS, OCTAVES } from '@/data/sounds';
import { MAX_STEPS, MIN_STEPS, NOTE_SLOTS, SCALES } from './chord';

const KEYS = KEY_OPTIONS.map((option) => option.value);

function readChord(step: string): number[] {
  if (step === '~') return [];
  const inner = /^\[(.*)\]$/.exec(step)?.[1] ?? step;
  const notes = inner.split(',').map((part) => part.trim());
  return [
    ...new Set(
      notes.map((note) => {
        const degree = Number(note);
        if (!/^\d+$/.test(note) || degree >= NOTE_SLOTS)
          fail(
            `Chord notes are scale degrees from 0 to ${NOTE_SLOTS - 1}, like [0,2,4]. Got \`${step}\`.`,
          );
        return degree;
      }),
    ),
  ].sort((a, b) => a - b);
}

export default defineCode({
  node: 'chord-node',
  kind: 'source',
  read(expr) {
    if (expr.head.name !== 'n') return null;
    const mini = stringArg(expr.head).trim();
    if (!mini.startsWith('<')) return null; // a Pad
    const [scale, ...rest] = expr.chain;
    if (scale?.name !== 'scale')
      fail('Chords end with `.scale("C4:major")`, right after `n("<...>")`.');
    if (!mini.endsWith('>'))
      fail('A Chords progression is one `<...>` group: `n("<[0,2,4] [3,5,7]>")`.');
    const steps = miniSteps(mini.slice(1, -1));
    if (steps.length < MIN_STEPS || steps.length > MAX_STEPS)
      fail(
        `A Chords progression has ${MIN_STEPS} to ${MAX_STEPS} chords; use \`~\` for a silent cycle. Got ${steps.length}.`,
      );
    const match = /^([A-G]#?)(\d+):(\w+)$/.exec(stringArg(scale!));
    if (!match)
      fail(
        `Chords use .scale("<key><octave>:<major|minor>"), like "C4:major". Got "${stringArg(scale!)}".`,
      );
    const [, key, octave, scaleType] = match!;
    const octaveNumber = Number(octave);
    if (octaveNumber < OCTAVES.min || octaveNumber > OCTAVES.max)
      fail(`The octave must be from ${OCTAVES.min} to ${OCTAVES.max}.`);
    return {
      data: {
        chordNotes: steps.map(readChord),
        selectedKey: oneOf(key, KEYS, 'The key'),
        octave: octaveNumber,
        scaleType: oneOf(scaleType, SCALES, 'The Chords scale'),
      },
      rest,
    };
  },
  rules: () => `### Chords: a chord progression

\`\`\`js
n("<[0,2,4] [5,7,9] [3,5,7] [4,6,8]>").scale("C4:major")
\`\`\`

- \`n("<...>")\` plays one chord per cycle, then \`.scale("<key><octave>:<scale>")\` right after it.
- ${MIN_STEPS} to ${MAX_STEPS} chords. A chord is \`[a,b,c]\`: scale degrees from 0 to ${NOTE_SLOTS - 1} (two octaves). \`~\` is a silent cycle.
- Keys: ${KEYS.join(' ')}. Octave ${OCTAVES.min} to ${OCTAVES.max}. Scale: ${SCALES.join(' or ')}.`,
});
