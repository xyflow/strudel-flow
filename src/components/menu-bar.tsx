import { useReactFlow } from '@xyflow/react';
import { AudioLines, Piano, SlidersHorizontal } from 'lucide-react';
import {
  RadialMenu,
  RadialMenuItem,
  RadialMenuSubItem,
} from '@/components/ui/radial-menu';
import nodesConfig, { createNodeByType } from '@/components/nodes';
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

export function MenuBar() {
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useAppStore((state) => state.addNode);
  return (
    <div className="absolute bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2">
      <RadialMenu
        label="Add nodes"
        openLabel="Add a node"
        closeLabel="Close node menu"
      >
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
                  onSelect={() =>
                    addNode(
                      createNodeByType({
                        type: node.id,
                        position: screenToFlowPosition({
                          x: window.innerWidth / 2,
                          y: window.innerHeight / 2,
                        }),
                      }),
                    )
                  }
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      'application/reactflow',
                      JSON.stringify(node),
                    );
                    event.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  {node.title}
                </RadialMenuSubItem>
              );
            })}
          </RadialMenuItem>
        ))}
      </RadialMenu>
    </div>
  );
}
