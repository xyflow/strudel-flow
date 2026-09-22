import { useState } from 'react';
import { Code2, Ellipsis, Trash2, Volume2, VolumeX } from 'lucide-react';
import { Position } from '@xyflow/react';
import { WorkflowNodeData, AppNodeType } from '@/components/nodes/';
import nodesConfig from '@/components/nodes/';
import { BaseNode } from '@/components/base-node';
import { useAppStore } from '@/store/app-store';
import { usePlaybackStore } from '@/store/playback-store';
import PatternPopup from '@/components/pattern-popup';
import { BaseHandle } from '@/components/base-handle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NodeHeaderAction } from '@/components/node-header';
import { cn } from '@/lib/utils';

function WorkflowNode({
  id,
  data,
  type,
  children,
}: {
  id: string;
  data: WorkflowNodeData;
  type?: AppNodeType;
  children?: React.ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);
  const nodeType = useAppStore(
    (state) => state.nodes.find((node) => node.id === id)?.type,
  );
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const removeNode = useAppStore((state) => state.removeNode);
  const setGroupState = useAppStore((state) => state.setGroupState);
  const category = nodesConfig[type ?? nodeType ?? 'pad-node']?.category;
  const isInstrument = category === 'Instruments';
  const isPaused = data.state === 'paused';

  return (
    <BaseNode>
      <BaseHandle
        position={Position.Left}
        type="target"
        aria-label="Patch input"
      />
      <BaseHandle
        position={Position.Right}
        type="source"
        aria-label="Patch output"
      />
      <header className="flex items-center gap-3 px-3 pt-2 pb-4">
        <span
          aria-hidden
          className={cn(
            'size-1.5 rounded-full',
            isPlaying && !isPaused ? 'bg-primary ' : 'bg-muted-foreground/30',
          )}
        />
        <h3 className="flex-1 text-[11px] font-semibold tracking-[.16em] uppercase">
          {data.title}
        </h3>
        <div className="flex items-center gap-1">
          {isInstrument && (
            <NodeHeaderAction
              label={isPaused ? 'Unmute instrument' : 'Mute instrument'}
              onClick={() => setGroupState(id, isPaused ? 'running' : 'paused')}
              className={cn(
                'size-7 rounded-md text-muted-foreground',
                isPaused && 'text-primary',
              )}
            >
              {isPaused ? (
                <VolumeX className="size-3.5" />
              ) : (
                <Volume2 className="size-3.5" />
              )}
            </NodeHeaderAction>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <NodeHeaderAction
                label="Module options"
                className="size-7 rounded-md text-muted-foreground"
              >
                <Ellipsis />
              </NodeHeaderAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-md">
              <DropdownMenuItem onSelect={() => setShowCode(!showCode)}>
                <Code2 />
                {showCode ? 'Hide code' : 'View code'}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => removeNode(id)}
              >
                <Trash2 />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {children}
      {showCode && <PatternPopup id={id} />}
    </BaseNode>
  );
}
export default WorkflowNode;
