import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Slider } from '@/components/ui/slider';
import { useMemo } from 'react';

export function LpfNode({ id, data }: WorkflowNodeProps) {
  const strudelStore = useStrudelStore();
  const config = useMemo(
    () => strudelStore.config[id] || {},
    [id, strudelStore.config]
  );
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Extract values or set defaults
  const parts = config.lpf ? config.lpf.split(' ') : ['1000', '1'];
  const frequency = parseFloat(parts[0]) || 1000;
  const resonance = parseFloat(parts[1]) || 1;

  // Handler for frequency changes
  const handleFrequencyChange = (value: number[]) => {
    const newFrequency = value[0];
    updateNode(id, { lpf: `${newFrequency} ${resonance}` });
  };

  // Handler for resonance changes
  const handleResonanceChange = (value: number[]) => {
    const newResonance = value[0];
    updateNode(id, { lpf: `${frequency} ${newResonance}` });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-4 bg-card text-card-foreground rounded-md min-w-80">
        {/* Frequency control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Frequency</label>
            <span className="text-xs text-muted-foreground">{frequency}Hz</span>
          </div>
          <Slider
            value={[frequency]}
            onValueChange={handleFrequencyChange}
            min={100}
            max={5000}
            step={50}
            className="w-full"
          />
        </div>

        {/* Resonance control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Resonance</label>
            <span className="text-xs text-muted-foreground">{resonance}</span>
          </div>
          <Slider
            value={[resonance]}
            onValueChange={handleResonanceChange}
            min={0.1}
            max={10}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}
