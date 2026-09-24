import { Panel } from '@xyflow/react';
import logo from '@/assets/logo.svg?raw';
import { Settings2, X } from 'lucide-react';
import { SettingsDialog } from '@/components/settings-dialog';
import { AppInfoPopover } from './app-info-popover';
import { ControlButton } from './control-button';
import { useAppStore } from '@/store/app-store';
import { PlayPauseButton } from './play-pause-button';
import { ZoomSlider } from './zoom-slider';
import { PresetPopover } from './preset-popover';

export function WorkflowControls() {
  const cpm = useAppStore((state) => state.cpm);
  const setCpm = useAppStore((state) => state.setCpm);
  const bpc = useAppStore((state) => state.bpc);
  const setBpc = useAppStore((state) => state.setBpc);
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);

  return (
    <>
      <Panel
        position="top-left"
        className="m-4! flex h-12 items-center gap-2.5 sm:m-6!"
      >
        <a
          href="https://xyflow.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="xyflow website"
          className="rounded-lg transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span
            aria-hidden="true"
            className="block size-10 text-foreground"
            dangerouslySetInnerHTML={{ __html: logo }}
          />
        </a>
      </Panel>

      <Panel
        position="top-center"
        style={{ transform: 'translateX(-50%)' }}
        className="m-0! mt-20! flex h-14 items-center gap-2 rounded-md border border-border/70 bg-card/95 py-1.5 pr-3 pl-1.5 sm:mt-6!"
      >
        <PlayPauseButton />
        <div className="flex items-baseline gap-1.5">
          <input
            type="number"
            aria-label="Tempo in beats per minute"
            title="Tempo"
            min={1}
            max={200}
            value={cpm}
            onChange={(event) => {
              const value = event.target.valueAsNumber;
              if (Number.isFinite(value))
                setCpm(String(Math.min(200, Math.max(1, value))));
            }}
            className="nodrag w-12 bg-transparent text-right font-mono text-xl tabular-nums outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-[9px] font-medium tracking-widest text-muted-foreground">
            BPM
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 border-l border-border pl-3">
          <select
            id="beats-per-cycle"
            aria-label="Beats per cycle"
            title="Beats per cycle"
            value={bpc}
            onChange={(event) => setBpc(event.target.value)}
            className="nodrag h-9 w-12 cursor-pointer rounded-md bg-card text-center font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Array.from({ length: 16 }, (_, index) => index + 1).map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ),
            )}
          </select>
          <label
            htmlFor="beats-per-cycle"
            className="cursor-pointer text-[9px] leading-tight text-muted-foreground"
            title="Beats per cycle"
          >
            B/C
          </label>
        </div>
      </Panel>

      {error && (
        <Panel
          position="top-center"
          style={{ transform: 'translateX(-50%)' }}
          className="m-0! mt-36! flex max-w-[min(420px,90vw)] sm:mt-24! items-start gap-3 rounded-md border border-destructive/40 bg-card p-3 text-xs"
          role="alert"
        >
          <span>Couldn’t play this patch. {error}</span>
          <button
            aria-label="Dismiss playback error"
            onClick={() => setError(null)}
          >
            <X className="size-4" />
          </button>
        </Panel>
      )}
      <ZoomSlider position="bottom-left" />
      <Panel
        position="top-right"
        className="m-4! flex gap-1 rounded-md border border-border/60 bg-card p-1 sm:m-6!"
      >
        <PresetPopover />
        <SettingsDialog>
          <ControlButton title="Appearance settings">
            <Settings2 className="size-4" />
          </ControlButton>
        </SettingsDialog>
        <AppInfoPopover />
      </Panel>
    </>
  );
}
