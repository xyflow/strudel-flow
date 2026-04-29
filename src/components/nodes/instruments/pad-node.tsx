import { useAppStore } from '@/store/app-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';

import { CellState, ModifierDropdown } from './pad-utils/modifiers';
import { toggleCell, isButtonSelected } from './pad-utils/button-utils';
import { PadButton } from './pad-utils/pad-button';
import { AccordionControls } from '@/components/accordion-controls';

const NOTES = ['0', '1', '2', '3', '4', '5', '6', '7'];

function applyColumnModifier(pattern: string, modifier: CellState): string {
  return modifier.type === 'modifier' ? `${pattern}${modifier.value}` : pattern;
}

export function PadNode({ id, data, type }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const steps = data.steps || 5;
  const mode = data.mode || 'arp';
  const octave = data.octave || 3;
  const selectedKey = data.selectedKey || 'C';
  const selectedScaleType = data.selectedScaleType || 'major';
  const grid = data.grid || Array(16).fill(null).map(() => Array(8).fill(false));
  const columnModifiers = data.columnModifiers || {};
  const selectedButtons = new Set(data.selectedButtons || []);
  const noteGroups = data.noteGroups || {};

  const handleToggleCell = (stepIdx: number, noteIdx: number, event?: React.MouseEvent) =>
    toggleCell(
      stepIdx, noteIdx, grid, noteGroups, selectedButtons, updateNodeData,
      (groups) => updateNodeData(id, { noteGroups: groups }),
      (buttons) => updateNodeData(id, { selectedButtons: Array.from(buttons) }),
      id, event
    );

  const handleColumnModifierSelect = (stepIdx: number, modifier: CellState) => {
    const newColumnModifiers = { ...columnModifiers };
    if (modifier.type === 'off') {
      delete newColumnModifiers[stepIdx];
    } else {
      newColumnModifiers[stepIdx] = modifier;
    }
    updateNodeData(id, { columnModifiers: newColumnModifiers });
  };

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-2 p-3 bg-card text-card-foreground rounded-md w-full max-w-full overflow-hidden">
        <div className="flex gap-1 w-full nodrag">
          {Array.from({ length: steps }, (_, stepIdx) => (
            <div key={stepIdx} className="flex flex-col gap-1 items-center">
              {NOTES.map((_, noteIdx) => (
                <PadButton
                  key={`${stepIdx}-${noteIdx}`}
                  stepIdx={stepIdx}
                  noteIdx={noteIdx}
                  on={grid[stepIdx]?.[noteIdx] || false}
                  isSelected={isButtonSelected(stepIdx, noteIdx, selectedButtons)}
                  noteGroups={noteGroups}
                  toggleCell={handleToggleCell}
                />
              ))}
              <ModifierDropdown
                currentState={columnModifiers[stepIdx] || { type: 'off' }}
                onModifierSelect={(modifier) => handleColumnModifierSelect(stepIdx, modifier)}
              />
            </div>
          ))}
        </div>
        <div className="w-full max-w-full overflow-hidden">
          <AccordionControls
            keyScaleOctaveProps={{
              selectedKey,
              onKeyChange: (key) => updateNodeData(id, { selectedKey: key }),
              selectedScale: selectedScaleType,
              onScaleChange: (scale) => updateNodeData(id, { selectedScaleType: scale }),
              octave,
              onOctaveChange: (oct) => updateNodeData(id, { octave: oct }),
            }}
            padControlsProps={{
              steps,
              onStepsChange: (s) => updateNodeData(id, { steps: s }),
              mode,
              onModeChange: (m) => updateNodeData(id, { mode: m }),
              noteGroups,
              onClearGroups: () => updateNodeData(id, { noteGroups: {} }),
              selectedButtons,
              onClearSelection: () => updateNodeData(id, { selectedButtons: [] }),
            }}
          />
        </div>
      </div>
    </WorkflowNode>
  );
}

PadNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const { data } = node;
  const grid = data.grid || Array(16).fill(null).map(() => Array(8).fill(false));
  const columnModifiers = data.columnModifiers || {};
  const noteGroups = data.noteGroups || {};

  const generateStepPattern = (row: boolean[], stepIdx: number) => {
    const individualNotes = row
      .map((on, noteIdx) => (on ? NOTES[noteIdx] : null))
      .filter(Boolean);

    const stepGroups = noteGroups[stepIdx] || [];
    const groupPatterns = stepGroups.map(
      (group) => `<${group.map((noteIdx) => NOTES[noteIdx]).join(' ')}>`
    );

    const allPatterns = [...individualNotes, ...groupPatterns];
    if (allPatterns.length === 0) return '';

    const separator = (data.mode || 'arp') === 'arp' ? ' ' : ', ';
    const stepPattern = `[${allPatterns.join(separator)}]`;

    const columnModifier = columnModifiers[stepIdx];
    if (columnModifier && columnModifier.type !== 'off') {
      return applyColumnModifier(stepPattern, columnModifier);
    }

    return stepPattern;
  };

  const stepPatterns = grid.map(generateStepPattern).filter(Boolean);
  const pattern = stepPatterns.join(' ');

  if (!pattern || !pattern.trim() || /^[~\s]*$/.test(pattern.trim())) {
    return strudelString;
  }

  const octavePart = data.octave ? data.octave : '';
  const scale = `${data.selectedKey || 'C'}${octavePart}:${data.selectedScaleType || 'major'}`;

  return strudelString
    ? `${strudelString}.n("${pattern}").scale("${scale}")`
    : `n("${pattern}").scale("${scale}")`;
};
