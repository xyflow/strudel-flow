import { useAppStore } from '@/store/app-context';
import { useStrudelStore } from '@/store/strudel-store';
import { findAllGroups } from '@/lib/graph-utils';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';

export function GroupPauseControls() {
  const nodes = useAppStore((state) => state.nodes);
  const edges = useAppStore((state) => state.edges);
  const pauseGroup = useStrudelStore((state) => state.pauseGroup);
  const unpauseGroup = useStrudelStore((state) => state.unpauseGroup);
  const isGroupPaused = useStrudelStore((state) => state.isGroupPaused);

  const groups = findAllGroups(nodes, edges);

  const handleGroupToggle = (groupId: string, nodeIds: string[]) => {
    if (isGroupPaused(groupId)) {
      unpauseGroup(groupId);
    } else {
      pauseGroup(groupId, nodeIds);
    }
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
        {groups.map((group, index) => {
          const isPaused = isGroupPaused(group.groupId);
          return (
            <Button
              key={group.groupId}
              variant={isPaused ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2 justify-start"
              onClick={() => handleGroupToggle(group.groupId, group.nodeIds)}
            >
              {isPaused ? (
                <Play className="w-3 h-3" />
              ) : (
                <Pause className="w-3 h-3" />
              )}
              Group {index + 1} ({group.nodeIds.length} nodes)
            </Button>
          );
        })}
      </div>
    </div>
  );
}
