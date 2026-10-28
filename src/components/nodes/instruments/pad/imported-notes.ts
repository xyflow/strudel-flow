import type { PadData } from './pad';

export function noteSlots(template: string) {
  return [
    ...template.matchAll(/[a-gA-G](?:#|b)?(?:-?\d+)?|~|-?(?:\d+\.?\d*|\.\d+)/g),
  ].filter((match) => {
    const prefix = template.slice(0, match.index);
    const depth = [...prefix].reduce(
      (depth, char) => depth + (char === '(' ? 1 : char === ')' ? -1 : 0),
      0,
    );
    return depth === 0 && !/[*!@/:]\s*$/.test(prefix);
  });
}
export function createImportedPad(template: string): PadData {
  const slots = noteSlots(template);
  const notes = [
    ...new Set(slots.map((slot) => slot[0]).filter((note) => note !== '~')),
  ];
  const rows = [
    ...new Set([...notes, 'c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3', 'c4']),
  ].slice(0, Math.max(8, notes.length));
  return {
    noteTemplate: template,
    noteRows: rows,
    steps: slots.length || 1,
    mode: 'chord',
    selectedKey: 'C',
    selectedScaleType: 'chromatic',
    octave: 3,
    grid: Array.from({ length: Math.max(16, slots.length) }, (_, index) =>
      rows.map((note) => slots[index]?.[0] === note),
    ),
  };
}

export function importedGridPattern(data: PadData) {
  const template = data.noteTemplate ?? '';
  const slots = noteSlots(template);
  const steps = data.steps ?? slots.length;
  const rows = data.noteRows ?? [];
  const values = Array.from({ length: steps }, (_, index) => {
    const notes = (data.grid?.[index] ?? [])
      .flatMap((on, row) =>
        on ? [data.importedScale ? String(row) : rows[row]] : [],
      )
      .filter(Boolean);
    let value = notes.length
      ? notes.length === 1
        ? notes[0]
        : `[${notes.join(data.mode === 'arp' ? ' ' : ',')}]`
      : '~';
    const modifier = data.columnModifiers?.[index];
    if (modifier?.type === 'modifier') value = `[${value}]${modifier.value}`;
    return value;
  });
  if (steps !== slots.length) return values.join(' ');
  let pattern = template;
  for (let index = slots.length - 1; index >= 0; index--) {
    const slot = slots[index];
    pattern =
      pattern.slice(0, slot.index!) +
      values[index] +
      pattern.slice(slot.index! + slot[0].length);
  }
  return pattern;
}
