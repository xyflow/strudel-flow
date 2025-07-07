/**
 * Pattern builders for Strudel output generation
 */

export const PATTERN_BUILDERS: Record<
  string,
  (value: string | boolean | undefined) => string
> = {
  notes: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `n("${value}")` : '',
  sound: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `sound("${value}")` : '',
  palindrome: (value) => (value === true ? `palindrome()` : ''),
  room: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `room("${value}")` : '',
  roomsize: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `rsize(${value})` : '',
  roomfade: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `rfade(${value})` : '',
  roomlp: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `rlp(${value})` : '',
  roomdim: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `rdim(${value})` : '',
  cpm: (value) =>
    typeof value === 'string' && value.trim() !== ''
      ? `setcpm("${value}")`
      : '',
  lpf: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `lpf("${value}")` : '',
  distort: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `distort(${value})` : '',
  gain: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `gain(${value})` : '',
  pan: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `pan(${value})` : '',
  rev: (value) => (value === true ? `rev()` : ''),
  jux: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `jux(${value})` : '',
  phaser: (value) =>
    typeof value === 'string' && value.trim() !== ''
      ? `phaser("${value}")`
      : '',
  phaserdepth: (value) =>
    typeof value === 'string' && value.trim() !== ''
      ? `phaserdepth("${value}")`
      : '',
  postgain: (value) =>
    typeof value === 'string' && value.trim() !== ''
      ? `postgain(${value})`
      : '',
  size: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `size(${value})` : '',
  compressor: (value) =>
    typeof value === 'string' && value.trim() !== ''
      ? `compressor("${value}")`
      : '',
  crush: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `crush("${value}")` : '',
  sustain: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `sustain(${value})` : '',
  release: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `release(${value})` : '',
  attack: (value) =>
    typeof value === 'string' && value.trim() !== ''
      ? `attack("${value}")`
      : '',
  scale: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `scale("${value}")` : '',
  fast: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `fast(${value})` : '',
  slow: (value) =>
    typeof value === 'string' && value.trim() !== '' ? `slow(${value})` : '',
};
