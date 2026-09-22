import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DRUM_CATEGORIES } from '@/data/sounds';
import { CategorySelectItems } from '@/components/category-select-items';

const RHYTHM_PRESETS = [
  { id: '3:2', label: '3:2', pattern: 'euclidean(3,8)' },
  { id: '4:3', label: '4:3', pattern: 'euclidean(4,12)' },
  { id: '5:4', label: '5:4', pattern: 'euclidean(5,16)' },
  { id: '7:5', label: '7:5', pattern: 'euclidean(7,20)' },
  { id: '3:4', label: '3:4', pattern: 'euclidean(3,16)' },
  { id: '5:3', label: '5:3', pattern: 'euclidean(5,12)' },
  { id: '2:3', label: '2:3', pattern: 'euclidean(2,12)' },
  { id: '4:5', label: '4:5', pattern: 'euclidean(4,20)' },
];

const LAYERS = [
  {
    num: 1,
    soundKey: 'polySound1',
    patternKey: 'polyPattern1',
    activeKey: 'pattern1Active',
    defaultSound: 'bd',
  },
  {
    num: 2,
    soundKey: 'polySound2',
    patternKey: 'polyPattern2',
    activeKey: 'pattern2Active',
    defaultSound: 'sd',
  },
  {
    num: 3,
    soundKey: 'polySound3',
    patternKey: 'polyPattern3',
    activeKey: 'pattern3Active',
    defaultSound: 'hh',
  },
] as const;

export function PolyrhythmNode({ id, data, type }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex gap-3 px-4 pt-1 pb-4">
        {LAYERS.map(
          ({ num, soundKey, patternKey, activeKey, defaultSound }) => {
            const pattern = data[patternKey] || RHYTHM_PRESETS[0].pattern;
            const active = data[activeKey] ?? false;
            const match = pattern.match(/euclidean\((\d+),(\d+)\)/);
            const pulses = Number(match?.[1] ?? 3),
              steps = Number(match?.[2] ?? 8);
            return (
              <div
                key={soundKey}
                className="flex w-24 flex-col items-center gap-3"
              >
                <button
                  aria-label={`${active ? 'Mute' : 'Enable'} rhythm ${num}`}
                  aria-pressed={active}
                  onClick={() =>
                    updateNodeData(id, {
                      [activeKey]: !active,
                      [patternKey]: pattern,
                    })
                  }
                  className="nodrag rounded-full transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <svg
                    width="96"
                    height="96"
                    viewBox="0 0 96 96"
                    aria-hidden="true"
                  >
                    <circle
                      cx="48"
                      cy="48"
                      r="31"
                      className="fill-background/40 stroke-border"
                    />
                    {Array.from({ length: steps }, (_, i) => {
                      const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
                      const hit = (i * pulses) % steps < pulses;
                      return (
                        <circle
                          key={i}
                          cx={48 + Math.cos(angle) * 36}
                          cy={48 + Math.sin(angle) * 36}
                          r={3}
                          className={
                            active && hit
                              ? 'fill-primary'
                              : hit
                                ? 'fill-muted-foreground'
                                : 'fill-muted'
                          }
                        />
                      );
                    })}
                    <text
                      x="48"
                      y="52"
                      textAnchor="middle"
                      className={
                        active
                          ? 'fill-primary text-xs font-mono'
                          : 'fill-muted-foreground text-xs font-mono'
                      }
                    >
                      {pulses}/{steps}
                    </text>
                  </svg>
                </button>
                <Select
                  value={data[soundKey] || defaultSound}
                  onValueChange={(value) =>
                    updateNodeData(id, { [soundKey]: value })
                  }
                >
                  <SelectTrigger
                    aria-label={`Sound for rhythm ${num}`}
                    className="h-8 w-full text-[10px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <CategorySelectItems categories={DRUM_CATEGORIES} />
                  </SelectContent>
                </Select>
                <Select
                  value={pattern}
                  onValueChange={(value) =>
                    updateNodeData(id, {
                      [patternKey]: value,
                      [activeKey]: true,
                    })
                  }
                >
                  <SelectTrigger
                    aria-label={`Pattern for rhythm ${num}`}
                    className="h-8 w-full text-[10px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RHYTHM_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.pattern}>
                        {preset.pattern
                          .replace('euclidean(', '')
                          .replace(')', '')
                          .replace(',', ' / ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          },
        )}
      </div>
    </WorkflowNode>
  );
}

PolyrhythmNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const { data } = node;
  const patterns: string[] = [];

  for (const { soundKey, patternKey, activeKey, defaultSound } of LAYERS) {
    if (data[activeKey] && data[patternKey]) {
      const sound = (data[soundKey] as string) || defaultSound;
      const rhythm = data[patternKey]?.match(/^euclidean\((\d+),(\d+)\)$/);
      patterns.push(
        rhythm
          ? `sound(${JSON.stringify(sound)}).euclid(${rhythm[1]},${rhythm[2]})`
          : `sound(${JSON.stringify(sound)}).struct(${JSON.stringify(data[patternKey])})`,
      );
    }
  }

  if (patterns.length === 0) return strudelString;

  const stackPattern =
    patterns.length === 1 ? patterns[0] : `stack(${patterns.join(', ')})`;
  return strudelString
    ? `${strudelString}.stack(${stackPattern})`
    : stackPattern;
};
