import type { Node, NodeProps } from '@xyflow/react';
import type { ReactNode } from 'react';
import type { iconMapping } from '@/data/icon-mapping';

export type WorkflowNodeData = {
  title?: string;
  label?: string;
  icon?: keyof typeof iconMapping;
  state?: 'running' | 'paused' | 'stopped';
} & Record<string, unknown>;
export type AppNodeType = string;
export type AppNode = Node<WorkflowNodeData, AppNodeType>;
export type WorkflowNodeProps = NodeProps<AppNode> & { children?: ReactNode };
