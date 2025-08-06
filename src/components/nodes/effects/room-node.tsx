import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function RoomNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Extract values or set defaults
  const room = data.room ? parseFloat(data.room) : 0;
  const roomsize = data.roomsize ? parseFloat(data.roomsize) : 1;
  const roomfade = data.roomfade ? parseFloat(data.roomfade) : 0.5;
  const roomlp = data.roomlp ? parseFloat(data.roomlp) : 10000;
  const roomdim = data.roomdim ? parseFloat(data.roomdim) : 8000;

  // Handlers for each property
  const handleSliderChange = (key: string, value: number[]) => {
    updateNodeData(id, { [key]: value[0].toFixed(2) });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-4 p-3">
        <label className="text-sm font-medium">Room Value</label>
        <Slider
          value={[room]}
          onValueChange={(value) => handleSliderChange('room', value)}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Current room: <strong>{room.toFixed(2)}</strong>
        </div>

        <label className="text-sm font-medium">Room Size</label>
        <Slider
          value={[roomsize]}
          onValueChange={(value) => handleSliderChange('roomsize', value)}
          min={0}
          max={10}
          step={0.1}
          className="w-full"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Current room size: <strong>{roomsize.toFixed(1)}</strong>
        </div>

        <label className="text-sm font-medium">Room Fade</label>
        <Slider
          value={[roomfade]}
          onValueChange={(value) => handleSliderChange('roomfade', value)}
          min={0}
          max={10}
          step={0.1}
          className="w-full"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Current room fade: <strong>{roomfade.toFixed(1)}</strong>
        </div>

        <label className="text-sm font-medium">Room Lowpass</label>
        <Slider
          value={[roomlp]}
          onValueChange={(value) => handleSliderChange('roomlp', value)}
          min={0}
          max={20000}
          step={100}
          className="w-full"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Current room lowpass: <strong>{roomlp}</strong> Hz
        </div>

        <label className="text-sm font-medium">Room Dimension</label>
        <Slider
          value={[roomdim]}
          onValueChange={(value) => handleSliderChange('roomdim', value)}
          min={0}
          max={20000}
          step={100}
          className="w-full"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Current room dimension: <strong>{roomdim}</strong> Hz
        </div>
      </div>
    </WorkflowNode>
  );
}

RoomNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const room = node.data.room;
  const roomsize = node.data.roomsize;
  const roomfade = node.data.roomfade;
  const roomlp = node.data.roomlp;
  const roomdim = node.data.roomdim;

  const calls = [];

  if (room) calls.push(`room("${room}")`);
  if (roomsize) calls.push(`rsize(${roomsize})`);
  if (roomfade) calls.push(`rfade(${roomfade})`);
  if (roomlp) calls.push(`rlp(${roomlp})`);
  if (roomdim) calls.push(`rdim(${roomdim})`);

  if (calls.length === 0) return strudelString;

  const roomCalls = calls.join('.');
  return strudelString ? `${strudelString}.${roomCalls}` : roomCalls;
};
