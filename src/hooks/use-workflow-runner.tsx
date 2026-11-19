import '@/lib/strudel-scope';
import { useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '@/store/app-store';
import { generateOutput } from '@/lib/strudel';
import {
  initStrudel,
  evaluate,
  hush,
  samples,
  getAudioContext,
  type StrudelSession,
} from '@strudel/web';
import { setSchedulerNow } from '@/lib/strudel-clock';
import { getSession, getTransport, useCollabStore } from '@/collab/session';
import { createAligner, prepareStart } from '@/collab/align';

const ready: Promise<StrudelSession> = initStrudel().then(
  (session: StrudelSession) => {
    setSchedulerNow(() => session.scheduler.now());
    return session;
  },
);
void ready.catch((error: unknown) => {
  useAppStore
    .getState()
    .setError(
      error instanceof Error ? error.message : 'Audio could not start.',
    );
});
samples('github:tidalcycles/dirt-samples');

async function evaluateAudio(pattern: string) {
  const session = await ready;
  // In a jam room, start on the cycle the room is on, not at cycle 0.
  const room = getSession();
  const transport = getTransport();
  if (room && transport) {
    prepareStart(session.scheduler, transport, getAudioContext(), room.clock);
  }
  await evaluate(pattern);
  if (session.state.evalError) throw session.state.evalError;
}

type PlaybackAdapter = {
  evaluate: (pattern: string) => unknown | Promise<unknown>;
  hush: () => void;
  onError: (error: unknown) => void;
};
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
            desired = applied;
            if (applied === null) {
              adapter.hush();
              adapter.onError(error);
            }
          }
        }
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
// While playing in a jam room, measure how far this browser is from the
// room's cycle and nudge the scheduler back when it drifts.
function useRoomAlignment(isPlaying: boolean) {
  const inRoom = useCollabStore((state) => state.room !== null);
  const transportRevision = useCollabStore((state) => state.transportRevision);
  useEffect(() => {
    if (!inRoom || !isPlaying) {
      useCollabStore.setState({ alignErrorMs: null });
      return;
    }
    const aligner = createAligner();
    let cancelled = false;
    const check = async () => {
      const session = await ready;
      const room = getSession();
      const transport = getTransport();
      if (cancelled || !room || !transport) return;
      const errorMs = aligner.check(
        session.scheduler,
        transport,
        getAudioContext(),
        room.clock,
      );
      if (errorMs !== null) useCollabStore.setState({ alignErrorMs: errorMs });
    };
    // Check quickly after a start or tempo change, then settle down.
    const soon = [150, 400, 800].map((ms) => window.setTimeout(check, ms));
    const interval = window.setInterval(check, 2000);
    return () => {
      cancelled = true;
      soon.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [inRoom, isPlaying, transportRevision]);
}

export function useWorkflowRunner() {
  const engine = useRef<ReturnType<typeof createPlaybackEngine> | null>(null);
  const nodes = useAppStore((state) => state.nodes);
  const edges = useAppStore((state) => state.edges);
  const cpm = useAppStore((state) => state.cpm);
  const bpc = useAppStore((state) => state.bpc);
  const setPattern = useAppStore((state) => state.setPattern);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const setError = useAppStore((state) => state.setError);
  useRoomAlignment(isPlaying);

  const compiled = useMemo(() => {
    try {
      return { pattern: generateOutput(nodes, edges, cpm, bpc), error: null };
    } catch (error) {
      return {
        pattern: '',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [nodes, edges, cpm, bpc]);

  useEffect(() => {
    const instance = createPlaybackEngine({
      evaluate: evaluateAudio,
      hush,
      onError: (error) =>
        setError(error instanceof Error ? error.message : String(error)),
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
    const timer = window.setTimeout(
      () => engine.current?.setPattern(activePattern),
      40,
    );
    return () => window.clearTimeout(timer);
  }, [compiled.pattern, compiled.error, isPlaying]);
}
