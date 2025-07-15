import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStrudelStore } from '@/store/strudel-store';
import { WorkflowNodeProps, AppNode } from '..';
import WorkflowNode from '@/components/nodes/workflow-node';
import { SOUND_OPTIONS } from '@/data/sound-options';

export function SampleSelect({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const sound = useStrudelStore((state) => state.config[id]?.sound || '');

  const handleValueChange = (value: string) => {
    updateNode(id, { sound: value });
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

// Define the strudel output transformation
SampleSelect.strudelOutput = (node: AppNode, strudelString: string) => {
  const sound = useStrudelStore.getState().config[node.id]?.sound;
  if (!sound) return strudelString;
  
  const soundCall = `sound("${sound}")`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
};
