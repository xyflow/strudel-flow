import type { Node, NodeProps } from '@xyflow/react';
import type { ReactNode } from 'react';
import type { iconMapping } from '@/data/icon-mapping';
import type { nodeDefinitions } from '.';
import type { ADSRData } from './effects/adsr/adsr';
import type { LevelData } from './effects/level/level';
import type { TextureData } from './effects/texture/texture';
import type { TimeData } from './effects/time/time';
import type { FilterData } from './effects/lpf/lpf';
import type { PhaserData } from './effects/phaser/phaser';
import type { RoomData } from './effects/room/room';
import type { PadData } from './instruments/pad/pad';
import type { ChordData } from './instruments/chord/chord';
import type { CustomData } from './instruments/custom/custom';
import type { BeatMachineData } from './instruments/beat-machine/beat-machine';
import type { VoiceData } from './synths/synth-select/synth-select';
import type { DrumSoundsData } from './synths/drum-sounds/drum-sounds';

export type WorkflowNodeData = {
  title?: string;
  label?: string;
  icon?: keyof typeof iconMapping;
  state?: 'running' | 'paused' | 'stopped';
} & ADSRData &
  LevelData &
  TextureData &
  TimeData &
  FilterData &
  PhaserData &
  RoomData &
  PadData &
  ChordData &
  CustomData &
  BeatMachineData &
  VoiceData &
  DrumSoundsData;

export type AppNodeType = keyof typeof nodeDefinitions;
export type AppNode = Node<WorkflowNodeData, AppNodeType>;
export type WorkflowNodeProps = NodeProps<AppNode> & { children?: ReactNode };
