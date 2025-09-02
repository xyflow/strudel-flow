import { Node, NodeProps, XYPosition } from '@xyflow/react';
import { nanoid } from 'nanoid';

import { iconMapping } from '@/data/icon-mapping';
import { CellState } from './instruments/pad-utils';

import { SynthSelectNode } from './synths/synth-select-node';
import { DrumSoundsNode } from './synths/drum-sounds-node';

// Instruments
import { PadNode } from './instruments/pad-node';
import { ArpeggiatorNode } from './instruments/arpeggiator-node';
import { ChordNode } from './instruments/chord-node';
import { CustomNode } from './instruments/custom-node';
import { PolyrhythmNode } from './instruments/polyrhythm-node';
import { BeatMachineNode } from './instruments/beat-machine-node';

// Effects
import { MaskNode } from './effects/mask-node';
import { PlyNode } from './effects/ply-node';
import { FmNode } from './effects/fm-node';
import { LateNode } from './effects/late-node';
import { PalindromeNode } from './effects/palindrome-node';
import { RoomNode } from './effects/room-node';
import { LpfNode } from './effects/lpf-node';
import { DistortNode } from './effects/distort-node';
import { GainNode } from './effects/gain-node';
import { PanNode } from './effects/pan-node';
import { RevNode } from './effects/rev-node';
import { JuxNode } from './effects/jux-node';
import { PhaserNode } from './effects/phaser-node';
import { PostGainNode } from './effects/postgain-node';
import { CrushNode } from './effects/crush-node';
import { SustainNode } from './effects/sustain-node';
import { ReleaseNode } from './effects/release-node';
import { AttackNode } from './effects/attack-node';
import { FastNode } from './effects/fast-node';
import { SlowNode } from './effects/slow-node';

/* WORKFLOW NODE DATA PROPS ------------------------------------------------------ */

export type WorkflowNodeData = {
  title?: string;
  label?: string;
  icon?: keyof typeof iconMapping;
  sound?: string;
  state?: 'running' | 'paused' | 'stopped';

  // Pad node specific data
  steps?: number;
  mode?: 'arp' | 'chord';
  octave?: number;
  octaveRange?: number;
  selectedKey?: string;
  selectedScaleType?: string;
  grid?: boolean[][];
  buttonModifiers?: Record<string, CellState>;
  columnModifiers?: Record<number, CellState>;
  selectedButtons?: string[];
  noteGroups?: Record<number, number[][]>;

  // Polyrhythm node data
  polyPattern1?: string;
  polyPattern2?: string;
  polyPattern3?: string;
  polySound1?: string;
  polySound2?: string;
  polySound3?: string;
  pattern1Active?: boolean;
  pattern2Active?: boolean;
  pattern3Active?: boolean;

  // Custom node data
  customPattern?: string;

  // Chord node data
  scaleType?: 'major' | 'minor';
  chordComplexity?: 'triad' | 'seventh' | 'ninth' | 'eleventh';
  pressedKeys?: number[];

  // Beat machine node data
  rows?: Array<{ instrument: string; pattern: boolean[] }>;

  // Arpeggiator node data
  selectedPattern?: string;
  selectedChordType?: string;

  gain?: string;
  pan?: string;
  fast?: string;
  slow?: string;
  attack?: string;
  release?: string;
  sustain?: string;
  crush?: string;
  postgain?: string;
  fm?: string;
  distort?: string;
  lpf?: string;
  jux?: string;
  phaser?: string;
  phaserdepth?: string;
  room?: string;
  roomsize?: string;
  roomfade?: string;
  roomlp?: string;
  roomdim?: string;

  maskPattern?: string;
  maskProbability?: string;
  maskPatternId?: string;
  maskProbabilityId?: string;
  plyMultiplier?: string;
  plyProbability?: string;
  plyMultiplierId?: string;
  plyProbabilityId?: string;
  lateOffset?: string;
  latePattern?: string;
  lateOffsetId?: string;
  latePatternId?: string;
};

