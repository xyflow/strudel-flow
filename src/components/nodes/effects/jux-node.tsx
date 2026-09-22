import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';

export function JuxNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const effect = data.jux || 'rev';

  // Available jux effects
  const effects = [
    { name: 'rev', value: 'rev', description: 'Reverse right channel' },
    { name: 'press', value: 'press', description: 'Compress right channel' },
    { name: 'crush', value: 'crush', description: 'Bitcrush right channel' },
    { name: 'delay', value: 'delay', description: 'Delay right channel' },
  ];

  // Handler for effect changes
  const handleEffectChange = (newEffect: string) => {
    updateNodeData(id, { jux: newEffect });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-4 bg-card text-card-foreground rounded-lg w-64">
        <div className="space-y-2">
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
  if (!node.data.jux) return strudelString;

  const transform = { rev: 'rev()', press: 'press()', crush: 'crush(4)', delay: 'delay(0.5)' }[jux];
  if (!transform) return strudelString;
  const juxCall = `jux(x => x.${transform})`;
  return strudelString ? `${strudelString}.${juxCall}` : juxCall;
};
