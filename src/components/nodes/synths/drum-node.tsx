import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DRUM_OPTIONS } from '@/data/sound-options';
import {
  CellState,
  usePadStates,
  DRUM_CLICK_SEQUENCE,
  getNextCellState,
  getCellStateDisplay,
  getCellStateColor,
  generateDrumPattern,
  ModifierContextMenu,
} from './shared';

export function DrumNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);

  // Initialize pad states
  const initialStates = useMemo(() => {
    const states: Record<string, CellState> = {};
    DRUM_OPTIONS.forEach((sound) => {
      states[sound] = { type: 'off' };
    });
    return states;
  }, []);

  const { padStates, setPadStates } = usePadStates(initialStates);

  // Handle pad click - cycle through DRUM_CLICK_SEQUENCE
  const handlePadClick = (sound: string) => {
    setPadStates((prev) => {
      const currentState = prev[sound];
      const nextState = getNextCellState(currentState, DRUM_CLICK_SEQUENCE);
      return {
        ...prev,
        [sound]: nextState,
      };
    });
  };

  // Handle context menu for pad modifiers
  const handleModifierSelect = (sound: string, modifier: CellState) => {
    // Set the modifier
    setPadStates((prev) => ({
      ...prev,
      [sound]: modifier,
    }));
  };

  // Get display text for pad
  const getPadDisplay = (sound: string) => {
    const state = padStates[sound];
    const cellDisplay = getCellStateDisplay(state);

    // For drum pads, show modifier text when modified, otherwise show sound name
    if (cellDisplay && state.type !== 'off' && state.type !== 'normal') {
      return cellDisplay;
    }
    return sound.substring(0, 3);
  };

  // Get pad color based on state
  const getPadColor = (sound: string) => {
    const state = padStates[sound];
    return getCellStateColor(state);
  };

  // Update strudel pattern based on pad states
  useEffect(() => {
    const pattern = generateDrumPattern(padStates, DRUM_OPTIONS);
    updateNode(id, { sound: pattern });
  }, [padStates, id, updateNode]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col p-2 bg-card text-card-foreground rounded-md">
        <div className="grid grid-cols-4 gap-1">
          {DRUM_OPTIONS.map((sound) => (
            <ModifierContextMenu
              key={sound}
              currentState={padStates[sound]}
              onModifierSelect={(modifier) => handleModifierSelect(sound, modifier)}
              label="Drum Modifiers"
            >
              <Button
                className={`w-12 h-11 border transition-all duration-200 shadow-sm text-xs font-mono ${getPadColor(
                  sound
                )} hover:shadow-md active:shadow-inner active:bg-opacity-80`}
                onClick={() => handlePadClick(sound)}
                title={`${sound} - Click to cycle through effects, right-click for direct access`}
              >
                {getPadDisplay(sound)}
              </Button>
            </ModifierContextMenu>
          ))}
        </div>
      </div>
    </WorkflowNode>
  );
}

DrumNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const sound = config?.sound;

  if (!sound) return strudelString;

  const quotedSound = `"${sound}"`;
  return strudelString ? `${strudelString}.sound(${quotedSound})` : `sound(${quotedSound})`;
};
