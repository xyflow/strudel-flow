import {
  expressionControls,
  numericPatternControls,
  replaceExpressionControl,
} from '@/lib/expression-controls';
import { DRUM_CATEGORIES, SYNTH_CATEGORIES, KEY_OPTIONS } from '@/data/sounds';
import { parse } from 'acorn';
import { isExpressionValue, signals } from '@/lib/strudel-calls';
import { ParameterKnob } from './parameter-knob';
import { callKnobRange } from '@/lib/call-knob';
import { useEffect, useRef, useState } from 'react';
import type { CallValue, StrudelCall } from '@/lib/strudel-calls';

const displayValue = (value: CallValue) =>
  isExpressionValue(value)
    ? value.expression
    : typeof value === 'string'
      ? value
      : JSON.stringify(value);
const isCallValue = (value: unknown): value is CallValue =>
  value === null ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value)) ||
  (Array.isArray(value) && value.every(isCallValue));

function ValueInput({
  value,
  onChange,
  label,
}: {
  value: CallValue;
  onChange: (value: CallValue) => void;
  label: string;
}) {
  const [draft, setDraft] = useState(displayValue(value));
  const [error, setError] = useState(false);
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current) {
      setDraft(displayValue(value));
      setError(false);
    }
  }, [value]);
  if (typeof value === 'boolean')
    return (
      <input
        type="checkbox"
        aria-label={label}
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="nodrag accent-primary"
      />
    );
  return (
    <input
      aria-label={label}
      aria-invalid={error}
      title={error ? 'Enter a valid value.' : undefined}
      inputMode={typeof value === 'number' ? 'decimal' : undefined}
      value={draft}
      onFocus={() => {
        editing.current = true;
      }}
      onBlur={() => {
        editing.current = false;
      }}
      onChange={(event) => {
        const text = event.target.value;
        setDraft(text);
        try {
          if (isExpressionValue(value)) {
            parse(`(${text})`, { ecmaVersion: 'latest' });
            onChange({ expression: text });
            setError(false);
            return;
          }
          const next: unknown =
            typeof value === 'string' ? text : JSON.parse(text);
          if (
            !isCallValue(next) ||
            (typeof value === 'number' && typeof next !== 'number')
          )
            throw new Error();
          onChange(next);
          setError(false);
        } catch {
          setError(true);
        }
      }}
      className="nodrag nopan min-w-0 w-full rounded border border-input bg-background px-2 py-1.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
    />
  );
}

