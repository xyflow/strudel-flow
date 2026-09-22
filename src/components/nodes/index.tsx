import { LevelNode } from './effects/level-node';
import { TextureNode } from './effects/texture-node';
import { TimeNode } from './effects/time-node';
import { RhythmNode } from './effects/rhythm-node';
import { Node, NodeProps, XYPosition } from '@xyflow/react';
import { nanoid } from 'nanoid';

import { iconMapping } from '@/data/icon-mapping';
import { CellState } from './instruments/modifiers';

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
import { RoomNode } from './effects/room-node';
import { LpfNode } from './effects/lpf-node';
import { JuxNode } from './effects/jux-node';
import { PhaserNode } from './effects/phaser-node';
import { ADSRNode } from './effects/adsr-node';

/* WORKFLOW NODE DATA PROPS ------------------------------------------------------ */

export type WorkflowNodeData = {
  rate?: string;
  direction?: 'forward' | 'reverse' | 'pingpong';
  gate?: string;
  repeats?: string;
  chance?: string;
  attack?: string;
  decay?: string;
  sustain?: string;
  release?: string;
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
  rows?: Array<{ instrument: string; pattern: boolean[]; modifiers?: Record<number, CellState> }>;
    modifiersEnabled?: boolean;

  // Arpeggiator node data
  selectedPattern?: string;
  selectedChordType?: string;

  gain?: string;
  pan?: string;
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

  lateOffset?: string;
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
  'rhythm-node': { id: 'rhythm-node', title: 'Rhythm', category: 'Time Effects', icon: 'Grid3x3' },
  'time-node': { id: 'time-node', title: 'Time', category: 'Time Effects', icon: 'Clock' },
  'texture-node': { id: 'texture-node', title: 'Texture', category: 'Audio Effects', icon: 'Zap' },
  'level-node': { id: 'level-node', title: 'Level', category: 'Audio Effects', icon: 'Volume2' },
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
    title: 'Code',
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
    title: 'Voice',
    category: 'Synths',
    icon: 'CheckCheck',
  },
  'lpf-node': {
    id: 'lpf-node',
    title: 'Filter',
    category: 'Audio Effects',
    icon: 'Filter',
  },
  'phaser-node': {
    id: 'phaser-node',
    title: 'Phaser',
    category: 'Audio Effects',
    icon: 'Waves',
  },
  'room-node': {
    id: 'room-node',
    title: 'Space',
    category: 'Audio Effects',
    icon: 'CheckCheck',
  },
  'jux-node': {
    id: 'jux-node',
    title: 'Stereo',
    category: 'Audio Effects',
    icon: 'Split',
  },
  'adsr-node': {
    id: 'adsr-node',
    title: 'Envelope',
    category: 'Audio Effects',
    icon: 'Activity',
  },
};

export const nodeTypes = {
  'rhythm-node': RhythmNode,
  'time-node': TimeNode,
  'texture-node': TextureNode,
  'level-node': LevelNode,
  'synth-select-node': SynthSelectNode,
  'pad-node': PadNode,
  'arpeggiator-node': ArpeggiatorNode,
  'lpf-node': LpfNode,
  'jux-node': JuxNode,
  'phaser-node': PhaserNode,
  'drum-sounds-node': DrumSoundsNode,
  'chord-node': ChordNode,
  'custom-node': CustomNode,
  'polyrhythm-node': PolyrhythmNode,
  'beat-machine-node': BeatMachineNode,
  'room-node': RoomNode,
  'adsr-node': ADSRNode,
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
  | Node<WorkflowNodeData, 'rhythm-node'>
  | Node<WorkflowNodeData, 'time-node'>
  | Node<WorkflowNodeData, 'texture-node'>
  | Node<WorkflowNodeData, 'level-node'>
  | Node<WorkflowNodeData, 'pad-node'>
  | Node<WorkflowNodeData, 'arpeggiator-node'>
  | Node<WorkflowNodeData, 'lpf-node'>
  | Node<WorkflowNodeData, 'jux-node'>
  | Node<WorkflowNodeData, 'phaser-node'>
  | Node<WorkflowNodeData, 'room-node'>
  | Node<WorkflowNodeData, 'drum-sounds-node'>
  | Node<WorkflowNodeData, 'chord-node'>
  | Node<WorkflowNodeData, 'custom-node'>
  | Node<WorkflowNodeData, 'polyrhythm-node'>
  | Node<WorkflowNodeData, 'beat-machine-node'>
  | Node<WorkflowNodeData, 'synth-select-node'>
  | Node<WorkflowNodeData, 'adsr-node'>;

export type AppNodeType = NonNullable<AppNode['type']>;

export default nodesConfig;
