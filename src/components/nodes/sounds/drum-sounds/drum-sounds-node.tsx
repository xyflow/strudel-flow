import type { CustomControlsProps } from '../../define-node';
import type { DrumSoundsData } from './drum-sounds';
import { DEFAULT_SOUND } from './drum-sounds';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DRUM_CATEGORIES } from '@/data/sounds';
import { CategorySelectItems } from '@/components/nodes/shared/category-select-items';

export function DrumSoundsNode({
  values: data,
  onChange,
}: CustomControlsProps<DrumSoundsData>) {
  const sound = data.sound || DEFAULT_SOUND;

  const handleValueChange = (value: string) => {
    onChange({ sound: value });
  };

  return (
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
  );
}
