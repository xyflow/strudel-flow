import { useEffect, useMemo, useRef } from 'react';
import { useKeyboardShortcuts } from './use-keyboard-shortcuts';
import { useAppStore } from '@/store/app-store';
import { generateOutput } from '@/lib/strudel';

// @ts-expect-error - Missing type declarations for @strudel/web
import { initStrudel, evaluate, hush, samples } from '@strudel/web';
import { setSchedulerNow } from '@/lib/strudel-clock';


type StrudelSession = {
  scheduler: { now: () => number };
  state: { evalError?: unknown };
};

const ready: Promise<StrudelSession> = initStrudel().then((session: StrudelSession) => {
  setSchedulerNow(() => session.scheduler.now());
  return session;
});
void ready.catch((error: unknown) => {
  useAppStore.getState().setError(error instanceof Error ? error.message : 'Audio could not start.');
});
samples('github:tidalcycles/dirt-samples');

async function evaluateAudio(pattern: string) {
  const session = await ready;
  await evaluate(pattern);
  // Strudel records evaluation failures rather than rejecting its promise.
  if (session.state.evalError) throw session.state.evalError;
}

function stopAudio() {
  hush();
}

type PlaybackAdapter = {
  evaluate: (pattern: string) => unknown | Promise<unknown>;
  hush: () => void;
  onError: (error: unknown) => void;
};

// A single queue prevents a slow evaluation from overwriting a newer edit.
function createPlaybackEngine(adapter: PlaybackAdapter) {
  let desired: string | null = null;
  let applied: string | null = null;
  let busy = false;
  let disposed = false;
  let revision = 0;
  let stopGeneration = 0;

  async function drain() {
    if (busy || disposed) return;
    busy = true;
    try {
      while (!disposed && desired !== null && desired !== applied) {
        const pattern = desired;
        const startedAt = revision;
        const generation = stopGeneration;
        try {
          await adapter.evaluate(pattern);
          applied = generation === stopGeneration ? pattern : null;
        } catch (error) {
          if (startedAt === revision && !disposed) {
            desired = null;
            applied = null;
            adapter.hush();
            adapter.onError(error);
          }
        }
        // An in-flight evaluation may finish after the user presses pause.
        if (disposed || desired === null) {
          adapter.hush();
          applied = null;
        }
      }
    } finally {
      busy = false;
    }
  }

  return {
    setPattern(pattern: string | null) {
      if (disposed) return;
      revision += 1;
      desired = pattern;
      if (pattern === null) {
        stopGeneration += 1;
        applied = null;
        adapter.hush();
      } else {
        void drain();
      }
    },
    dispose() {
      disposed = true;
      desired = null;
      adapter.hush();
    },
  };
}

// Mounted once by Workflow. UI components read playback state from the app store.
export function useWorkflowRunner() {
  useKeyboardShortcuts();
  const engine = useRef<ReturnType<typeof createPlaybackEngine> | null>(null);
  const nodes = useAppStore((state) => state.nodes);
  const edges = useAppStore((state) => state.edges);
  const cpm = useAppStore((state) => state.cpm);
  const bpc = useAppStore((state) => state.bpc);
  const setPattern = useAppStore((state) => state.setPattern);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const setError = useAppStore((state) => state.setError);

  const compiled = useMemo(() => {
    try {
      return { pattern: generateOutput(nodes, edges, cpm, bpc), error: null };
    } catch (error) {
      return { pattern: '', error: error instanceof Error ? error.message : String(error) };
    }
  }, [nodes, edges, cpm, bpc]);

  useEffect(() => {
    const instance = createPlaybackEngine({
      evaluate: evaluateAudio,
      hush: stopAudio,
      onError: (error) => setError(error instanceof Error ? error.message : String(error)),
    });
    engine.current = instance;
    return () => {
      instance.dispose();
      engine.current = null;
    };
  }, [setError]);

  useEffect(() => {
    setPattern(compiled.pattern);
    if (compiled.error) setError(compiled.error);
  }, [compiled, setPattern, setError]);

  useEffect(() => {
    const activePattern = compiled.pattern
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
    const hasNotes = activePattern.replace(/setcpm\([^)]+\)/g, '').trim();
    if (!isPlaying || !hasNotes || compiled.error) {
      engine.current?.setPattern(null);
      return;
    }
    const timer = window.setTimeout(() => engine.current?.setPattern(activePattern), 40);
    return () => window.clearTimeout(timer);
  }, [compiled.pattern, compiled.error, isPlaying]);

}
