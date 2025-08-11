import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Slider } from '@/components/ui/slider';

export function PanNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const pan = data.pan ? parseFloat(data.pan) : 0.5;

  // Get pan description
  const getPanDescription = () => {
    if (pan < 0.3) return 'Left';
    if (pan > 0.7) return 'Right';
    return 'Center';
  };

  // Handler for pan changes
  const handlePanChange = (value: number[]) => {
    updateNodeData(id, { pan: value[0].toString() });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-4 bg-card text-card-foreground rounded-md min-w-80">
        {/* Pan control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Pan</label>
            <span className="text-xs text-muted-foreground">
              {pan.toFixed(2)} ({getPanDescription()})
            </span>
          </div>
          <div className="relative">
            {' '}
            <Slider
              value={[pan]}
              onValueChange={handlePanChange}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>L</span>
              <span>C</span>
              <span>R</span>
            </div>
          </div>
        </div>

        {/* Visual pan indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-center bg-muted rounded-md p-2">
            <div className="flex items-center w-32 h-6 bg-background rounded relative">
              <div
                className="absolute w-3 h-3 bg-purple-500 rounded-full transition-all duration-200"
                style={{ left: `${pan * 100}%`, transform: 'translateX(-50%)' }}
              />
              <div className="absolute left-1/2 w-px h-full bg-muted-foreground/30 transform -translate-x-1/2" />
            </div>
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

PanNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const pan = node.data.pan ? parseFloat(node.data.pan) : 0.5;
  if (pan === 0.5) return strudelString;

  const panCall = `pan(${pan})`;
  return strudelString ? `${strudelString}.${panCall}` : panCall;
};
