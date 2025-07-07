import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Slider } from '@/components/ui/slider';
import { useMemo } from 'react';

export function DistortNode({ id, data }: WorkflowNodeProps) {
  const strudelStore = useStrudelStore();
  const config = useMemo(
    () => strudelStore.config[id] || {},
    [id, strudelStore.config]
  );
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Extract values or set defaults
  const amount = config.distort ? parseFloat(config.distort.split(':')[0]) : 0.5;
  const postgain = config.distort && config.distort.includes(':') 
    ? parseFloat(config.distort.split(':')[1]) 
    : 1;

  // Handler for distortion amount changes
  const handleAmountChange = (value: number[]) => {
    const newAmount = value[0];
    const distortValue = postgain !== 1 ? `${newAmount}:${postgain}` : `${newAmount}`;
    updateNode(id, { distort: distortValue });
  };

  // Handler for postgain changes
  const handlePostgainChange = (value: number[]) => {
    const newPostgain = value[0];
    const distortValue = newPostgain !== 1 ? `${amount}:${newPostgain}` : `${amount}`;
    updateNode(id, { distort: distortValue });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-4 bg-card text-card-foreground rounded-md min-w-80">
        {/* Distortion amount */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Distortion</label>
            <span className="text-xs text-muted-foreground">
              {amount.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[amount]}
            onValueChange={handleAmountChange}
            min={0}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Postgain control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Postgain</label>
            <span className="text-xs text-muted-foreground">
              {postgain.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[postgain]}
            onValueChange={handlePostgainChange}
            min={0.1}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}
