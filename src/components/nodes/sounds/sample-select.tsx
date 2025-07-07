import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStrudelStore } from '@/store/strudel-store';
import { WorkflowNodeProps } from '..';
import WorkflowNode from '@/components/nodes/workflow-node';
import { useMemo } from 'react';
import { SOUND_OPTIONS } from '@/data/sound-options';

export function SampleSelect({ id, data }: WorkflowNodeProps) {
  const strudelStore = useStrudelStore();
  const config = useMemo(
    () => strudelStore.config[id] || {},
    [id, strudelStore.config]
  );
  const updateNode = useStrudelStore((state) => state.updateNode);

  const handleValueChange = (value: string) => {
    updateNode(id, { sound: value });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-2 p-3">
        <Select value={config.sound || ''} onValueChange={handleValueChange}>
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
