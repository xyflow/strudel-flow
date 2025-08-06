import { useCallback } from 'react';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import { useStrudelStore } from '@/store/strudel-store';
import { PresetGroup } from '@/components/preset-group';
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

  // Use node data directly with defaults
  const polyPattern1 = data.polyPattern1 || '';
  const polyPattern2 = data.polyPattern2 || '';
  const polyPattern3 = data.polyPattern3 || '';
  const polySound1 = data.polySound1 || 'bd';
  const polySound2 = data.polySound2 || 'sd';
  const polySound3 = data.polySound3 || 'hh';
  const activePolyPatterns = data.activePolyPatterns || '';

  const handlePresetClick = useCallback(
    (
      preset: { id: string; pattern: string; label: string },
      patternNumber: 1 | 2 | 3
    ) => {
      const patternId = `pattern${patternNumber}`;
      const key = `polyPattern${patternNumber}` as keyof typeof data;

      const newActivePatterns = activePolyPatterns.includes(patternId)
        ? activePolyPatterns
        : [...activePolyPatterns.split(','), patternId]
            .filter(Boolean)
            .join(',');

      updateNodeData(id, {
        [key]: preset.pattern,
        activePolyPatterns: newActivePatterns,
      });
    },
    [id, updateNodeData, activePolyPatterns]
  );

  const handleSoundChange = useCallback(
    (patternNumber: 1 | 2 | 3, sound: string) => {
      const key = `polySound${patternNumber}` as keyof typeof data;
      updateNodeData(id, { [key]: sound });
    },
    [id, updateNodeData]
  );

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md w-80">
        <div className="flex flex-col gap-2">
          <select
            value={polySound1}
            onChange={(e) => handleSoundChange(1, e.target.value)}
            className="px-2 py-1 text-xs border rounded bg-transparent"
          >
            {DRUM_OPTIONS.map((sound) => (
              <option key={sound} value={sound}>
                {sound}
              </option>
            ))}
          </select>
          <PresetGroup
            presets={RHYTHM_PRESETS}
            selectedValue={polyPattern1}
            onSelect={(id) =>
              handlePresetClick(
                { id: id as string, pattern: id as string, label: '' },
                1
              )
            }
            idKey="pattern"
            buttonClassName="font-bold"
          />
        </div>
        <div className="flex flex-col gap-2">
          <select
            value={polySound2}
            onChange={(e) => handleSoundChange(2, e.target.value)}
            className="px-2 py-1 text-xs border rounded bg-transparent"
          >
            {DRUM_OPTIONS.map((sound) => (
              <option key={sound} value={sound}>
                {sound}
              </option>
            ))}
          </select>
          <PresetGroup
            presets={RHYTHM_PRESETS}
            selectedValue={polyPattern2}
            onSelect={(id) =>
              handlePresetClick(
                { id: id as string, pattern: id as string, label: '' },
                2
              )
            }
            idKey="pattern"
            buttonClassName="font-bold"
          />
        </div>
        <div className="flex flex-col gap-2">
          <select
            value={polySound3}
            onChange={(e) => handleSoundChange(3, e.target.value)}
            className="px-2 py-1 text-xs border rounded bg-transparent"
          >
            {DRUM_OPTIONS.map((sound) => (
              <option key={sound} value={sound}>
                {sound}
              </option>
            ))}
          </select>
          <PresetGroup
            presets={RHYTHM_PRESETS}
            selectedValue={polyPattern3}
            onSelect={(id) =>
              handlePresetClick(
                { id: id as string, pattern: id as string, label: '' },
                3
              )
            }
            idKey="pattern"
            buttonClassName="font-bold"
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

PolyrhythmNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const activePatterns = config?.activePolyPatterns?.split(',') || [];

  if (activePatterns.length === 0) return strudelString;

  const patterns = [];

  if (
    activePatterns.includes('pattern1') &&
    config?.polyPattern1 &&
    config?.polySound1
  ) {
    patterns.push(
      `sound("${config.polySound1}").struct("${config.polyPattern1}")`
    );
  }
  if (
    activePatterns.includes('pattern2') &&
    config?.polyPattern2 &&
    config?.polySound2
  ) {
    patterns.push(
      `sound("${config.polySound2}").struct("${config.polyPattern2}")`
    );
  }
  if (
    activePatterns.includes('pattern3') &&
    config?.polyPattern3 &&
    config?.polySound3
  ) {
    patterns.push(
      `sound("${config.polySound3}").struct("${config.polyPattern3}")`
    );
  }

  if (patterns.length === 0) return strudelString;

  const stackPattern =
    patterns.length === 1 ? patterns[0] : `stack(${patterns.join(', ')})`;
  return strudelString
    ? `${strudelString}.stack(${stackPattern})`
    : stackPattern;
};
