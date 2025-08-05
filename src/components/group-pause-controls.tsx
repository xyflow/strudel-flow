import { useAppStore } from '@/store/app-context';
import { findConnectedComponents } from '@/lib/graph-utils';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';

export function GroupPauseControls() {
  const { nodes, edges, updateNodeData } = useAppStore((state) => state);

  // Use simplified connected components instead of complex group logic
  const components = findConnectedComponents(nodes, edges);
  const groups = components.map((componentNodeIds, index) => {
    const isPaused = componentNodeIds.every((nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      return node?.data.state === 'paused';
    });
    return {
      groupId: componentNodeIds.sort().join('-'),
      nodeIds: componentNodeIds,
      index,
      isPaused,
    };
  });

  const handleGroupToggle = (nodeIds: string[], isPaused: boolean) => {
    const targetState = isPaused ? 'running' : 'paused';
    nodeIds.forEach((nodeId) => {
      updateNodeData(nodeId, { state: targetState });
    });
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-card rounded-lg border min-w-48">
      <label className="text-sm font-medium text-card-foreground">
        Group Controls
      </label>
      <div className="flex flex-col gap-1">
        {groups.map((group) => {
          return (
            <Button
              key={group.groupId}
              variant={group.isPaused ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2 justify-start"
              onClick={() => handleGroupToggle(group.nodeIds, group.isPaused)}
            >
              {group.isPaused ? (
                <Play className="w-3 h-3" />
              ) : (
                <Pause className="w-3 h-3" />
              )}
              Group {group.index + 1} ({group.nodeIds.length} nodes)
            </Button>
          );
        })}
      </div>
    </div>
  );
}
