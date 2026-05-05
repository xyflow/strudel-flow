import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { WorkflowNodeProps, AppNode } from '..';
import WorkflowNode from '@/components/nodes/workflow-node';
import { DRUM_CATEGORIES } from '@/data/sounds';
import { CategorySelectItems } from '@/components/category-select-items';

export function DrumSoundsNode({ id, data }: WorkflowNodeProps) {
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
            <SelectValue placeholder="Select Drum Sound" />
          </SelectTrigger>
          <SelectContent>
            <CategorySelectItems categories={DRUM_CATEGORIES} />
          </SelectContent>
        </Select>
      </div>
    </WorkflowNode>
  );
}

DrumSoundsNode.strudelOutput = (node: AppNode, strudelString: string) => {
  if (!node.data.sound) return strudelString;

  const soundCall = `sound("${node.data.sound}")`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
};
