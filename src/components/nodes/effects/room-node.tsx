import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Slider } from '@/components/ui/slider';

export function RoomNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const config = useStrudelStore((state) => state.config[id]);

  // Extract values or set defaults
  const room = config?.room ? parseFloat(config.room) : 0;
  const roomsize = config?.roomsize ? parseFloat(config.roomsize) : 1;
  const roomfade = config?.roomfade ? parseFloat(config.roomfade) : 0.5;
  const roomlp = config?.roomlp ? parseFloat(config.roomlp) : 10000;
  const roomdim = config?.roomdim ? parseFloat(config.roomdim) : 8000;

  // Handlers for each property
  const handleSliderChange = (key: string, value: number[]) => {
    updateNode(id, { [key]: value[0].toFixed(2) });
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
  const config = useStrudelStore.getState().config[node.id];
  const room = config?.room;
  const roomsize = config?.roomsize;
  const roomfade = config?.roomfade;
  const roomlp = config?.roomlp;
  const roomdim = config?.roomdim;

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
