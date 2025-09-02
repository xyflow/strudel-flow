import { AppNode, createNodeByType } from '@/components/nodes';
import { Edge } from '@xyflow/react';

export const initialNodes: AppNode[] = [
  createNodeByType({
    type: 'pad-node',
    id: 'padNode_1',
    position: { x: 0, y: 0 },
  }),
  createNodeByType({
    type: 'sample-select-node',
    id: 'sampleSelectNode_1',
    position: { x: 0, y: 600 },
  }),
];

export const initialEdges: Edge[] = [
  {
    id: 'edge_1',
    source: 'padNode_1',
    target: 'sampleSelectNode_1',
    type: 'default',
  },
];
