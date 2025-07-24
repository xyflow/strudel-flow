import { AppNode, createNodeByType } from '@/components/nodes';
import { Edge } from '@xyflow/react';

export const initialNodes: AppNode[] = [
  createNodeByType({
    type: 'pad-node',
    id: 'padNode_1',
    position: { x: 600, y: 300 },
  }),
  createNodeByType({
    type: 'sample-select',
    id: 'workflowNode_2',
    position: { x: 700, y: 700 },
  }),
];

export const initialEdges: Edge[] = [
  {
    id: 'edge_1',
    source: 'padNode_1',
    target: 'workflowNode_2',
    type: 'bezier',
  },
];
