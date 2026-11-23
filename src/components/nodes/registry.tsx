import { programNodes } from './shared/program-nodes';
import type { NodeDefinition } from './define-node';
import { simpleNode } from './simple-node';
import type { SimpleNode } from '@/lib/strudel-calls';
import { createDefinitionComponent } from './shared/definition-node';
import type { XYPosition } from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { AppNode, AppNodeType, WorkflowNodeData } from './types';
export type {
  AppNode,
  AppNodeType,
  WorkflowNodeData,
  WorkflowNodeProps,
} from './types';
const discovered = import.meta.glob<NodeDefinition | SimpleNode>(
  './**/*.node.{ts,tsx}',
  {
    eager: true,
    import: 'default',
  },
);
const registered: Record<string, NodeDefinition> = Object.create(null);
for (const [path, value] of Object.entries(discovered)) {
  const definition =
    typeof value.generatePattern === 'function'
      ? (value as NodeDefinition)
      : simpleNode(
          `${path.split('/').pop()!.replace(/\.node\.tsx?$/, '')}-node`,
          value as SimpleNode,
        );
  if (Object.prototype.hasOwnProperty.call(registered, definition.id)) {
    throw new Error(`Duplicate node ID: ${definition.id}`);
  }
  registered[definition.id] = definition;
}
for (const [id, values, category] of [
  ['pattern-call-node', { s: 'bd sd' }, 'Instruments'],
  ['effect-call-node', { gain: 1 }, 'Audio Effects'],
] as const) {
  registered[id] = { ...simpleNode(id, values, category), menuHidden: true };
}
for (const definition of programNodes) registered[definition.id] = definition;
export const nodeDefinitions = Object.fromEntries(
  Object.entries(registered).sort(
    ([, a], [, b]) =>
      (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title),
  ),
);

export const nodeTypes = Object.fromEntries(
  Object.values(nodeDefinitions).map((definition) => [
    definition.id,
    createDefinitionComponent(definition),
  ]),
);

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
  if (!Object.prototype.hasOwnProperty.call(nodeDefinitions, type)) {
    throw new Error(`Unknown node type: ${type}`);
  }
  const { title, icon, defaults } = nodeDefinitions[type];
  return {
    id,
    type,
    position,
    data: data ?? {
      ...defaults,
      title,
      icon,
      state: 'running',
    },
  };
}
