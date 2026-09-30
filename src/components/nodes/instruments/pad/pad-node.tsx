import type { CustomControlsProps } from '../../define-node';
import type { PadData } from './pad';
import { NOTES, DEFAULTS, createDefaultGrid } from './pad';
import { useState, useEffect } from 'react';
import { getSchedulerNow } from '@/lib/strudel-clock';

import { CellState, ModifierDropdown } from '../../shared/modifiers';
import { AccordionControls } from '@/components/nodes/shared/accordion-controls';

export function PadNode({
  values: data,
  onChange,
  isPlaying,
  isMuted,
}: CustomControlsProps<PadData>) {
  const [activeStep, setActiveStep] = useState(-1);

  const steps = data.steps || DEFAULTS.steps;

  useEffect(() => {
    if (!isPlaying || isMuted) {
      setActiveStep(-1);
      return;
    }
    let rafId: number;
    const tick = () => {
      const now = getSchedulerNow();
      setActiveStep(now > 0 ? Math.floor((now % 1) * steps) : -1);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [steps, isPlaying, isMuted]);

  const mode = data.mode || DEFAULTS.mode;
  const octave = data.octave || DEFAULTS.octave;
  const selectedKey = data.selectedKey || DEFAULTS.selectedKey;
  const selectedScaleType =
    data.selectedScaleType || DEFAULTS.selectedScaleType;
  const grid = data.grid || createDefaultGrid();
  const columnModifiers = data.columnModifiers || {};
  const selectedButtons = new Set(data.selectedButtons || []);
  const noteGroups = data.noteGroups || {};

  const handleToggleCell = (
    stepIdx: number,
    noteIdx: number,
    event: React.MouseEvent,
  ) => {
    if (event.shiftKey) {
      const key = `${stepIdx}-${noteIdx}`;
      const selected = new Set(selectedButtons);
      if (selected.has(key)) selected.delete(key);
      else selected.add(key);
      const notes = [...selected]
        .filter((key) => key.startsWith(`${stepIdx}-`))
        .map((key) => Number(key.split('-')[1]))
        .sort((a, b) => a - b);
      if (notes.length < 2) {
        onChange({ selectedButtons: [...selected] });
        return;
      }
      const groups = noteGroups[stepIdx] || [];
      const exists = groups.some(
        (group) =>
          group.length === notes.length &&
          group.every((note, i) => note === notes[i]),
      );
      onChange({
        noteGroups: {
          ...noteGroups,
          [stepIdx]: exists ? groups : [...groups, notes],
        },
        selectedButtons: [...selected].filter(
          (key) => !key.startsWith(`${stepIdx}-`),
        ),
      });
      return;
    }

    const nextGrid = grid.map((row) => [...row]);
    const wasOn = nextGrid[stepIdx][noteIdx];
    nextGrid[stepIdx][noteIdx] = !wasOn;
    const groups = noteGroups[stepIdx] || [];
    const groupIndex = groups.findIndex((group) => group.includes(noteIdx));
    if (wasOn && groupIndex >= 0) {
      const nextGroups = { ...noteGroups };
      nextGroups[stepIdx] = groups
        .map((group, index) =>
          index === groupIndex
            ? group.filter((note) => note !== noteIdx)
            : group,
        )
        .filter((group) => group.length >= 2);
      if (!nextGroups[stepIdx].length) delete nextGroups[stepIdx];
      onChange({ grid: nextGrid, noteGroups: nextGroups });
    } else {
      onChange({ grid: nextGrid });
    }
  };

  const handleColumnModifierSelect = (stepIdx: number, modifier: CellState) => {
    const newColumnModifiers = { ...columnModifiers };
    if (modifier.type === 'off') {
      delete newColumnModifiers[stepIdx];
    } else {
      newColumnModifiers[stepIdx] = modifier;
    }
    onChange({ columnModifiers: newColumnModifiers });
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-card text-card-foreground rounded-lg w-full max-w-full overflow-hidden">
      <div className="flex gap-1 w-full nodrag">
        {Array.from({ length: steps }, (_, stepIdx) => (
          <div key={stepIdx} className="flex flex-col gap-1 items-center">
            <div
              className={`w-1.5 h-1.5 rounded-full mb-0.5 transition-colors duration-75 ${
                stepIdx === activeStep ? 'bg-primary' : 'bg-card-foreground/20'
              }`}
            />
            {NOTES.map((_, noteIdx) => {
              const groupIndex = (noteGroups[stepIdx] || []).findIndex(
                (group) => group.includes(noteIdx),
              );
              const on = grid[stepIdx]?.[noteIdx] || false;
              return (
                <button
                  key={noteIdx}
                  className={`${getButtonClasses(selectedButtons.has(`${stepIdx}-${noteIdx}`), groupIndex >= 0, groupIndex, on)} w-12 h-10`}
                  onClick={(event) => handleToggleCell(stepIdx, noteIdx, event)}
                  aria-pressed={on || groupIndex >= 0}
                  title={`Note ${noteIdx + 1}, Step ${stepIdx + 1}`}
                />
              );
            })}
            <ModifierDropdown
              currentState={columnModifiers[stepIdx] || { type: 'off' }}
              onModifierSelect={(modifier) =>
                handleColumnModifierSelect(stepIdx, modifier)
              }
            />
          </div>
        ))}
      </div>
      <div className="w-full max-w-full overflow-hidden">
        <AccordionControls
          keyScaleOctaveProps={{
            selectedKey,
            onKeyChange: (key) => onChange({ selectedKey: key }),
            selectedScale: selectedScaleType,
            onScaleChange: (scale) => onChange({ selectedScaleType: scale }),
            octave,
            onOctaveChange: (oct) => onChange({ octave: oct }),
          }}
          padControlsProps={{
            steps,
            onStepsChange: (s) => onChange({ steps: s }),
            mode,
            onModeChange: (m) => onChange({ mode: m }),
            noteGroups,
            onClearGroups: () => onChange({ noteGroups: {} }),
            selectedButtons,
            onClearSelection: () => onChange({ selectedButtons: [] }),
          }}
        />
      </div>
    </div>
  );
}

const getButtonClasses = (
  isSelected: boolean,
  isInGroup: boolean,
  groupIndex: number,
  isPressed: boolean,
) => {
  const base =
    'cursor-pointer border border-white/5  transition-[background-color,box-shadow,transform] ease-out duration-150 rounded-md text-xs font-mono select-none active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none';
  if (isSelected) return `${base} bg-accent-foreground`;
  if (isInGroup) {
    const groupColors = [
      'bg-chart-5',
      'bg-chart-2',
      'bg-chart-3',
      'bg-chart-4',
    ];
    return `${base} ${groupColors[groupIndex % groupColors.length]}`;
  }
  if (isPressed) return `${base} bg-primary `;
  return `${base} bg-muted hover:bg-muted-foreground/30`;
};
