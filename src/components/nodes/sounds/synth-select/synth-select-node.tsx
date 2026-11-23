import type { CustomControlsProps } from '../../define-node';
import type { VoiceData } from './synth-select';
import { DEFAULT_SOUND } from './synth-select';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
import { SYNTH_CATEGORIES } from '@/data/sounds';
import { cn } from '@/lib/utils';
import { soundMap } from '@strudel/web';
import { useEffect, useState } from 'react';
import { signals } from '@/lib/strudel-calls';
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

export function SynthSelectNode({
  values: data,
  onChange,
}: CustomControlsProps<VoiceData>) {
  const sound = data.sound || DEFAULT_SOUND;
  const [available, setAvailable] = useState<string[]>([]);
  useEffect(() => soundMap.subscribe((sounds) => setAvailable(Object.keys(sounds).sort())), []);
  const tokens = [...sound.matchAll(/[a-zA-Z_][\w-]*/g)];
  const isPattern = tokens.length > 1 || /[^\w-]/.test(sound);

  const handleValueChange = (value: string) => {
    onChange({ sound: value });
  };

  return (
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
      {isPattern && (
        <div className="flex flex-col gap-2">
          <input
            aria-label="Sound pattern"
            className="nodrag nopan w-full rounded border bg-background px-2 py-1 font-mono text-xs"
            value={sound}
            onChange={(event) => handleValueChange(event.target.value)}
          />
          {tokens.map((token, index) => (
            <label key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              Sound {index + 1}
              <select
                aria-label={`Sound ${index + 1}`}
                className="nodrag nopan min-w-0 flex-1 rounded border bg-background p-1 text-foreground"
                value={token[0]}
                onChange={(event) => handleValueChange(sound.slice(0, token.index) + event.target.value + sound.slice(token.index! + token[0].length))}
              >
                {[...new Set([token[0], ...available])].map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}
      {!isPattern && <Select value={sound} onValueChange={handleValueChange}>
        <SelectTrigger
          aria-label="Voice sound"
          className="w-full border-0 bg-muted/50 text-xs"
        >
          <SelectValue placeholder="Choose sound" />
        </SelectTrigger>
        <SelectContent>
          {sound &&
            !waveforms.some((wave) => wave.value === sound) &&
            !SYNTH_CATEGORIES.some((category) =>
              category.options.includes(sound),
            ) && <SelectItem value={sound}>{sound}</SelectItem>}
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
          {(data.signal ? signals : available).filter((name) => !waveforms.some((wave) => wave.value === name) && !SYNTH_CATEGORIES.some((category) => category.options.includes(name)) && name !== sound).map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
        </SelectContent>
      </Select>}
    </div>
  );
}
