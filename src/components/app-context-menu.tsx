import { ReactNode } from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import nodesConfig, { AppNodeType } from '@/components/nodes';
import { iconMapping } from '@/data/icon-mapping';
import { useClientPosition } from '@/hooks/use-client-position';
import { useAppStore } from '@/store/app-context';

export default function AppContextMenu({ children }: { children: ReactNode }) {
  const [position, setPosition] = useClientPosition();
  const addNodeByType = useAppStore((s) => s.addNodeByType);

  const onItemClick = (nodeType: AppNodeType) => {
    if (!position) {
      return;
    }

    addNodeByType(nodeType, position);
  };

  return (
    <div className="h-full w-full bg-gray-100" onContextMenu={setPosition}>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          {Object.values(nodesConfig).map((item) => {
            const IconComponent = item?.icon
              ? iconMapping[item.icon]
              : undefined;
            return (
              <a key={item.title} onClick={() => onItemClick(item.id)}>
                <ContextMenuItem className="flex items-center space-x-2">
                  {IconComponent ? (
                    <IconComponent aria-label={item?.icon} />
                  ) : null}
                  <span>New {item.title}</span>
                </ContextMenuItem>
              </a>
            );
          })}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