export type WorkflowNodeProps = NodeProps<Node<WorkflowNodeData>> & {
  type: AppNodeType;
  children?: React.ReactNode;
};

export type NodeConfig = {
  id: AppNodeType;
  title: string;
  category: 'Instruments' | 'Synths' | 'Audio Effects' | 'Time Effects';
  sound?: string;
  notes?: string;
  icon: keyof typeof iconMapping;
};

const nodesConfig: Record<AppNodeType, NodeConfig> = {
  'pad-node': {
    id: 'pad-node',
    title: 'Pad',
    category: 'Instruments',
    icon: 'Spline',
  },
  'arpeggiator-node': {
    id: 'arpeggiator-node',
    title: 'Arpeggiator',
    category: 'Instruments',
    icon: 'Zap',
  },
  'chord-node': {
    id: 'chord-node',
    title: 'Chords',
    category: 'Instruments',
    icon: 'Music2',
  },
  'polyrhythm-node': {
    id: 'polyrhythm-node',
    title: 'Polyrhythm',
    category: 'Instruments',
    icon: 'Layers',
  },
  'beat-machine-node': {
    id: 'beat-machine-node',
    title: 'Beats',
    category: 'Instruments',
    icon: 'Grid3x3',
  },
  'custom-node': {
    id: 'custom-node',
    title: 'Custom Code',
    category: 'Instruments',
    icon: 'Code',
  },
  'drum-sounds-node': {
    id: 'drum-sounds-node',
    title: 'Drums',
    category: 'Synths',
    icon: 'Music',
  },
  'synth-select-node': {
    id: 'synth-select-node',
    title: 'Synths',
    category: 'Synths',
    icon: 'CheckCheck',
  },
  'lpf-node': {
    id: 'lpf-node',
    title: 'LPF',
    category: 'Audio Effects',
    icon: 'Filter',
  },
  'distort-node': {
    id: 'distort-node',
    title: 'Distortion',
    category: 'Audio Effects',
    icon: 'Zap',
  },
  'gain-node': {
    id: 'gain-node',
    title: 'Gain',
    category: 'Audio Effects',
    icon: 'Volume2',
  },
  'pan-node': {
    id: 'pan-node',
    title: 'Pan',
    category: 'Audio Effects',
    icon: 'Move',
  },
  'phaser-node': {
    id: 'phaser-node',
    title: 'Phaser',
    category: 'Audio Effects',
    icon: 'Waves',
  },
  'room-node': {
    id: 'room-node',
    title: 'Room',
    category: 'Audio Effects',
    icon: 'CheckCheck',
  },
  'fast-node': {
    id: 'fast-node',
    title: 'Fast',
    icon: 'FastForward',
    category: 'Time Effects',
  },
  'slow-node': {
    id: 'slow-node',
    title: 'Slow',
    icon: 'Rewind',
    category: 'Time Effects',
  },
  'attack-node': {
    id: 'attack-node',
    title: 'Attack',
    icon: 'Zap',
    category: 'Time Effects',
  },
  'release-node': {
    id: 'release-node',
    title: 'Release',
    icon: 'VolumeX',
    category: 'Time Effects',
  },
  'sustain-node': {
    id: 'sustain-node',
    title: 'Sustain',
    icon: 'Volume2',
    category: 'Time Effects',
  },
  'rev-node': {
    id: 'rev-node',
    title: 'Reverse',
    category: 'Time Effects',
    icon: 'Radio',
  },
  'palindrome-node': {
    id: 'palindrome-node',
    title: 'Palindrome',
    category: 'Time Effects',
    icon: 'CheckCheck',
  },
  'jux-node': {
    id: 'jux-node',
    title: 'Jux',
    category: 'Audio Effects',
    icon: 'Split',
  },
  'crush-node': {
    id: 'crush-node',
    title: 'Crush',
    icon: 'Hash',
    category: 'Audio Effects',
  },
  'postgain-node': {
    id: 'postgain-node',
    title: 'PostGain',
    category: 'Audio Effects',
    icon: 'Volume2',
  },
  'mask-node': {
    id: 'mask-node',
    title: 'Mask',
    category: 'Time Effects',
    icon: 'EyeOff',
  },
  'ply-node': {
    id: 'ply-node',
    title: 'Ply',
    category: 'Time Effects',
    icon: 'Copy',
  },
  'fm-node': {
    id: 'fm-node',
    title: 'FM',
    category: 'Audio Effects',
    icon: 'Radio',
  },
  'late-node': {
    id: 'late-node',
    title: 'Late',
    category: 'Time Effects',
    icon: 'Clock',
  },
};

