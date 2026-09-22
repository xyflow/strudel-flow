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
      <div className="flex w-64 flex-col gap-3 px-4 pt-1 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            ['bd', 'Kick'],
            ['sd', 'Snare'],
            ['hh', 'Hat'],
            ['cp', 'Clap'],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={sound === value}
              onClick={() => handleValueChange(value)}
              className="nodrag rounded-md border border-border bg-background/40 py-5 text-[10px] text-muted-foreground transition hover:border-primary/50 aria-pressed:border-primary/60 aria-pressed:bg-primary/15 aria-pressed:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
        <Select value={sound} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="More sounds" />
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
