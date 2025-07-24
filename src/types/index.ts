export interface StrudelConfig {
  // Core properties
  notes?: string;
  sound?: string;
  scale?: string;
  cpm?: string;
  customPattern?: string;

  // Effect nodes
  palindrome?: boolean;
  room?: string;
  roomsize?: string;
  roomfade?: string;
  roomlp?: string;
  roomdim?: string;
  lpf?: string;
  distort?: string;
  gain?: string;
  pan?: string;
  rev?: boolean;
  jux?: string;
  phaser?: string;
  phaserdepth?: string;
  postgain?: string;
  size?: string;
  compressor?: string;
  crush?: string;
  sustain?: string;
  release?: string;
  attack?: string;
  fast?: string;
  slow?: string;

  // Probability and masking
  probFunction?: string;
  probability?: number;
  maskPattern?: string;
  maskProbability?: string;

  // Ply node
  plyMultiplier?: string;
  plyProbability?: string;

  // FM node
  fmFrequency?: string;
  fmDepth?: string;
  fmModulator?: string;

  // Late node
  lateOffset?: string;
  latePattern?: string;

  // Polyrhythm node
  polyPattern1?: string;
  polyPattern2?: string;
  polyPattern3?: string;
  polySound1?: string;
  polySound2?: string;
  polySound3?: string;
  activePolyPatterns?: string;

  // Arpeggiator node
  arpPattern?: string;
  arpOctaves?: number;
  arpKey?: string;
  arpChordType?: string;

  // Beat machine node
  beatKickPattern?: string;
  beatSnarePattern?: string;
  beatHihatPattern?: string;
}
