import {
  chordProgression,
  chordNotes,
  chordLabels,
  PRESETS,
  DEFAULTS,
} from './chord';
import { useRef, useState } from 'react';
import WorkflowNode from '@/components/nodes/shared/workflow-node';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import { useAppStore } from '@/store/app-store';
import { AccordionControls } from '@/components/nodes/shared/accordion-controls';
function NoteShape({ notes }: { notes: number[] }) {
  return (
    <svg viewBox="0 0 48 40" className="h-10 w-full" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((line) => (
        <path
          key={line}
          d={`M4 ${6 + line * 7}H44`}
          stroke="currentColor"
          opacity=".12"
        />
      ))}
      {notes.map((note, index) => (
        <rect
          key={index}
          x={5 + (index * 28) / Math.max(1, notes.length - 1)}
          y={32 - (note / Math.max(13, ...notes)) * 26}
          width="15"
          height="4"
          rx="2"
          className="fill-primary"
        />
      ))}
    </svg>
  );
}

// Drag state stays local to the chart; the patch updates only when a note is dropped.
function ChordEditor({
  notes,
  noteSlots,
  noteName,
  noteLabel,
  onChange,
}: {
  notes: number[];
  noteSlots: number;
  noteName: (note: number) => string;
  noteLabel: (note: number) => string;
  onChange: (notes: number[]) => void;
}) {
  const [dragPreview, setDragPreview] = useState<{
    from: number;
    target: number;
    position: number;
  } | null>(null);
  const drag = useRef<{
    pointer: number;
    startX: number;
    degree: number;
    target: number;
    moved: boolean;
    notes: number[];
    slots: number;
  } | null>(null);
  const toggleNote = (note: number) =>
    onChange(
      notes.includes(note)
        ? notes.filter((value) => value !== note)
        : [...notes, note].sort((a, b) => a - b),
    );
  const moveNote = (notes: number[], from: number, to: number) =>
    [...new Set([...notes.filter((note) => note !== from), to])].sort(
      (a, b) => a - b,
    );

  const cancelDrag = () => {
    drag.current = null;
    setDragPreview(null);
  };
  return (
    <div className="overflow-hidden rounded-xl border bg-muted/25 p-3">
      <div
        role="group"
        aria-label="Edit chord notes"
        className="nodrag nopan relative grid h-28 touch-none select-none gap-px"
        style={{ gridTemplateColumns: `repeat(${noteSlots}, minmax(0, 1fr))` }}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          const button = (
            event.target as HTMLElement
          ).closest<HTMLButtonElement>('button[data-degree]');
          if (!button) return;
          event.preventDefault();
          button.focus();
          const degree = Number(button.dataset.degree);
          drag.current = {
            pointer: event.pointerId,
            startX: event.clientX,
            degree,
            target: degree,
            moved: false,
            notes: [...notes],
            slots: noteSlots,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current || current.pointer !== event.pointerId) return;
          if (!current.moved && Math.abs(event.clientX - current.startX) < 4)
            return;
          current.moved = true;
          const bounds = event.currentTarget.getBoundingClientRect();
          const position = Math.max(
            0,
            Math.min(
              current.slots - 1,
              current.degree +
                ((event.clientX - current.startX) / bounds.width) *
                  current.slots,
            ),
          );
          current.target = Math.round(position);
          setDragPreview({
            from: current.degree,
            target: current.target,
            position: ((position + 0.5) / current.slots) * 100,
          });
        }}
        onPointerUp={(event) => {
          const current = drag.current;
          if (!current || current.pointer !== event.pointerId) return;
          drag.current = null;
          setDragPreview(null);
          if (current.moved)
            onChange(moveNote(current.notes, current.degree, current.target));
          else toggleNote(current.degree);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={cancelDrag}
        onLostPointerCapture={cancelDrag}
      >
        {Array.from({ length: noteSlots }, (_, note) => {
          const selected = notes.includes(note);
          return (
            <button
              key={note}
              data-degree={note}
              aria-label={`Scale degree ${note}: ${noteLabel(note)}`}
              aria-pressed={selected}
              title={`${note}: ${noteName(note)} · Click to ${selected ? 'remove' : 'add'}${selected ? ', drag to move' : ''}`}
              onClick={(event) => {
                if (event.detail === 0) toggleNote(note);
              }}
              onKeyDown={(event) => {
                if (
                  !notes.includes(note) ||
                  !['ArrowLeft', 'ArrowRight'].includes(event.key)
                )
                  return;
                event.preventDefault();
                const target = Math.max(
                  0,
                  Math.min(
                    noteSlots - 1,
                    note + (event.key === 'ArrowRight' ? 1 : -1),
                  ),
                );
                onChange(moveNote(notes, note, target));
                event.currentTarget.parentElement
                  ?.querySelector<HTMLButtonElement>(
                    `[data-degree="${target}"]`,
                  )
                  ?.focus();
              }}
              className="group flex min-w-0 flex-col items-center justify-end gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                cursor: dragPreview
                  ? 'grabbing'
                  : selected
                    ? 'grab'
                    : 'pointer',
              }}
            >
              <span className="text-[9px] tabular-nums text-muted-foreground">
                {note}
              </span>
              <span
                className="relative flex h-16 w-full items-end justify-center rounded-sm bg-foreground/[.035] transition-colors group-hover:bg-foreground/10 data-[drop-target]:bg-primary/15"
                data-drop-target={dragPreview?.target === note || undefined}
              >
                {selected && dragPreview?.from !== note && (
                  <span className="relative h-14 w-2.5 rounded-full bg-primary shadow-sm">
                    <span className="absolute top-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary-foreground/80" />
                  </span>
                )}
              </span>
              <span className="text-[8px] text-muted-foreground">
                {noteName(note)}
              </span>
            </button>
          );
        })}
        {dragPreview && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 z-10 h-14 w-2.5 -translate-x-1/2 -translate-y-1 scale-110 rounded-full bg-primary shadow-lg ring-2 ring-primary-foreground/25"
            style={{ left: `${dragPreview.position}%`, willChange: 'left' }}
          >
            <span className="absolute top-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary-foreground/90" />
          </span>
        )}
      </div>
    </div>
  );
}

