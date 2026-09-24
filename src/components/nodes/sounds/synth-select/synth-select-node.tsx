import { DEFAULT_SOUND } from './synth-select';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import WorkflowNode from '@/components/nodes/shared/workflow-node';
import { SYNTH_CATEGORIES } from '@/data/sounds';
import { cn } from '@/lib/utils';
import { CategorySelectItems } from '@/components/nodes/shared/category-select-items';

const waveforms = [
  { value: 'sine', label: 'Sine', path: 'M2 16 C8 0 12 0 18 16 S28 32 34 16' },
  { value: 'triangle', label: 'Triangle', path: 'M2 24 L10 8 L26 24 L34 8' },
  { value: 'sawtooth', label: 'Saw', path: 'M2 24 L17 8 L17 24 L32 8 L32 24' },
  {
    value: 'square',
    label: 'Square',
    path: 'M2 24 L2 8 L18 8 L18 24 L34 24 L34 8',
  },
];

export function SynthSelectNode({ id, data }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const sound = data.sound || DEFAULT_SOUND;

  const handleValueChange = (value: string) => {
    updateNodeData(id, { sound: value });
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="nodrag flex min-w-52 flex-col gap-4 p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {waveforms.map((wave) => (
            <button
              key={wave.value}
              aria-label={wave.label}
              title={wave.label}
              aria-pressed={sound === wave.value}
              onClick={() => handleValueChange(wave.value)}
              className={cn(
                'grid h-12 place-items-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                sound === wave.value
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-transparent bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              <svg
                viewBox="0 0 36 32"
                className="h-7 w-8 fill-none stroke-current stroke-[1.5]"
                aria-hidden
              >
                <path d={wave.path} />
              </svg>
            </button>
          ))}
        </div>
        <Select value={sound} onValueChange={handleValueChange}>
          <SelectTrigger
            aria-label="Voice sound"
            className="w-full border-0 bg-muted/50 text-xs"
          >
            <SelectValue placeholder="Choose sound" />
          </SelectTrigger>
          <SelectContent>
            {waveforms
              .filter(
                (wave) =>
                  !SYNTH_CATEGORIES.some((category) =>
                    category.options.includes(wave.value),
                  ),
              )
              .map((wave) => (
                <SelectItem key={wave.value} value={wave.value}>
                  {wave.label}
                </SelectItem>
              ))}
            <CategorySelectItems categories={SYNTH_CATEGORIES} />
          </SelectContent>
        </Select>
      </div>
    </WorkflowNode>
  );
}
