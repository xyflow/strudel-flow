import type { ComponentType } from 'react';
import type { XYPosition } from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { iconMapping } from '@/data/icon-mapping';
import type {
  AppNode,
  AppNodeType,
  WorkflowNodeData,
  WorkflowNodeProps,
} from './types';
export type {
  AppNode,
  AppNodeType,
  WorkflowNodeData,
  WorkflowNodeProps,
} from './types';
import { ADSRNode } from './effects/adsr/adsr-node';
import { generatePattern as generateADSRNode } from './effects/adsr/adsr';
import { LevelNode } from './effects/level/level-node';
import { generatePattern as generateLevelNode } from './effects/level/level';
import { TextureNode } from './effects/texture/texture-node';
import { generatePattern as generateTextureNode } from './effects/texture/texture';
import { TimeNode } from './effects/time/time-node';
import { generatePattern as generateTimeNode } from './effects/time/time';
import { LpfNode } from './effects/lpf/lpf-node';
import { generatePattern as generateLpfNode } from './effects/lpf/lpf';
import { PhaserNode } from './effects/phaser/phaser-node';
import { generatePattern as generatePhaserNode } from './effects/phaser/phaser';
import { RoomNode } from './effects/room/room-node';
import { generatePattern as generateRoomNode } from './effects/room/room';
import { PadNode } from './instruments/pad/pad-node';
import { generatePattern as generatePadNode } from './instruments/pad/pad';
import { ChordNode } from './instruments/chord/chord-node';
import { generatePattern as generateChordNode } from './instruments/chord/chord';
import { CustomNode } from './instruments/custom/custom-node';
import { generatePattern as generateCustomNode } from './instruments/custom/custom';
import { BeatMachineNode } from './instruments/beat-machine/beat-machine-node';
import { generatePattern as generateBeatMachineNode } from './instruments/beat-machine/beat-machine';
import { SynthSelectNode } from './synths/synth-select/synth-select-node';
import { generatePattern as generateSynthSelectNode } from './synths/synth-select/synth-select';
import { DrumSoundsNode } from './synths/drum-sounds/drum-sounds-node';
import { generatePattern as generateDrumSoundsNode } from './synths/drum-sounds/drum-sounds';

export type NodeConfig = {
  id: AppNodeType;
  title: string;
  category: 'Instruments' | 'Synths' | 'Audio Effects';
  icon: keyof typeof iconMapping;
};

// One registration connects a node's menu entry, UI, and musical behavior.
export const nodeDefinitions = {
  'time-node': {
    title: 'Time',
    category: 'Audio Effects',
    icon: 'Clock',
    component: TimeNode,
    generatePattern: generateTimeNode,
  },
  'texture-node': {
    title: 'Texture',
    category: 'Audio Effects',
    icon: 'Zap',
    component: TextureNode,
    generatePattern: generateTextureNode,
  },
  'level-node': {
    title: 'Level',
    category: 'Audio Effects',
    icon: 'Volume2',
    component: LevelNode,
    generatePattern: generateLevelNode,
  },
  'pad-node': {
    title: 'Pad',
    category: 'Instruments',
    icon: 'Grid3x3',
    component: PadNode,
    generatePattern: generatePadNode,
  },
  'chord-node': {
    title: 'Chords',
    category: 'Instruments',
    icon: 'Music2',
    component: ChordNode,
    generatePattern: generateChordNode,
  },
  'beat-machine-node': {
    title: 'Beats',
    category: 'Instruments',
    icon: 'Drum',
    component: BeatMachineNode,
    generatePattern: generateBeatMachineNode,
  },
  'custom-node': {
    title: 'Code',
    category: 'Instruments',
    icon: 'Code',
    component: CustomNode,
    generatePattern: generateCustomNode,
  },
  'drum-sounds-node': {
    title: 'Drums',
    category: 'Synths',
    icon: 'Music',
    component: DrumSoundsNode,
    generatePattern: generateDrumSoundsNode,
  },
  'synth-select-node': {
    title: 'Voice',
    category: 'Synths',
    icon: 'CheckCheck',
    component: SynthSelectNode,
    generatePattern: generateSynthSelectNode,
  },
  'lpf-node': {
    title: 'Filter',
    category: 'Audio Effects',
    icon: 'Filter',
    component: LpfNode,
    generatePattern: generateLpfNode,
  },
  'phaser-node': {
    title: 'Phaser',
    category: 'Audio Effects',
    icon: 'Waves',
    component: PhaserNode,
    generatePattern: generatePhaserNode,
  },
  'room-node': {
    title: 'Space',
    category: 'Audio Effects',
    icon: 'CheckCheck',
    component: RoomNode,
    generatePattern: generateRoomNode,
  },
  'adsr-node': {
    title: 'Envelope',
    category: 'Audio Effects',
    icon: 'Activity',
    component: ADSRNode,
    generatePattern: generateADSRNode,
  },
} as const;

const nodesConfig = Object.fromEntries(
  Object.entries(nodeDefinitions).map(([id, { title, category, icon }]) => [
    id,
    { id, title, category, icon },
  ]),
) as Record<AppNodeType, NodeConfig>;

export const nodeTypes = Object.fromEntries(
  Object.entries(nodeDefinitions).map(([id, { component }]) => [id, component]),
) as Record<AppNodeType, ComponentType<WorkflowNodeProps>>;

export function createNodeByType({
  type,
  id = nanoid(),
  position = { x: 0, y: 0 },
  data,
}: {
  type: AppNodeType;
  id?: string;
  position?: XYPosition;
  data?: WorkflowNodeData;
}): AppNode {
  const { title, icon } = nodesConfig[type];
  return {
    id,
    type,
    position,
    data: data ?? { title, icon, state: 'running' },
  };
}

export default nodesConfig;
