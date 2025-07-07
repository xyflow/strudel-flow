import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Slider } from '@/components/ui/slider';
import { useMemo } from 'react';

export function PhaserNode({ id, data }: WorkflowNodeProps) {
  const strudelStore = useStrudelStore();
  const config = useMemo(
    () => strudelStore.config[id] || {},
    [id, strudelStore.config]
  );
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Extract values or set defaults
  const speed = config.phaser ? parseFloat(config.phaser) : 1;
  const depth = config.phaserdepth ? parseFloat(config.phaserdepth) : 0.5;

  // Handler for speed changes
  const handleSpeedChange = (value: number[]) => {
    updateNode(id, {
      phaser: value[0].toString(),
      phaserdepth: depth.toString(),
    });
  };

  // Handler for depth changes
  const handleDepthChange = (value: number[]) => {
    updateNode(id, {
      phaser: speed.toString(),
      phaserdepth: value[0].toString(),
    });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-4 bg-card text-card-foreground rounded-md min-w-80">
        {/* Speed control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Speed</label>
            <span className="text-xs text-muted-foreground">{speed}x</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={handleSpeedChange}
            min={0.1}
            max={10}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Depth control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Depth</label>
            <span className="text-xs text-muted-foreground">
              {depth.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[depth]}
            onValueChange={handleDepthChange}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Visual phaser indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-center bg-muted rounded-md p-3">
            <div className="flex space-x-1 h-[15px]">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all duration-300 bg-pink-500"
                  style={{
                    height: `${
                      8 +
                      Math.sin((Date.now() / 1000) * speed + i * 0.5) *
                        depth *
                        16
                    }px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}
