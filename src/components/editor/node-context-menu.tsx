import { RadialMenuPreview } from '@/components/ui/radial-menu/radial-menu-preview';
import { useRef, useState, type ReactElement } from 'react';
import { addEdge, reconnectEdge, useConnection, useReactFlow, type Edge, type OnConnectEnd, type ReactFlowProps } from '@xyflow/react';
import type { RadialMenuHandle } from '@/components/ui/radial-menu';
import { AudioLines, Piano, SlidersHorizontal } from 'lucide-react';
import {
  RadialMenu,
  RadialMenuItem,
  RadialMenuSubItem,
} from '@/components/ui/radial-menu';
import nodesConfig, { createNodeByType } from '@/components/nodes/registry';
import { iconMapping } from '@/data/icon-mapping';
import { useAppStore } from '@/store/app-store';

const categories = [
  { label: 'Instruments', category: 'Instruments', icon: Piano },
  { label: 'Sounds', category: 'Synths', icon: AudioLines },
  { label: 'Effects', category: 'Audio Effects', icon: SlidersHorizontal },
].map((category) => ({
  ...category,
  items: Object.values(nodesConfig).filter(
    (node) => node.category === category.category,
  ),
}));

type ConnectionHandlers = Pick<ReactFlowProps, 'onConnectEnd' | 'onReconnect' | 'onReconnectEnd'>;

export function NodeContextMenu({ children }: { children: (handlers: ConnectionHandlers) => ReactElement }) {
  const menuRef = useRef<RadialMenuHandle>(null);
  const pending = useRef<{ nodeId: string; handleId: string | null; type: 'source' | 'target'; edge?: Edge } | null>(null);
  const openFromHandle: OnConnectEnd = (event, state) => {
    pending.current = null;
    if (state.isValid || !state.fromNode || !state.fromHandle) return;
    const point = 'changedTouches' in event ? event.changedTouches[0] : event;
    if (!point || !document.elementFromPoint(point.clientX, point.clientY)?.classList.contains('react-flow__pane')) return;
    pending.current = { nodeId: state.fromNode.id, handleId: state.fromHandle.id ?? null, type: state.fromHandle.type };
    menuRef.current?.openAt({ x: point.clientX, y: point.clientY });
  };
  const handlers: ConnectionHandlers = {
    onConnectEnd: openFromHandle,
    onReconnect: (edge, connection) => useAppStore.setState(state => ({ edges: reconnectEdge(edge, connection, state.edges) })),
    onReconnectEnd: (event, edge, _type, state) => {
      openFromHandle(event, state);
      if (pending.current) pending.current.edge = edge;
    },
  };
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();
  return (
    <>
    <ConnectionMenuPreview />
    <RadialMenu menuRef={menuRef} trigger={children(handlers)} onPositionChange={(point, fromHandle) => {
      setPosition(point);
      if (!fromHandle) pending.current = null;
    }}>
      {categories.map(({ label, category, icon: Icon, items }) => (
          <RadialMenuItem
            key={category}
            label={label}
            icon={<Icon strokeWidth={1.7} />}
          >
            {items.map((node) => {
              const NodeIcon = iconMapping[node.icon];
              return (
                <RadialMenuSubItem
                  key={node.id}
                  aria-label={`Add ${node.title}`}
                  icon={<NodeIcon aria-hidden="true" />}
                  onSelect={() => {
                    const newNode = createNodeByType({ type: node.id, position: screenToFlowPosition(position) });
                    const origin = pending.current;
                    useAppStore.setState(state => {
                      const connection = origin && state.nodes.some(existing => existing.id === origin.nodeId)
                        ? origin.type === 'source'
                          ? { source: origin.nodeId, sourceHandle: origin.handleId, target: newNode.id, targetHandle: null }
                          : { source: newNode.id, sourceHandle: null, target: origin.nodeId, targetHandle: origin.handleId }
                        : null;
                      return {
                        nodes: [...state.nodes, newNode],
                        edges: connection
                          ? origin?.edge
                            ? reconnectEdge(origin.edge, connection, state.edges)
                            : addEdge({ ...connection, type: 'default' }, state.edges)
                          : state.edges,
                      };
                    });
                    pending.current = null;
                  }}
                >
                  {node.title}
                </RadialMenuSubItem>
              );
            })}
          </RadialMenuItem>
        ))}
    </RadialMenu>
    </>
  );
}

function ConnectionMenuPreview() {
  const connection = useConnection();
  const { flowToScreenPosition } = useReactFlow();
  if (!connection.inProgress || connection.toNode || connection.toHandle) return null;
  const position = flowToScreenPosition(connection.to);
  if (!document.elementFromPoint(position.x, position.y)?.classList.contains('react-flow__pane')) return null;
  return <RadialMenuPreview position={position} />;
}
