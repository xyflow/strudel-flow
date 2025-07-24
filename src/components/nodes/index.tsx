import { Node, NodeProps, XYPosition } from '@xyflow/react';
import { nanoid } from 'nanoid';

import { iconMapping } from '@/data/icon-mapping';

import { SampleSelect } from './sounds/sample-select';
import { DrumSoundsNode } from './sounds/drum-sounds';

// Synths
import { PadNode } from './synths/pad-node';
import { ArpeggiatorNode } from './synths/arpeggiator-node';
import { ChordNode } from './synths/chord-node';
import { CustomNode } from './synths/custom-node';
import { ProbabilityNode } from './effects/probability-node';
import { PolyrhythmNode } from './synths/polyrhythm-node';
import { BeatMachineNode } from './synths/beat-machine-node';

// Effects
import { MaskNode } from './effects/mask-node';
import { PlyNode } from './effects/ply-node';
import { FMNode } from './effects/fm-node';
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
import { CompressorNode } from './effects/compressor-node';
import { CrushNode } from './effects/crush-node';
import { SustainNode } from './effects/sustain-node';
import { ReleaseNode } from './effects/release-node';
import { AttackNode } from './effects/attack-node';
import { FastNode } from './effects/fast-node';
import { SlowNode } from './effects/slow-node';
import { SizeNode } from './effects/size-node';

/* WORKFLOW NODE DATA PROPS ------------------------------------------------------ */

export type WorkflowNodeData = {
  title?: string;
  label?: string;
  icon?: keyof typeof iconMapping;
  sound?: string;
  notes?: string;
  status?: 'loading' | 'success' | 'error' | 'initial';
};

export type WorkflowNodeProps = NodeProps<Node<WorkflowNodeData>> & {
  type: AppNodeType;
  children?: React.ReactNode;
};

export type NodeConfig = {
  id: AppNodeType;
  title: string;
  category: 'Synths' | 'Sounds' | 'Audio Effects' | 'Time Effects';
  status?: 'loading' | 'success' | 'error' | 'initial';
  sound?: string;
  notes?: string;
  icon: keyof typeof iconMapping;
};

const nodesConfig: Record<AppNodeType, NodeConfig> = {
  'pad-node': {
    id: 'pad-node',
    title: 'Pad',
    category: 'Synths',
    icon: 'Spline',
  },
  'arpeggiator-node': {
    id: 'arpeggiator-node',
    title: 'Arpeggiator',
    category: 'Synths',
    icon: 'Zap',
  },
  'chord-node': {
    id: 'chord-node',
    title: 'Chords',
    category: 'Synths',
    icon: 'Music2',
  },
  'polyrhythm-node': {
    id: 'polyrhythm-node',
    title: 'Polyrhythm',
    category: 'Synths',
    icon: 'Layers',
  },
  'beat-machine-node': {
    id: 'beat-machine-node',
    title: 'Beats',
    category: 'Synths',
    icon: 'Grid3x3',
  },
  'custom-node': {
    id: 'custom-node',
    title: 'Custom Code',
    category: 'Synths',
    icon: 'Code',
  },
  'drum-sounds': {
    id: 'drum-sounds',
    title: 'Drums',
    category: 'Sounds',
    icon: 'Music',
  },
  'sample-select': {
    id: 'sample-select',
    title: 'Sounds',
    category: 'Sounds',
    icon: 'CheckCheck',
  },
  'probability-node': {
    id: 'probability-node',
    title: 'Probability',
    category: 'Time Effects',
    icon: 'Dice1',
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
  'compressor-node': {
    id: 'compressor-node',
    title: 'Compressor',
    icon: 'Zap',
    category: 'Audio Effects',
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
    title: 'Rev',
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
    category: 'Time Effects',
    icon: 'Split',
  },
  'crush-node': {
    id: 'crush-node',
    title: 'Crush',
    icon: 'Hash',
    category: 'Time Effects',
  },
  'size-node': {
    id: 'size-node',
    title: 'Size',
    category: 'Time Effects',
    icon: 'Maximize',
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
  'sample-select': SampleSelect,
  'pad-node': PadNode,
  'arpeggiator-node': ArpeggiatorNode,
  'lpf-node': LpfNode,
  'distort-node': DistortNode,
  'gain-node': GainNode,
  'pan-node': PanNode,
  'rev-node': RevNode,
  'jux-node': JuxNode,
  'phaser-node': PhaserNode,
  'drum-sounds': DrumSoundsNode,
  'chord-node': ChordNode,
  'custom-node': CustomNode,
  'probability-node': ProbabilityNode,
  'polyrhythm-node': PolyrhythmNode,
  'beat-machine-node': BeatMachineNode,
  'palindrome-node': PalindromeNode,
  'room-node': RoomNode,
  'postgain-node': PostGainNode,
  'compressor-node': CompressorNode,
  'crush-node': CrushNode,
  'sustain-node': SustainNode,
  'release-node': ReleaseNode,
  'attack-node': AttackNode,
  'fast-node': FastNode,
  'slow-node': SlowNode,
  'size-node': SizeNode,
  'mask-node': MaskNode,
  'ply-node': PlyNode,
  'fm-node': FMNode,
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
      status: node.status,
      sound: node.sound,
      notes: node.notes,
      icon: node.icon,
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
  | Node<WorkflowNodeData, 'sample-select'>
  | Node<WorkflowNodeData, 'palindrome-node'>
  | Node<WorkflowNodeData, 'room-node'>
  | Node<WorkflowNodeData, 'postgain-node'>
  | Node<WorkflowNodeData, 'compressor-node'>
  | Node<WorkflowNodeData, 'crush-node'>
  | Node<WorkflowNodeData, 'sustain-node'>
  | Node<WorkflowNodeData, 'release-node'>
  | Node<WorkflowNodeData, 'attack-node'>
  | Node<WorkflowNodeData, 'fast-node'>
  | Node<WorkflowNodeData, 'slow-node'>
  | Node<WorkflowNodeData, 'size-node'>
  | Node<WorkflowNodeData, 'drum-sounds'>
  | Node<WorkflowNodeData, 'chord-node'>
  | Node<WorkflowNodeData, 'custom-node'>
  | Node<WorkflowNodeData, 'probability-node'>
  | Node<WorkflowNodeData, 'polyrhythm-node'>
  | Node<WorkflowNodeData, 'beat-machine-node'>
  | Node<WorkflowNodeData, 'mask-node'>
  | Node<WorkflowNodeData, 'ply-node'>
  | Node<WorkflowNodeData, 'fm-node'>
  | Node<WorkflowNodeData, 'late-node'>;

export type AppNodeType = NonNullable<AppNode['type']>;

export default nodesConfig;
