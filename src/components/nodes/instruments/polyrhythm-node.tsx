import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
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
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md w-80">
        {LAYERS.map(({ soundKey, patternKey, activeKey, defaultSound }) => {
          const sound = (data[soundKey] as string) || defaultSound;
          const activePattern = (data[patternKey] as string) || '';
          const isActive = (data[activeKey] as boolean) || false;

          return (
            <div key={soundKey} className="flex flex-col gap-2">
              <Select
                value={sound}
                onValueChange={(s) => updateNodeData(id, { [soundKey]: s })}
              >
                <SelectTrigger size="sm" className="text-xs">
                  <SelectValue placeholder={defaultSound} />
                </SelectTrigger>
                <SelectContent>
                  <CategorySelectItems categories={DRUM_CATEGORIES} />
                </SelectContent>
              </Select>
              <div className="grid grid-cols-4 gap-1">
                {RHYTHM_PRESETS.map((preset) => {
                  const isSelected =
                    isActive && activePattern === preset.pattern;
                  return (
                    <Button
                      key={preset.id}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs font-bold hover:text-muted-foreground"
                      onClick={() => {
                        if (activePattern === preset.pattern) {
                          updateNodeData(id, { [activeKey]: !isActive });
                        } else {
                          updateNodeData(id, {
                            [patternKey]: preset.pattern,
                            [activeKey]: true,
                          });
                        }
                      }}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
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
      patterns.push(`sound("${sound}").struct("${data[patternKey]}")`);
    }
  }

  if (patterns.length === 0) return strudelString;

  const stackPattern =
    patterns.length === 1 ? patterns[0] : `stack(${patterns.join(', ')})`;
  return strudelString
    ? `${strudelString}.stack(${stackPattern})`
    : stackPattern;
};
