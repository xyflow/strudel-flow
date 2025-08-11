import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/app-context';
import { WorkflowNodeProps, AppNode } from '..';
import WorkflowNode from '@/components/nodes/workflow-node';
import { SOUND_OPTIONS } from '@/data/sound-options';

export function SynthSelectNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const sound = data.sound || '';

  const handleValueChange = (value: string) => {
    updateNodeData(id, { sound: value });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-2 p-3">
        <Select value={sound} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Sample" />
          </SelectTrigger>
          <SelectContent>
            {SOUND_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </WorkflowNode>
  );
}

SynthSelectNode.strudelOutput = (node: AppNode, strudelString: string) => {
  if (!node.data.sound) return strudelString;

  const soundCall = `sound("${node.data.sound}")`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
};
