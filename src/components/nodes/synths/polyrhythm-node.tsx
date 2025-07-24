import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
// Slider import removed as it's not used
import { StrudelConfig } from '@/types';

// Define the internal state interface for URL persistence
interface PolyrhythmNodeInternalState {
  pattern1: string;
  pattern2: string;
  pattern3: string;
  activePatterns: string[];
}

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
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: PolyrhythmNodeInternalState }
  )?.internalState;

  // Initialize state with saved values or defaults
  const [pattern1, setPattern1] = useState(
    savedInternalState?.pattern1 || 'euclidean(3,8)'
  );
  const [pattern2, setPattern2] = useState(
    savedInternalState?.pattern2 || 'euclidean(4,12)'
  );
  const [pattern3, setPattern3] = useState(
    savedInternalState?.pattern3 || 'euclidean(5,16)'
  );
  const [activePatterns, setActivePatterns] = useState<string[]>(
    savedInternalState?.activePatterns || []
  );

  // Sounds for each pattern
  const [sound1, setSound1] = useState('bd');
  const [sound2, setSound2] = useState('sd');
  const [sound3, setSound3] = useState('hh');

  // State restoration flag to ensure we only restore once
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      console.log(
        `PolyrhythmNode ${id} - Restoring state from saved internal state:`,
        savedInternalState
      );

      setPattern1(savedInternalState.pattern1);
      setPattern2(savedInternalState.pattern2);
      setPattern3(savedInternalState.pattern3);
      setActivePatterns(savedInternalState.activePatterns);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: PolyrhythmNodeInternalState = {
      pattern1,
      pattern2,
      pattern3,
      activePatterns,
    };

    updateNodeData(id, { internalState });
  }, [pattern1, pattern2, pattern3, activePatterns, id, updateNodeData]);

  // Update strudel whenever patterns change
  useEffect(() => {
    const config: Partial<StrudelConfig> = {
      polyPattern1: pattern1,
      polyPattern2: pattern2,
      polyPattern3: pattern3,
      polySound1: sound1,
      polySound2: sound2,
      polySound3: sound3,
      activePolyPatterns: activePatterns.join(','),
    };

    updateNode(id, config);
  }, [
    pattern1,
    pattern2,
    pattern3,
    sound1,
    sound2,
    sound3,
    activePatterns,
    id,
    updateNode,
  ]);

  const handlePresetClick = (
    presetId: string,
    preset: (typeof RHYTHM_PRESETS)[0],
    patternNumber: 1 | 2 | 3
  ) => {
    // Set the pattern
    if (patternNumber === 1) setPattern1(preset.pattern);
    if (patternNumber === 2) setPattern2(preset.pattern);
    if (patternNumber === 3) setPattern3(preset.pattern);

    // Activate the layer when a pattern is selected
    const patternId = `pattern${patternNumber}`;
    if (!activePatterns.includes(patternId)) {
      setActivePatterns((prev) => [...prev, patternId]);
    }
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        {/* Pattern 1 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <select
              value={sound1}
              onChange={(e) => setSound1(e.target.value)}
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
                key={`1-${preset.id}`}
                variant={
                  pattern1.includes(preset.pattern.split('(')[1].split(')')[0])
                    ? 'default'
                    : 'outline'
                }
                className="h-8 text-xs font-bold"
                onClick={() => handlePresetClick(preset.id, preset, 1)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Pattern 2 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <select
              value={sound2}
              onChange={(e) => setSound2(e.target.value)}
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
                key={`2-${preset.id}`}
                variant={
                  pattern2.includes(preset.pattern.split('(')[1].split(')')[0])
                    ? 'default'
                    : 'outline'
                }
                className="h-8 text-xs font-bold"
                onClick={() => handlePresetClick(preset.id, preset, 2)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Pattern 3 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <select
              value={sound3}
              onChange={(e) => setSound3(e.target.value)}
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
                key={`3-${preset.id}`}
                variant={
                  pattern3.includes(preset.pattern.split('(')[1].split(')')[0])
                    ? 'default'
                    : 'outline'
                }
                className="h-8 text-xs font-bold"
                onClick={() => handlePresetClick(preset.id, preset, 3)}
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
