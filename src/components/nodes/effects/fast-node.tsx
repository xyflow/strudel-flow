import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function FastNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const factor = useStrudelStore((state) =>
    state.config[id]?.fast ? parseFloat(state.config[id].fast!) : 2
  );

  const handleFactorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value > 0) {
      updateNode(id, { fast: value.toString() });
    }
  };

  const handlePresetClick = (presetValue: number) => {
    updateNode(id, { fast: presetValue.toString() });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card rounded-lg border">
        <label className="text-sm font-medium text-card-foreground">Fast</label>

        {/* Preset buttons */}
        <div className="grid grid-cols-3 gap-1">
          {[1.5, 2, 3, 4, 6, 8].map((preset) => (
            <Button
              key={preset}
              variant={factor === preset ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => handlePresetClick(preset)}
            >
              {preset}x
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
            min="0.1"
            max="16"
            step="0.1"
            placeholder="Speed factor"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

FastNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const fast = useStrudelStore.getState().config[node.id]?.fast;
  if (!fast) return strudelString;

  const fastCall = `fast(${fast})`;
  return strudelString ? `${strudelString}.${fastCall}` : fastCall;
};
