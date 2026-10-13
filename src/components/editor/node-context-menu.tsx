import { useRef, type ReactElement, type MouseEventHandler } from 'react';
import {
  addEdge,
  reconnectEdge,
  useReactFlow,
  type Edge,
  type Connection,
  type OnConnectEnd,
  type ReactFlowProps,
} from '@xyflow/react';
import type { RadialMenuHandle } from '@/components/ui/radial-menu';
import {
  RadialMenu,
  RadialMenuItem,
  RadialMenuSubItem,
} from '@/components/ui/radial-menu';
import {
  createNodeByType,
  type AppNodeType,
} from '@/components/nodes/registry';
import { iconMapping } from '@/data/icon-mapping';
import { radialMenuItems } from '@/data/radial-menu';
import { useAppStore } from '@/store/app-store';
import { getMenuSize } from '@/components/ui/radial-menu/geometry';

type ConnectionHandlers = Pick<
  ReactFlowProps,
  'onConnectEnd' | 'onReconnect' | 'onReconnectEnd'
>;

export function NodeContextMenu({
  children,
}: {
  children: (
    handlers: ConnectionHandlers,
    onAddNode: MouseEventHandler<HTMLButtonElement>,
  ) => ReactElement;
}) {
  const menuRef = useRef<RadialMenuHandle>(null);
  const pending = useRef<PendingConnection | null>(null);
  const openFromHandle: OnConnectEnd = (event, state) => {
    pending.current = null;
    if (state.isValid || !state.fromNode || !state.fromHandle) return;
    const point = 'changedTouches' in event ? event.changedTouches[0] : event;
    if (
      !point ||
      !document
        .elementFromPoint(point.clientX, point.clientY)
        ?.classList.contains('react-flow__pane')
    )
      return;
    pending.current = {
      nodeId: state.fromNode.id,
      handleId: state.fromHandle.id ?? null,
      type: state.fromHandle.type,
    };
    menuRef.current?.openAt({ x: point.clientX, y: point.clientY }, true);
  };
  const handlers: ConnectionHandlers = {
    onConnectEnd: openFromHandle,
    onReconnect: (edge, connection) =>
      useAppStore.setState((state) => ({
        edges: reconnectEdge(edge, connection, state.edges),
      })),
    onReconnectEnd: (event, edge, _type, state) => {
      openFromHandle(event, state);
      if (pending.current) pending.current.edge = edge;
    },
  };
  const position = useRef({ x: 0, y: 0 });
  const { screenToFlowPosition, getViewport } = useReactFlow();
  const openFromToolbar: MouseEventHandler<HTMLButtonElement> = (event) => {
    const toolbar = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!toolbar) return;
    const size = getMenuSize(window.innerWidth, window.innerHeight);
    menuRef.current?.openAt({
      x: toolbar.left - 24 - size / 2,
      y: toolbar.bottom + 12 + size / 2,
    });
  };

  const addNode = (type: AppNodeType) => {
    const canvas = document
      .querySelector('.reactflow-wrapper')
      ?.getBoundingClientRect();
    if (!canvas) return;
    const { zoom } = getViewport();
    const existing = useAppStore
      .getState()
      .nodes.find((node) => node.type === type);
    const width = (existing?.measured?.width ?? 500) * zoom;
    const height = (existing?.measured?.height ?? 500) * zoom;
    const inset = 24;
    const spawn = {
      x: Math.max(
        canvas.left + inset,
        Math.min(position.current.x, canvas.right - width - inset),
      ),
      y: Math.max(
        canvas.top + inset,
        Math.min(position.current.y, canvas.bottom - height - inset),
      ),
    };
    const newNode = createNodeByType({
      type,
      position: screenToFlowPosition(spawn),
    });
    const origin = pending.current;
    useAppStore.setState((state) => {
      let edges = state.edges;
      if (origin && state.nodes.some((node) => node.id === origin.nodeId)) {
        const connection = connectionToNode(origin, newNode.id);
        edges = origin.edge
          ? reconnectEdge(origin.edge, connection, edges)
          : addEdge({ ...connection, type: 'default' }, edges);
      }
      return { nodes: [...state.nodes, newNode], edges };
    });
    pending.current = null;
  };

  return (
    <RadialMenu
      ariaLabel="Add nodes"
      openOnTouchTap
      isTriggerTarget={(target) =>
        target.classList.contains('react-flow__pane')
      }
      menuRef={menuRef}
      trigger={children(handlers, openFromToolbar)}
      onPositionChange={(point, fromHandle) => {
        position.current = point;
        if (!fromHandle) pending.current = null;
      }}
    >
      {radialMenuItems.map(({ label, category, icon: Icon, items }) => (
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
                onSelect={() => addNode(node.id)}
              >
                {node.title}
              </RadialMenuSubItem>
            );
          })}
        </RadialMenuItem>
      ))}
    </RadialMenu>
  );
}

type PendingConnection = {
  nodeId: string;
  handleId: string | null;
  type: 'source' | 'target';
  edge?: Edge;
};

function connectionToNode(
  origin: PendingConnection,
  nodeId: string,
): Connection {
  return origin.type === 'source'
    ? {
        source: origin.nodeId,
        sourceHandle: origin.handleId,
        target: nodeId,
        targetHandle: null,
      }
    : {
        source: nodeId,
        sourceHandle: null,
        target: origin.nodeId,
        targetHandle: origin.handleId,
      };
}
