export type KnobRange = { min: number; max: number; step: number };

const ranges: Record<string, KnobRange> = {
  noteOctave: { min: 0, max: 8, step: 1 },
  patternTiming: { min: 1, max: 16, step: 1 },
  sampleIndex: { min: 0, max: 16, step: 1 },
  segment: { min: 1, max: 32, step: 1 },
  chunk: { min: 1, max: 16, step: 1 },
  ply: { min: 1, max: 16, step: 1 },
  gain: { min: 0, max: 2, step: 0.01 },
  postgain: { min: 0, max: 2, step: 0.01 },
  pan: { min: 0, max: 1, step: 0.01 },
  room: { min: 0, max: 1, step: 0.01 },
  sustain: { min: 0, max: 1, step: 0.01 },
  attack: { min: 0, max: 2, step: 0.01 },
  decay: { min: 0, max: 2, step: 0.01 },
  release: { min: 0, max: 2, step: 0.01 },
  lpf: { min: 0, max: 20000, step: 10 },
  hpf: { min: 0, max: 20000, step: 10 },
  lpq: { min: 0, max: 10, step: 0.1 },
  rlp: { min: 0, max: 20000, step: 100 },
  rdim: { min: 0, max: 20000, step: 100 },
  rsize: { min: 0, max: 10, step: 0.1 },
  rfade: { min: 0, max: 10, step: 0.1 },
  phaser: { min: 0.1, max: 10, step: 0.1 },
  phaserdepth: { min: 0, max: 1, step: 0.01 },
  distort: { min: 0, max: 3, step: 0.01 },
  crush: { min: 1, max: 16, step: 1 },
  fm: { min: 0, max: 10, step: 0.1 },
  fast: { min: 0.125, max: 8, step: 0.125 },
  slow: { min: 0.125, max: 8, step: 0.125 },
  note: { min: 0, max: 127, step: 1 },
  n: { min: 0, max: 127, step: 1 },
};

export function callKnobRange(name: string, initial: number): KnobRange {
  const magnitude = Math.max(
    1,
    10 ** Math.ceil(Math.log10(Math.abs(initial) || 1)),
  );
  const fallback = {
    min: initial < 0 ? -magnitude * 2 : 0,
    max: magnitude * 2,
    step: magnitude / 100,
  };
  const range = ranges[name] ?? fallback;
  return {
    ...range,
    min: Math.min(range.min, initial),
    max: Math.max(range.max, initial),
  };
}
