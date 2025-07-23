import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import { WorkflowNodeProps, AppNode } from '..';
import WorkflowNode from '@/components/nodes/workflow-node';
import { DRUM_OPTIONS } from '@/data/sound-options';
import { useState, useEffect } from 'react';

// Define the internal state interface for URL persistence
interface DrumSoundsInternalState {
  selectedSound: string;
}

export function DrumSoundsNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: DrumSoundsInternalState }
  )?.internalState;

  // Initialize state with saved values or defaults
  const [selectedSound, setSelectedSound] = useState(
    savedInternalState?.selectedSound || ''
  );

  // State restoration flag to ensure we only restore once
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      console.log(
        `DrumSoundsNode ${id} - Restoring state from saved internal state:`,
        savedInternalState
      );

      setSelectedSound(savedInternalState.selectedSound);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: DrumSoundsInternalState = {
      selectedSound,
    };

    updateNodeData(id, { internalState });
  }, [selectedSound, id, updateNodeData]);

  // Update strudel whenever selection changes
  useEffect(() => {
    updateNode(id, { sound: selectedSound });
  }, [selectedSound, id, updateNode]);

  const handleValueChange = (value: string) => {
    setSelectedSound(value);
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-2 p-3">
        <Select value={selectedSound} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Drum Sound" />
          </SelectTrigger>
          <SelectContent>
            {DRUM_OPTIONS.map((option) => (
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

DrumSoundsNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const sound = useStrudelStore.getState().config[node.id]?.sound;
  if (!sound) return strudelString;

  const soundCall = `sound("${sound}")`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
};
