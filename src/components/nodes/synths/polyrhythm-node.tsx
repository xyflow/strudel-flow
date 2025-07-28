import { useMemo } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';

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

const SOUND_PRESETS = ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'kick', 'snare'];

export function PolyrhythmNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Get current config from strudel store with optimized selectors
  const polyPattern1 = useStrudelStore(
    (state) => state.config[id]?.polyPattern1 || ''
  );
  const polyPattern2 = useStrudelStore(
    (state) => state.config[id]?.polyPattern2 || ''
  );
  const polyPattern3 = useStrudelStore(
    (state) => state.config[id]?.polyPattern3 || ''
  );
  const polySound1 = useStrudelStore(
    (state) => state.config[id]?.polySound1 || 'bd'
  );
  const polySound2 = useStrudelStore(
    (state) => state.config[id]?.polySound2 || 'sd'
  );
  const polySound3 = useStrudelStore(
    (state) => state.config[id]?.polySound3 || 'hh'
  );
  const activePolyPatterns = useStrudelStore(
    (state) => state.config[id]?.activePolyPatterns || ''
  );

  // Memoize active patterns array to prevent unnecessary recalculations
  const activePatterns = useMemo(
    () => activePolyPatterns.split(',').filter(Boolean),
    [activePolyPatterns]
  );

  const handlePresetClick = useMemo(() => {
    return (preset: (typeof RHYTHM_PRESETS)[0], patternNumber: 1 | 2 | 3) => {
      const patternKey = `polyPattern${patternNumber}`;
      const soundKey = `polySound${patternNumber}`;
      const patternId = `pattern${patternNumber}`;

      // Update the pattern
      const updates: Record<string, string> = {
        [patternKey]: preset.pattern,
        [soundKey]:
          patternNumber === 1
            ? polySound1
            : patternNumber === 2
            ? polySound2
            : polySound3,
      };

      // Activate the layer if not already active
      if (!activePatterns.includes(patternId)) {
        updates.activePolyPatterns = [...activePatterns, patternId].join(',');
      }

      updateNode(id, updates);
    };
  }, [updateNode, id, polySound1, polySound2, polySound3, activePatterns]);

  const handleSoundChange = useMemo(() => {
    return (patternNumber: 1 | 2 | 3, sound: string) => {
      const soundKey = `polySound${patternNumber}`;
      updateNode(id, { [soundKey]: sound });
    };
  }, [updateNode, id]);

  const renderPatternLayer = useMemo(() => {
    return (patternNumber: 1 | 2 | 3) => {
      const currentPattern =
        patternNumber === 1
          ? polyPattern1
          : patternNumber === 2
          ? polyPattern2
          : polyPattern3;
      const currentSound =
        patternNumber === 1
          ? polySound1
          : patternNumber === 2
          ? polySound2
          : polySound3;

      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <select
              value={currentSound}
              onChange={(e) => handleSoundChange(patternNumber, e.target.value)}
              className="px-2 py-1 text-xs border rounded bg-transparent"
            >
              {SOUND_PRESETS.map((sound) => (
                <option key={sound} value={sound}>
                  {sound}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {RHYTHM_PRESETS.map((preset) => (
              <Button
                key={`${patternNumber}-${preset.id}`}
                variant={
                  currentPattern.includes(
                    preset.pattern.split('(')[1].split(')')[0]
                  )
                    ? 'default'
                    : 'outline'
                }
                className="h-8 text-xs font-bold"
                onClick={() => handlePresetClick(preset, patternNumber)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      );
    };
  }, [
    polyPattern1,
    polyPattern2,
    polyPattern3,
    polySound1,
    polySound2,
    polySound3,
    handlePresetClick,
    handleSoundChange,
  ]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        {renderPatternLayer(1)}
        {renderPatternLayer(2)}
        {renderPatternLayer(3)}
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
