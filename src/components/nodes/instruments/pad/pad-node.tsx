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
  const handleToggleCell = (stepIdx: number, noteIdx: number) => {
    const nextGrid = grid.map((row) => [...row]);
    nextGrid[stepIdx][noteIdx] = !nextGrid[stepIdx][noteIdx];
    onChange({ grid: nextGrid });
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
              const on = grid[stepIdx]?.[noteIdx] || false;
              return (
                <button
                  key={noteIdx}
                  className={`${getButtonClasses(on)} w-12 h-10`}
                  onClick={() => handleToggleCell(stepIdx, noteIdx)}
                  aria-pressed={on}
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
          }}
        />
      </div>
    </div>
  );
}

const getButtonClasses = (isPressed: boolean) => {
  const base =
    'cursor-pointer border border-white/5 transition-[background-color,box-shadow,transform] ease-out duration-150 rounded-md text-xs font-mono select-none active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none';
  return `${base} ${isPressed ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/30'}`;
};
