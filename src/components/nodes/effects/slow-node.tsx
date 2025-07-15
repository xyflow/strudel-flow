import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SlowNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const factor = useStrudelStore((state) =>
    state.config[id]?.slow ? parseFloat(state.config[id].slow!) : 0.5
  );

  const handleFactorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value > 0) {
      updateNode(id, { slow: value.toString() });
    }
  };

  const handlePresetClick = (presetValue: number) => {
    updateNode(id, { slow: presetValue.toString() });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card rounded-lg border">
        <label className="text-sm font-medium text-card-foreground">Slow</label>

        {/* Preset buttons */}
        <div className="grid grid-cols-3 gap-1">
          {[0.1, 0.125, 0.25, 0.5, 0.75].map((preset) => (
            <Button
              key={preset}
              variant={factor === preset ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => handlePresetClick(preset)}
            >
              {preset}
            </Button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">
            Custom Factor:
          </label>
          <Input
            type="number"
            value={factor}
            onChange={handleFactorChange}
            className="bg-background text-foreground text-sm"
            min="0.0625"
            max="16"
            step="0.125"
            placeholder="Slow factor"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

SlowNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const slow = useStrudelStore.getState().config[node.id]?.slow;
  if (!slow) return strudelString;

  const slowCall = `slow(${slow})`;
  return strudelString ? `${strudelString}.${slowCall}` : slowCall;
};
