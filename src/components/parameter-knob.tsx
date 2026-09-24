import { useRef } from 'react';

type ParameterKnobProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
};

export function ParameterKnob({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = String,
}: ParameterKnobProps) {
  const drag = useRef<{ x: number; y: number; value: number } | null>(null);
  const clamped = Math.min(
    max,
    Math.max(min, Number.isFinite(value) ? value : min),
  );
  const proportion = (clamped - min) / (max - min);
  const update = (next: number) =>
    onChange(
      Number(
        Math.min(
          max,
          Math.max(min, min + Math.round((next - min) / step) * step),
        ).toFixed(5),
      ),
    );

  return (
    <div className="flex min-w-20 flex-col items-center gap-2">
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-valuetext={format(clamped)}
        className="nodrag nopan relative grid size-20 touch-none cursor-ns-resize place-items-center rounded-full outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-card"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, y: event.clientY, value: clamped };
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          const distance =
            drag.current.y - event.clientY + event.clientX - drag.current.x;
          update(
            drag.current.value +
              (distance * (max - min)) / (event.shiftKey ? 1200 : 180),
          );
        }}
        onPointerUp={(event) => {
          drag.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onKeyDown={(event) => {
          const increments: Record<string, number> = {
            ArrowUp: step,
            ArrowRight: step,
            ArrowDown: -step,
            ArrowLeft: -step,
            PageUp: step * 10,
            PageDown: -step * 10,
          };
          if (
            event.key === 'Home' ||
            event.key === 'End' ||
            event.key in increments
          ) {
            event.preventDefault();
            event.stopPropagation();
            update(
              event.key === 'Home'
                ? min
                : event.key === 'End'
                  ? max
                  : clamped + increments[event.key],
            );
          }
        }}
      >
        <svg
          viewBox="0 0 80 80"
          aria-hidden
          className="absolute inset-0 size-full -rotate-225 fill-none stroke-[3]"
        >
          <circle
            cx="40"
            cy="40"
            r="35"
            pathLength="100"
            strokeDasharray="75 100"
            className="stroke-muted-foreground/20"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            pathLength="100"
            strokeDasharray={`${proportion * 75} 100`}
            className="stroke-primary"
            strokeLinecap="round"
          />
        </svg>
        <div
          aria-hidden
          className="grid size-14 place-items-center rounded-full border border-muted-foreground/20 bg-secondary "
          style={{ transform: `rotate(${-135 + proportion * 270}deg)` }}
        >
          <span className="absolute top-1.5 h-3 w-0.5 rounded-full bg-primary" />
        </div>
      </div>
      <span className="font-mono text-xs tabular-nums text-foreground">
        {format(clamped)}
      </span>
      <span className="text-[9px] font-medium tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}
