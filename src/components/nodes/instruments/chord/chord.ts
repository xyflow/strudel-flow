export type ChordData = {
  scaleType?: 'major' | 'minor';
  octave?: number;
  selectedKey?: string;
  chordComplexity?: 'triad' | 'seventh' | 'ninth' | 'eleventh';
  pressedKeys?: number[];
  chordProgression?: number[];
  chordNotes?: number[][];
  chordInversion?: number;
  chordVoicing?: 'close' | 'open';
};

const chordSizes = { triad: 3, seventh: 4, ninth: 5, eleventh: 6 };
const finite = (value: unknown, fallback: number, min: number, max: number) => {
  const number = Number(value ?? fallback);
  return Number.isFinite(number)
    ? Math.min(max, Math.max(min, number))
    : fallback;
};

function chordDegrees(
  root: number,
  complexity: ChordData['chordComplexity'] = 'triad',
  inversion = 0,
  open = false,
) {
  const notes = Array.from(
    { length: chordSizes[complexity] ?? 3 },
    (_, index) => root + index * 2,
  );
  for (let i = 0; i < Math.min(inversion, notes.length - 1); i++)
    notes.push(notes.shift()! + 7);
  if (open) notes[1] += 7;
  return notes.sort((a, b) => a - b);
}

export function chordProgression(data: ChordData) {
  // Old patches retain their selected chords; new instruments start with a progression.
  return (
    data.chordNotes?.map((notes) => (notes[0] ?? 0) % 7) ??
    data.chordProgression ??
    (data.pressedKeys
      ? [...data.pressedKeys].sort((a, b) => a - b)
      : [0, 5, 3, 4])
  );
}

export function chordNotes(data: ChordData) {
  return (
    data.chordNotes ??
    chordProgression(data).map((root) =>
      chordDegrees(
        root,
        data.chordComplexity,
        Math.round(finite(data.chordInversion, 0, 0, 2)),
        data.chordVoicing === 'open',
      ),
    )
  );
}

function chordPattern(data: ChordData) {
  const notes = chordNotes(data);
  if (!notes.length) return '';
  const chords = notes.map((chord) =>
    chord.length ? `[${chord.join(',')}]` : '~',
  );
  const scale = `${data.selectedKey ?? DEFAULTS.selectedKey}${data.octave ?? DEFAULTS.octave}:${data.scaleType ?? DEFAULTS.scaleType}`;
  return `n(${JSON.stringify(`<${chords.join(' ')}>`)}).scale(${JSON.stringify(scale)})`;
}

const PITCHES = [
  'C',
  'C♯',
  'D',
  'E♭',
  'E',
  'F',
  'F♯',
  'G',
  'A♭',
  'A',
  'B♭',
  'B',
];
const KEY_PITCH: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

const DEGREES = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
};
export const PRESETS = [
  { label: 'Home', steps: [0, 5, 3, 4] },
  { label: 'Turnaround', steps: [1, 4, 0, 0] },
  { label: 'Descending', steps: [0, 6, 5, 4] },
];

export const DEFAULTS = {
  selectedKey: 'C',
  octave: 4,
  scaleType: 'major',
} as const;

export function generatePattern(data: ChordData, strudelString: string) {
  const pattern = chordPattern(data);
  if (!pattern) return strudelString;
  return strudelString ? `stack(${strudelString}, ${pattern})` : pattern;
}

export function chordLabels(data: ChordData) {
  const scaleType = data.scaleType ?? DEFAULTS.scaleType;
  const degrees = DEGREES[scaleType] ?? DEGREES.major;
  const scale =
    scaleType === 'minor' ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const pitch = (degree: number) =>
    (KEY_PITCH[data.selectedKey ?? DEFAULTS.selectedKey] ?? 0) +
    scale[degree % 7] +
    Math.floor(degree / 7) * 12;
  const noteName = (degree: number) => PITCHES[pitch(degree) % 12];
  const chordName = (degree: number) =>
    `${noteName(degree)}${degrees[degree]?.includes('°') ? '°' : degrees[degree] === degrees[degree]?.toLowerCase() ? 'm' : ''}`;
  const noteLabel = (note: number) =>
    `${noteName(note)}${(data.octave ?? DEFAULTS.octave) + Math.floor(pitch(note) / 12)}`;
  return { scaleType, degrees, noteName, noteLabel, chordName };
}
