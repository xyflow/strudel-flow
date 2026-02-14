// Utility to categorize drum and synth options for robust UI grouping

export const DRUM_CATEGORIES = [
  {
    label: 'Kicks',
    options: [
      'bd',
      'kicklinn',
      'clubkick',
      'hardkick',
      'popkick',
      'reverbkick',
    ],
  },
  {
    label: 'Snares',
    options: [
      'sd',
      'dr_few',
      'drum',
      'drumtraks',
      'electro1',
      'hardcore',
      'house',
      'ifdrums',
      'jungle',
      'gretsch',
    ],
  },
  {
    label: 'Hi-Hats',
    options: ['hh', 'linnhats', 'dr', 'dr2', 'dr55'],
  },
  {
    label: 'Claps',
    options: ['cp', 'realclaps'],
  },
  {
    label: 'Percussion',
    options: ['clak', 'click', 'stomp', 'tabla', 'tabla2', 'tablex'],
  },
];

// Example synth categories (expand as needed)
export const SYNTH_CATEGORIES = [
  {
    label: 'Bass',
    options: [
      'bass',
      'bass0',
      'bass1',
      'bass2',
      'bass3',
      'bassdm',
      'bassfoo',
      'jungbass',
      'jvbass',
      'moog',
    ],
  },
  {
    label: 'Leads',
    options: [
      'arp',
      'arpy',
      'lead',
      'hoover',
      'juno',
      'saw',
      'stab',
      'simplesine',
      'sine',
      'pluck',
    ],
  },
  {
    label: 'Pads',
    options: ['pad', 'padlong', 'space', 'newnotes', 'notes'],
  },
  {
    label: 'FX & Other',
    options: [], // Will be filled dynamically in the component
  },
];
