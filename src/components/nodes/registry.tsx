import type { NodeDefinition } from './define-node';
import { createDefinitionComponent } from './shared/definition-node';
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

export type NodeConfig = {
  id: AppNodeType;
  title: string;
  category: 'Instruments' | 'Synths' | 'Audio Effects';
  icon: keyof typeof iconMapping;
};

// New nodes register themselves by exporting a definition from a *.node.ts(x) file.
const discovered = import.meta.glob<NodeDefinition>('./**/*.node.{ts,tsx}', {
  eager: true,
  import: 'default',
});
type RegisteredNode = Omit<
  NodeDefinition,
  'parameters' | 'defaults' | 'renderControls'
> & {
  component: ComponentType<WorkflowNodeProps>;
  defaults: Record<string, unknown>;
};
const registered: Record<string, RegisteredNode> = Object.create(null);
for (const definition of Object.values(discovered)) {
  if (Object.prototype.hasOwnProperty.call(registered, definition.id)) {
    throw new Error(`Duplicate node ID: ${definition.id}`);
  }
  registered[definition.id] = {
    ...definition,
    component: createDefinitionComponent(definition),
  };
}
export const nodeDefinitions = Object.fromEntries(
  Object.entries(registered).sort(
    ([, a], [, b]) =>
      (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title),
  ),
);

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
  if (!Object.prototype.hasOwnProperty.call(nodesConfig, type)) {
    throw new Error(`Unknown node type: ${type}`);
  }
  const { title, icon } = nodesConfig[type];
  return {
    id,
    type,
    position,
    data: data ?? {
      ...nodeDefinitions[type].defaults,
      title,
      icon,
      state: 'running',
    },
  };
}

export default nodesConfig;