export const nodeTypes = {
  'synth-select-node': SynthSelectNode,
  'pad-node': PadNode,
  'arpeggiator-node': ArpeggiatorNode,
  'lpf-node': LpfNode,
  'distort-node': DistortNode,
  'gain-node': GainNode,
  'pan-node': PanNode,
  'rev-node': RevNode,
  'jux-node': JuxNode,
  'phaser-node': PhaserNode,
  'drum-sounds-node': DrumSoundsNode,
  'chord-node': ChordNode,
  'custom-node': CustomNode,
  'polyrhythm-node': PolyrhythmNode,
  'beat-machine-node': BeatMachineNode,
  'palindrome-node': PalindromeNode,
  'room-node': RoomNode,
  'postgain-node': PostGainNode,
  'crush-node': CrushNode,
  'sustain-node': SustainNode,
  'release-node': ReleaseNode,
  'attack-node': AttackNode,
  'fast-node': FastNode,
  'slow-node': SlowNode,
  'mask-node': MaskNode,
  'ply-node': PlyNode,
  'fm-node': FmNode,
  'late-node': LateNode,
};

export function createNodeByType({
  type,
  id,
  position,
  data,
}: {
  type: AppNodeType;
  id?: string;
  position?: XYPosition;
  data?: WorkflowNodeData;
}): AppNode {
  const node = nodesConfig[type];

  const newNode = {
    id: id ?? nanoid(),
    data: data ?? {
      title: node.title,
      sound: node.sound,
      notes: node.notes,
      icon: node.icon,
      state: 'running',
    },
    position: {
      x: position?.x || 0,
      y: position?.y || 0,
    },
    type,
  } as AppNode;

  return newNode;
}

export type AppNode =
  | Node<WorkflowNodeData, 'pad-node'>
  | Node<WorkflowNodeData, 'arpeggiator-node'>
  | Node<WorkflowNodeData, 'lpf-node'>
  | Node<WorkflowNodeData, 'distort-node'>
  | Node<WorkflowNodeData, 'gain-node'>
  | Node<WorkflowNodeData, 'pan-node'>
  | Node<WorkflowNodeData, 'rev-node'>
  | Node<WorkflowNodeData, 'jux-node'>
  | Node<WorkflowNodeData, 'phaser-node'>
  | Node<WorkflowNodeData, 'palindrome-node'>
  | Node<WorkflowNodeData, 'room-node'>
  | Node<WorkflowNodeData, 'postgain-node'>
  | Node<WorkflowNodeData, 'crush-node'>
  | Node<WorkflowNodeData, 'sustain-node'>
  | Node<WorkflowNodeData, 'release-node'>
  | Node<WorkflowNodeData, 'attack-node'>
  | Node<WorkflowNodeData, 'fast-node'>
  | Node<WorkflowNodeData, 'slow-node'>
  | Node<WorkflowNodeData, 'drum-sounds-node'>
  | Node<WorkflowNodeData, 'chord-node'>
  | Node<WorkflowNodeData, 'custom-node'>
  | Node<WorkflowNodeData, 'polyrhythm-node'>
  | Node<WorkflowNodeData, 'beat-machine-node'>
  | Node<WorkflowNodeData, 'mask-node'>
  | Node<WorkflowNodeData, 'ply-node'>
  | Node<WorkflowNodeData, 'fm-node'>
  | Node<WorkflowNodeData, 'synth-select-node'>
  | Node<WorkflowNodeData, 'late-node'>;

export type AppNodeType = NonNullable<AppNode['type']>;

export default nodesConfig;
