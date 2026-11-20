// How a model writes the Beats node: one `sound("...").struct("...")` per
// track, stacked when there are several.
import {
  defineCode,
  fail,
  miniSteps,
  oneOf,
  soundList,
  stringArg,
  type NodeData,
} from '@/model-player/spec';
import type { Call, Expr } from '@/model-player/syntax';
import { DRUM_SOUNDS } from '../../sounds/drum-sounds/drum-sounds';
import { modifierValues } from '../../shared/modifier-options';
import type { CellState } from '../../shared/modifier-options';
import { STEP_MODIFIERS, STEPS, type BeatMachineRow } from './beat-machine';

const MODIFIERS = modifierValues(STEP_MODIFIERS);

/** A track, `sound("bd").struct("1 ~ 1 ~")`, and the calls after it. */
function readRow(expr: Expr): { row: BeatMachineRow; rest: Call[] } | null {
  const [struct, ...rest] = expr.chain;
  if (!['sound', 's'].includes(expr.head.name) || struct?.name !== 'struct')
    return null;
  const instrument = oneOf(
    stringArg(expr.head),
    DRUM_SOUNDS,
    'A Beats track sound',
  );
  const steps = miniSteps(stringArg(struct));
  if (steps.length < STEPS.min || steps.length > STEPS.max)
    fail(
      `A Beats track has ${STEPS.min} to ${STEPS.max} steps; "${stringArg(struct)}" has ${steps.length}.`,
    );
  const modifiers: Record<number, CellState> = {};
  const pattern = steps.map((step, index) => {
    const match = /^([1x~-])(.*)$/.exec(step);
    if (!match)
      fail(
        `Beats steps are \`1\` (hit) or \`~\` (rest), optionally followed by one of ${MODIFIERS.join(' ')}. Got \`${step}\`.`,
      );
    const [, base, modifier] = match!;
    if (modifier) {
      oneOf(modifier, MODIFIERS, `The modifier on step \`${step}\``);
      modifiers[index] = { type: 'modifier', value: modifier };
    }
    return base === '1' || base === 'x';
  });
  return { row: { instrument, pattern, modifiers }, rest };
}

function beatsData(rows: BeatMachineRow[]): NodeData {
  return {
    steps: rows[0].pattern.length,
    rows,
    modifiersEnabled: rows.some((row) => Object.keys(row.modifiers ?? {}).length),
  };
}

export default defineCode({
  node: 'beat-machine-node',
  kind: 'source',
  read(expr) {
    const track = readRow(expr);
    if (track) return { data: beatsData([track.row]), rest: track.rest };
    // Several tracks: stack(track, track, ...) with nothing else inside.
    if (expr.head.name !== 'stack') return null;
    const rows = expr.head.args.map((arg) =>
      arg.kind === 'expr' ? readRow(arg.expr) : null,
    );
    if (rows.length === 0 || rows.some((r) => r === null || r.rest.length))
      return null;
    const tracks = rows.map((r) => r!.row);
    if (tracks.some((r) => r.pattern.length !== tracks[0].pattern.length))
      fail('All tracks of one Beats node have the same number of steps.');
    return { data: beatsData(tracks), rest: expr.chain };
  },
  rules: () => `### Beats: a drum sequencer

\`\`\`js
sound("bd").struct("1 ~ ~ ~ 1 ~ ~ ~")
stack(sound("bd").struct("1 ~ 1 ~"), sound("hh").struct("~ 1 ~ 1"))
\`\`\`

- One track is \`sound("<drum>").struct("<steps>")\`. Several tracks go in one \`stack(...)\`, and all tracks in a stack have the same number of steps.
- Steps: \`1\` is a hit, \`~\` a rest. ${STEPS.min} to ${STEPS.max} steps per cycle.
- A step can carry one modifier: ${MODIFIERS.map((m) => `\`1${m}\``).join(', ')}.
- A track with no hits is dropped.
- Track sounds: ${soundList(DRUM_SOUNDS)}.`,
});
