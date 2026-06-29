import type { AppNode } from '@/components/nodes';
import { Edge } from '@xyflow/react';

export const initialNodes: AppNode[] = [
  {
    id: 'padNode_1',
    type: 'pad-node',
    position: { x: 0, y: 0 },
    data: { title: 'Pad', icon: 'Spline', state: 'running' },
  },
  {
    id: 'synthSelectNode_1',
    type: 'synth-select-node',
    position: { x: 0, y: 600 },
    data: { title: 'Synths', icon: 'CheckCheck', state: 'running' },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'edge_1',
    source: 'padNode_1',
    target: 'synthSelectNode_1',
    type: 'default',
  },
];