export function ChordNode({ id, data, type }: WorkflowNodeProps) {
  const update = useAppStore((state) => state.updateNodeData);
  const [selectedStep, setSelectedStep] = useState(0);
  const steps = chordProgression(data);
  const activeStep = Math.min(selectedStep, Math.max(0, steps.length - 1));
  const { scaleType, degrees, noteName, noteLabel, chordName } =
    chordLabels(data);
  const manual = data.chordNotes !== undefined;
  const chords = chordNotes(data);
  const tones = chords[activeStep] ?? [];
  const noteSlots = Math.max(
    14,
    Math.ceil((Math.max(0, ...chords.flat()) + 1) / 7) * 7,
  );
  const changeSteps = (next: number[]) =>
    update(id, { chordProgression: next, chordNotes: undefined });
  const changeNotes = (next: number[][]) => update(id, { chordNotes: next });
  const editChord = (next: number[]) =>
    changeNotes(
      chords.length
        ? chords.map((chord, index) => (index === activeStep ? next : chord))
        : [next],
    );

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex w-80 flex-col gap-3 px-4 pt-1 pb-3">
        <ChordEditor
          key={activeStep}
          notes={tones}
          noteSlots={noteSlots}
          noteName={noteName}
          noteLabel={noteLabel}
          onChange={editChord}
        />
        <div className="flex gap-1.5" aria-label="Progression presets">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                changeSteps(preset.steps);
                setSelectedStep(0);
              }}
              className="nodrag flex-1 rounded-lg border px-2 py-2 text-[10px] transition-colors hover:bg-accent"
            >
              <svg
                viewBox="0 0 72 22"
                className="mb-1 h-5 w-full"
                aria-hidden="true"
              >
                <polyline
                  points={preset.steps
                    .map(
                      (degree, index) => `${9 + index * 18},${18 - degree * 2}`,
                    )
                    .join(' ')}
                  fill="none"
                  stroke="currentColor"
                  opacity=".25"
                  strokeWidth="2"
                />
                {preset.steps.map((degree, index) => (
                  <circle
                    key={index}
                    cx={9 + index * 18}
                    cy={18 - degree * 2}
                    r="3"
                    className="fill-primary"
                  />
                ))}
              </svg>
              {preset.label}
            </button>
          ))}
        </div>
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Chord progression"
        >
          {steps.map((degree, index) => (
            <button
              key={index}
              aria-label={`Chord step ${index + 1}: ${manual ? (chords[index].length ? chords[index].join(', ') : 'rest') : degrees[degree]}`}
              aria-pressed={activeStep === index}
              onClick={() => setSelectedStep(index)}
              className="nodrag w-[calc((100%-1.125rem)/4)] rounded-lg border p-2 text-left transition-colors hover:bg-accent aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:ring-1 aria-pressed:ring-primary aria-pressed:ring-inset"
            >
              <span className="flex justify-between text-[9px] text-muted-foreground">
                <span>{index + 1}</span>
                <span>{manual ? 'n' : degrees[degree]}</span>
              </span>
              <NoteShape notes={chords[index]} />
              <span className="block text-center break-words text-xs font-semibold">
                {manual
                  ? chords[index].length
                    ? chords[index].join('·')
                    : 'Rest'
                  : chordName(degree)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Add chord step"
            disabled={steps.length >= 16}
            onClick={() => {
              changeNotes([
                ...chords,
                [...(chords[chords.length - 1] ?? [0, 2, 4])],
              ]);
              setSelectedStep(steps.length);
            }}
            className="nodrag min-h-9 flex-1 rounded-lg border border-dashed text-lg text-muted-foreground hover:bg-accent disabled:opacity-40"
          >
            +
          </button>
        </div>
        <AccordionControls
          keyScaleOctaveProps={{
            selectedKey: data.selectedKey ?? DEFAULTS.selectedKey,
            onKeyChange: (selectedKey) => update(id, { selectedKey }),
            selectedScale: scaleType,
            onScaleChange: (scale) => update(id, { scaleType: scale }),
            octave: data.octave ?? DEFAULTS.octave,
            onOctaveChange: (octave) => update(id, { octave }),
            allowedScales: ['major', 'minor'],
          }}
        />
      </div>
    </WorkflowNode>
  );
}