function NumericValue({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [range] = useState(() => callKnobRange(name, value));
  return (
    <ParameterKnob
      label={label}
      value={value}
      min={Math.min(range.min, value)}
      max={Math.max(range.max, value)}
      step={range.step}
      format={(next) => String(Number(next.toFixed(5)))}
      onChange={onChange}
    />
  );
}

const soundOptions = [
  ...new Set([
    'sine',
    'triangle',
    'sawtooth',
    'square',
    ...[...DRUM_CATEGORIES, ...SYNTH_CATEGORIES].flatMap(
      (category) => category.options,
    ),
  ]),
];

function Options({
  value,
  options,
  label,
  onChange,
}: {
  value: string;
  options: string[];
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-muted-foreground">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="nodrag nopan max-w-56 rounded border border-input bg-background px-2 py-1.5 text-foreground"
      >
        {[...new Set([value, ...options])].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function BankControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [banks, setBanks] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void import('@strudel/web')
      .then(({ soundMap }) => {
        if (!active) return;
        unsubscribe = soundMap.subscribe((sounds) =>
          setBanks(
            [
              ...new Set(
                Object.keys(sounds)
                  .filter((sound) => sound.includes('_'))
                  .map((sound) => sound.slice(0, sound.indexOf('_'))),
              ),
            ].sort(),
          ),
        );
      })
      .catch(() => setBanks([]));
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  return (
    <Options label="Bank" value={value} options={banks} onChange={onChange} />
  );
}

function ArgumentControl({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: CallValue;
  onChange: (value: CallValue) => void;
}) {
  if (typeof value === 'number')
    return (
      <NumericValue
        name={name}
        label={label}
        value={value}
        onChange={onChange}
      />
    );
  if (typeof value === 'boolean')
    return (
      <label className="flex items-center gap-2">
        {label}
        <ValueInput label={label} value={value} onChange={onChange} />
      </label>
    );
  if (Array.isArray(value))
    return (
      <div className="flex flex-wrap gap-3">
        {value.map((item, index) => (
          <ArgumentControl
            key={index}
            name={name}
            label={`${label} ${index + 1}`}
            value={item}
            onChange={(next) =>
              onChange(value.map((entry, i) => (i === index ? next : entry)))
            }
          />
        ))}
      </div>
    );
  const note =
    typeof value === 'string' && ['anchor', 'note'].includes(name)
      ? /^([a-gA-G][#b]?)(-?\d)$/.exec(value)
      : null;
  if (note)
    return (
      <div className="flex items-end gap-3">
        <Options
          label="Note"
          value={note[1]}
          options={KEY_OPTIONS.map((key) => key.value)}
          onChange={(key) => onChange(`${key}${note[2]}`)}
        />
        <NumericValue
          name="noteOctave"
          label="Octave"
          value={Number(note[2])}
          onChange={(octave) => onChange(`${note[1]}${octave}`)}
        />
      </div>
    );
  if (name === 'bank' && typeof value === 'string' && /^[\w-]+$/.test(value))
    return <BankControl value={value} onChange={onChange} />;
  const expression = isExpressionValue(value);
  const code = expression
    ? value.expression
    : typeof value === 'string'
      ? value
      : '';
  const sound = !expression && ['s', 'sound'].includes(name);
  const controls = expression
    ? expressionControls(code, name)
    : numericPatternControls(
        sound
          ? code.replace(/[a-zA-Z_][\w-]*/g, (token) =>
              ' '.repeat(token.length),
            )
          : code,
        sound ? 'sampleIndex' : name,
      );
  const sounds =
    sound
      ? [...code.matchAll(/[a-zA-Z_][\w-]*/g)]
      : [];
  const structured = controls.length > 0 || sounds.length > 0;
  const update = (next: string) =>
    onChange(expression ? { expression: next } : next);
  return (
    <div className="flex max-w-80 flex-col gap-3">
      {structured && (
        <div className="flex flex-wrap items-end justify-center gap-3">
          {sounds.map((sound, index) => (
            <Options
              key={`sound:${index}`}
              label={sounds.length > 1 ? `Sound ${index + 1}` : 'Sound'}
              value={sound[0]}
              options={soundOptions}
              onChange={(next) =>
                update(
                  code.slice(0, sound.index!) +
                    next +
                    code.slice(sound.index! + sound[0].length),
                )
              }
            />
          ))}
          {controls.map((control, index) =>
            control.kind === 'signal' ? (
              <Options
                key={index}
                label={control.label}
                value={control.value}
                options={signals}
                onChange={(next) =>
                  update(replaceExpressionControl(code, control, next))
                }
              />
            ) : name === 'mask' &&
              control.name === name &&
              [0, 1].includes(control.value) ? (
              <button
                key={index}
                type="button"
                aria-label={control.label}
                aria-pressed={control.value === 1}
                className="nodrag size-8 rounded border border-input bg-muted aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                onClick={() =>
                  update(
                    replaceExpressionControl(code, control, 1 - control.value),
                  )
                }
              >
                {index + 1}
              </button>
            ) : (
              <NumericValue
                key={`${index}:${control.name}`}
                name={control.name}
                label={control.label}
                value={control.value}
                onChange={(next) =>
                  update(replaceExpressionControl(code, control, next))
                }
              />
            ),
          )}
        </div>
      )}
      {!structured && (
        <label className="flex w-56 items-center gap-2">
          <span className="text-muted-foreground">{label}:</span>
          <ValueInput
            label={`${label} value`}
            value={value}
            onChange={onChange}
          />
        </label>
      )}
    </div>
  );
}

export function CallControls({
  calls,
  onChange,
  boundArguments = [],
}: {
  boundArguments?: number[];
  calls: StrudelCall[];
  onChange: (calls: StrudelCall[]) => void;
}) {
  return (
    <div className="flex max-w-96 flex-wrap justify-center gap-4 px-4 pt-1 pb-4 font-mono text-xs">
      {calls.map((call, index) =>
        call.args.length === 0 ? (
          <span key={index} className="text-muted-foreground">
            {call.name}()
          </span>
        ) : (
          call.args.map((value, argument) => {
            if (boundArguments.includes(argument))
              return (
                <span
                  key={`${index}:${argument}`}
                  className="text-muted-foreground"
                >
                  Connected input
                </span>
              );
            const label = `${call.name}${call.args.length > 1 ? ` ${argument + 1}` : ''}`;
            const update = (next: CallValue) =>
              onChange(
                calls.map((item, i) =>
                  i === index
                    ? {
                        ...item,
                        enabled: true,
                        args: item.args.map((arg, j) =>
                          j === argument ? next : arg,
                        ),
                      }
                    : item,
                ),
              );
            return (
              <ArgumentControl
                key={`${index}:${argument}`}
                name={call.name}
                label={label}
                value={value}
                onChange={update}
              />
            );
          })
        ),
      )}
    </div>
  );
}
