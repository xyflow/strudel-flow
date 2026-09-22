import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { Textarea } from '@/components/ui/textarea';

export function CustomNode({ id, data, type }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const customPattern = data.customPattern ?? 'sound("bd sd hh sd")';

  const handlePatternChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    updateNodeData(id, { customPattern: event.target.value });
  };

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-3 px-4 pt-1 pb-4 w-80">
        <div className="flex flex-col gap-2">
          <label className="sr-only">Strudel pattern</label>
          <Textarea
            aria-label="Strudel pattern"
            value={customPattern}
            onChange={handlePatternChange}
            placeholder='Enter raw Strudel code...&#10;Example: sound("bd sd").gain(0.8).lpf(1000)'
            className="nodrag nowheel font-mono text-xs leading-relaxed min-h-32 resize-none border rounded-lg px-3 py-2 bg-transparent border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

CustomNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const customPattern = node.data.customPattern ?? 'sound("bd sd hh sd")';

  if (!customPattern || !customPattern.trim()) return strudelString;

  const pattern = customPattern.trim();
  return strudelString ? `${strudelString}.stack(${pattern})` : pattern;
};
