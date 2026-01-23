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

  // Example synth categories (adjust as needed for your actual sounds)
  const synthCategories = [
    { label: 'Bass', options: ['bass', 'bass0', 'bass1', 'bass2', 'bass3', 'bassdm', 'bassfoo', 'jungbass', 'jvbass', 'moog'] },
    { label: 'Leads', options: ['arp', 'arpy', 'lead', 'hoover', 'juno', 'saw', 'stab', 'simplesine', 'sine', 'pluck'] },
    { label: 'Pads', options: ['pad', 'padlong', 'space', 'newnotes', 'notes'] },
    { label: 'FX & Other', options: SOUND_OPTIONS.filter((s) => !['bass', 'bass0', 'bass1', 'bass2', 'bass3', 'bassdm', 'bassfoo', 'jungbass', 'jvbass', 'moog', 'arp', 'arpy', 'lead', 'hoover', 'juno', 'saw', 'stab', 'simplesine', 'sine', 'pluck', 'pad', 'padlong', 'space', 'newnotes', 'notes'].includes(s)) },
  ];

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-2 p-3">
        <Select value={sound} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Sample" />
          </SelectTrigger>
          <SelectContent>
            {synthCategories.map((cat) => (
              <div key={cat.label}>
                <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">{cat.label}</div>
                {cat.options.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </div>
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
