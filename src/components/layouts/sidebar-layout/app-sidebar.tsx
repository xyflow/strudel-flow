import { useState, useCallback, ComponentProps, useRef } from 'react';
import { Command, GripVertical, Plus } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { SettingsDialog } from '@/components/settings-dialog';
import nodesConfig, {
  AppNode,
  createNodeByType,
  type NodeConfig,
} from '@/components/nodes';
import { cn } from '@/lib/utils';
import { iconMapping } from '@/data/icon-mapping';
import { useAppStore } from '@/store/app-context';
import { useShallow } from 'zustand/react/shallow';
import { type AppStore } from '@/store/app-store';

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  // Group nodes by category
  const nodesByCategory = Object.values(nodesConfig).reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, NodeConfig[]>);

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="py-0">
        <div className="flex gap-2 px-1 h-14 items-center ">
          <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Command className="size-3" />
          </div>
          <span className="truncate font-semibold">Flow Machine</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {Object.entries(nodesByCategory).map(([category, nodes]) => (
          <SidebarGroup key={category}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground capitalize">
              {category}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nodes.map((item) => (
                  <DraggableItem key={item.title} {...item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <SettingsDialog />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

const selector = (state: AppStore) => ({
  addNode: state.addNode,
});

function DraggableItem(props: NodeConfig) {
  const { screenToFlowPosition } = useReactFlow();
  const { addNode } = useAppStore(useShallow(selector));
  const [isDragging, setIsDragging] = useState(false);

  const onClick = useCallback(() => {
    const newNode: AppNode = createNodeByType({
      type: props.id,
      position: screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }),
    });

    addNode(newNode);
  }, [props, addNode, screenToFlowPosition]);

  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData('application/reactflow', JSON.stringify(props));
      setIsDragging(true);
    },
    [props]
  );

  const lastDragPos = useRef({ x: 0, y: 0 });

  function onDrag(e: React.DragEvent) {
    const lastPos = lastDragPos.current;
    if (lastPos.x === e.clientX && lastPos.y === e.clientY) {
      return;
    }
    lastDragPos.current = { x: e.clientX, y: e.clientY };
  }

  function onDragEnd() {
    setIsDragging(false);
  }

  const IconComponent = props?.icon ? iconMapping[props.icon] : undefined;

  return (
    <SidebarMenuItem
      className={cn(
        'relative border-2 active:scale-[.99] rounded-md',
        isDragging ? 'border-green-500' : 'border-gray-100'
      )}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onClick={onClick}
      draggable
      key={props.title}
    >
      {isDragging && (
        <span
          role="presentation"
          className="absolute -top-3 -right-3 rounded-md border-2 border-green-500 bg-card"
        >
          <Plus className="size-4" />
        </span>
      )}
      <SidebarMenuButton className="bg-card cursor-grab active:cursor-grabbing">
        {IconComponent ? <IconComponent aria-label={props?.icon} /> : null}
        <span>{props.title}</span>
        <GripVertical className="ml-auto" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
