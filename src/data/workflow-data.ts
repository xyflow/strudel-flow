import type { AppNode } from '@/components/nodes';
import { Edge } from '@xyflow/react';

export const initialNodes: AppNode[] = [
  {
    id: 'padNode_1',
    type: 'pad-node',
    position: { x: 0, y: 0 },
    data: {
      title: 'Pad', icon: 'Spline', state: 'running', steps: 8, octave: 3,
      grid: Array.from({ length: 16 }, (_, step) =>
        Array.from({ length: 8 }, (_, note) => step < 8 && note === [0, 2, 4, 6, 4, 2, 1, 4][step])),
    },
  },
  {
    id: 'synthSelectNode_1',
    type: 'synth-select-node',
    position: { x: 560, y: 25 },
    data: { title: 'Voice', icon: 'Waves', state: 'running', sound: 'triangle' },
  },
  {
    id: 'filter_1',
    type: 'lpf-node',
    position: { x: 560, y: 255 },
    data: { title: 'Filter', icon: 'Filter', state: 'running', lpf: '1500 1' },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'edge_1',
    source: 'padNode_1',
    target: 'synthSelectNode_1',
    type: 'default',
  },
  {
    id: 'edge_2', source: 'synthSelectNode_1', target: 'filter_1', type: 'default',
  },
];
