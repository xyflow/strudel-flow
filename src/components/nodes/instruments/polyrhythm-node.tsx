import React, { useCallback } from 'react';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DRUM_OPTIONS } from '@/data/sound-options';

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

export function PolyrhythmNode({ id, data, type }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const polyPattern1 = data.polyPattern1 || '';
  const polyPattern2 = data.polyPattern2 || '';
  const polyPattern3 = data.polyPattern3 || '';
  const polySound1 = data.polySound1 || 'bd';
  const polySound2 = data.polySound2 || 'sd';
  const polySound3 = data.polySound3 || 'hh';
  const pattern1Active = data.pattern1Active || false;
  const pattern2Active = data.pattern2Active || false;
  const pattern3Active = data.pattern3Active || false;

  // Initialize default sounds if not set
  React.useEffect(() => {
    if (!data.polySound1 || !data.polySound2 || !data.polySound3) {
      updateNodeData(id, {
        polySound1: data.polySound1 || 'bd',
        polySound2: data.polySound2 || 'sd',
        polySound3: data.polySound3 || 'hh',
      });
    }
  }, [id, updateNodeData, data.polySound1, data.polySound2, data.polySound3]);

  const handlePresetClick = useCallback(
    (
      preset: { id: string; pattern: string; label: string },
      patternNumber: 1 | 2 | 3
    ) => {
      const patternKey = `polyPattern${patternNumber}`;
      const activeKey = `pattern${patternNumber}Active`;
      const currentPattern = data[patternKey as keyof typeof data];
      const currentActive = data[activeKey as keyof typeof data];

      if (currentPattern === preset.pattern) {
        updateNodeData(id, {
          [activeKey]: !currentActive,
        });
      } else {
        updateNodeData(id, {
          [patternKey]: preset.pattern,
          [activeKey]: true,
        });
      }
    },
    [id, updateNodeData, data]
  );

  const handleSoundChange = useCallback(
    (patternNumber: 1 | 2 | 3, sound: string) => {
      const key = `polySound${patternNumber}`;
      updateNodeData(id, { [key]: sound });
    },
    [id, updateNodeData]
  );

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md w-80">
        <div className="flex flex-col gap-2">
          <Select
            value={polySound1}
            onValueChange={(sound) => handleSoundChange(1, sound)}
          >
            <SelectTrigger size="sm" className="text-xs">
              <SelectValue placeholder="bd" />
            </SelectTrigger>
            <SelectContent>
              {DRUM_OPTIONS.map((sound) => (
                <SelectItem key={sound} value={sound}>
                  {sound}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-4 gap-1">
            {RHYTHM_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant={
                  pattern1Active && polyPattern1 === preset.pattern
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                className="h-8 text-xs font-bold hover:text-muted-foreground"
                onClick={() => handlePresetClick(preset, 1)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Select
            value={polySound2}
            onValueChange={(sound) => handleSoundChange(2, sound)}
          >
            <SelectTrigger size="sm" className="text-xs">
              <SelectValue placeholder="sd" />
            </SelectTrigger>
            <SelectContent>
              {DRUM_OPTIONS.map((sound) => (
                <SelectItem key={sound} value={sound}>
                  {sound}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-4 gap-1">
            {RHYTHM_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant={
                  pattern2Active && polyPattern2 === preset.pattern
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                className="h-8 text-xs font-bold"
                onClick={() => handlePresetClick(preset, 2)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Select
            value={polySound3}
            onValueChange={(sound) => handleSoundChange(3, sound)}
          >
            <SelectTrigger size="sm" className="text-xs">
              <SelectValue placeholder="hh" />
            </SelectTrigger>
            <SelectContent>
              {DRUM_OPTIONS.map((sound) => (
                <SelectItem key={sound} value={sound}>
                  {sound}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-4 gap-1">
            {RHYTHM_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant={
                  pattern3Active && polyPattern3 === preset.pattern
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                className="h-8 text-xs font-bold"
                onClick={() => handlePresetClick(preset, 3)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

PolyrhythmNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const data = node.data;
  const patterns = [];

  // Use default sounds if not set
  const sound1 = data.polySound1 || 'bd';
  const sound2 = data.polySound2 || 'sd';
  const sound3 = data.polySound3 || 'hh';

  // Only add patterns that are both active AND have a pattern set
  if (data.pattern1Active === true && data.polyPattern1) {
    patterns.push(`sound("${sound1}").struct("${data.polyPattern1}")`);
  }
  if (data.pattern2Active === true && data.polyPattern2) {
    patterns.push(`sound("${sound2}").struct("${data.polyPattern2}")`);
  }
  if (data.pattern3Active === true && data.polyPattern3) {
    patterns.push(`sound("${sound3}").struct("${data.polyPattern3}")`);
  }

  // If no active patterns, return the input string unchanged
  if (patterns.length === 0) return strudelString;

  const stackPattern =
    patterns.length === 1 ? patterns[0] : `stack(${patterns.join(', ')})`;
  return strudelString
    ? `${strudelString}.stack(${stackPattern})`
    : stackPattern;
};
