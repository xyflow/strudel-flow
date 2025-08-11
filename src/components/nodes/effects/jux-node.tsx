import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Button } from '@/components/ui/button';

export function JuxNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const effect = data.jux || 'rev';

  // Available jux effects
  const effects = [
    { name: 'Reverse', value: 'rev', description: 'Reverse right channel' },
    { name: 'Press', value: 'press', description: 'Compress right channel' },
    { name: 'Crush', value: 'crush', description: 'Bitcrush right channel' },
    { name: 'Delay', value: 'delay', description: 'Delay right channel' },
  ];

  // Handler for effect changes
  const handleEffectChange = (newEffect: string) => {
    updateNodeData(id, { jux: newEffect });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-4 bg-card text-card-foreground rounded-md min-w-80">
        {/* Title and description */}
        <div className="text-center">
          <h3 className="text-sm font-semibold">Jux</h3>
          <p className="text-xs text-muted-foreground">
            Apply effect to right channel
          </p>
        </div>

        {/* Effect selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Effect:</label>
          <div className="grid grid-cols-2 gap-1">
            {effects.map((eff) => (
              <Button
                key={eff.value}
                size="sm"
                variant={effect === eff.value ? 'default' : 'outline'}
                className="text-xs"
                onClick={() => handleEffectChange(eff.value)}
              >
                {eff.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

JuxNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const jux = node.data.jux || 'rev';
  if (jux === 'rev') return strudelString;

  const juxCall = `jux(${jux})`;
  return strudelString ? `${strudelString}.${juxCall}` : juxCall;
};
