import {
  useRef,
  useState,
  type ReactElement,
  type MouseEventHandler,
} from 'react';
import {
  addEdge,
  reconnectEdge,
  useReactFlow,
  type Edge,
  type OnConnectEnd,
  type ReactFlowProps,
} from '@xyflow/react';
import type { RadialMenuHandle } from '@/components/ui/radial-menu';
import {
  RadialMenu,
  RadialMenuItem,
  RadialMenuSubItem,
} from '@/components/ui/radial-menu';
import { createNodeByType } from '@/components/nodes/registry';
import { iconMapping } from '@/data/icon-mapping';
import { radialMenuItems } from '@/data/radial-menu';
import { useAppStore } from '@/store/app-store';


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
  const pending = useRef<{
    nodeId: string;
    handleId: string | null;
    type: 'source' | 'target';
    edge?: Edge;
  } | null>(null);
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { screenToFlowPosition, getViewport } = useReactFlow();
  return (
    <>
      <RadialMenu
        ariaLabel="Add nodes"
        openOnTouchTap
        isTriggerTarget={(target) => target.classList.contains('react-flow__pane')}
        menuRef={menuRef}
        trigger={children(handlers, (event) => {
          const toolbar =
            event.currentTarget.parentElement!.getBoundingClientRect();
          const compact = window.innerWidth <= 640 || window.innerHeight <= 500;
          const size = Math.min(
            compact ? 280 : 380,
            window.innerWidth - 16,
            window.innerHeight - 16,
          );
          menuRef.current?.openAt({
            x: toolbar.left - 24 - size / 2,
            y: toolbar.bottom + 12 + size / 2,
          });
        })}
        onPositionChange={(point, fromHandle) => {
          setPosition(point);
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
                  onSelect={() => {
                    const canvas = document.querySelector('.reactflow-wrapper')!.getBoundingClientRect();
                    const zoom = getViewport().zoom;
                    const existing = useAppStore.getState().nodes.find((item) => item.type === node.id);
                    const width = (existing?.measured?.width ?? 500) * zoom;
                    const height = (existing?.measured?.height ?? 500) * zoom;
                    const inset = 24;
                    const spawn = {
                      x: Math.max(canvas.left + inset, Math.min(position.x, canvas.right - width - inset)),
                      y: Math.max(canvas.top + inset, Math.min(position.y, canvas.bottom - height - inset)),
                    };
                    const newNode = createNodeByType({
                      type: node.id,
                      position: screenToFlowPosition(spawn),
                    });
                    const origin = pending.current;
                    useAppStore.setState((state) => {
                      const connection =
                        origin &&
                        state.nodes.some(
                          (existing) => existing.id === origin.nodeId,
                        )
                          ? origin.type === 'source'
                            ? {
                                source: origin.nodeId,
                                sourceHandle: origin.handleId,
                                target: newNode.id,
                                targetHandle: null,
                              }
                            : {
                                source: newNode.id,
                                sourceHandle: null,
                                target: origin.nodeId,
                                targetHandle: origin.handleId,
                              }
                          : null;
                      return {
                        nodes: [...state.nodes, newNode],
                        edges: connection
                          ? origin?.edge
                            ? reconnectEdge(
                                origin.edge,
                                connection,
                                state.edges,
                              )
                            : addEdge(
                                { ...connection, type: 'default' },
                                state.edges,
                              )
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

