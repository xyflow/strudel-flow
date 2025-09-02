import { useEffect, useRef, useCallback } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import { generateOutput } from '@/lib/strudel';
// @ts-expect-error - Missing type declarations for @strudel/web
import { evaluate, hush } from '@strudel/web';

export function useWorkflowRunner() {
  const isRunning = useRef(false);
  const cycleStartMs = useRef<number | null>(null);
  const boundaryTimerId = useRef<number | null>(null);
  const pendingPatternRef = useRef<string | null>(null);
  const pattern = useStrudelStore((s) => s.pattern);
  const setPattern = useStrudelStore((s) => s.setPattern);
  const cpm = useStrudelStore((s) => s.cpm);
  const bpc = useStrudelStore((s) => s.bpc);

  const nodes = useAppStore((state) => state.nodes);
  const edges = useAppStore((state) => state.edges);
  useEffect(() => {
    const newPattern = generateOutput(nodes, edges);
    setPattern(newPattern);
    // Defer hush/evaluate decisions to the boundary-aware effect below
  }, [nodes, edges, cpm, bpc, setPattern]);

  const getActivePattern = useCallback((p: string) => {
    return p
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
  }, []);

  const getCycleDurationMs = useCallback(() => {
    // Calculate cycle duration: each beat duration × beats per cycle
    const bpm = Number(cpm) || 120;
    const beatsPerCycle = Number(bpc) || 4;
    // Each beat duration in ms, then multiply by beats per cycle
    const beatDurationMs = 60000 / bpm;
    return beatDurationMs * beatsPerCycle;
  }, [cpm, bpc]);

  const runWorkflow = useCallback(
    (overridePattern?: string) => {
      const source = overridePattern ?? pattern;
      const activePattern = getActivePattern(source);
      const hasContent = activePattern
        .replace(/setcpm\([^)]+\)\s*/g, '')
        .trim();

      if (!hasContent) {
        if (isRunning.current) {
          console.log(
            'No active pattern to evaluate. Hushing at boundary or now if not running.'
          );
          hush();
          isRunning.current = false;
          cycleStartMs.current = null;
        }
        return;
      }

      console.log('Running workflow with pattern:', activePattern);
      isRunning.current = true;
      cycleStartMs.current = performance.now();

      try {
        evaluate(activePattern);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isKnownWarning =
          errorMessage.includes('got "undefined" instead of pattern') ||
          errorMessage.includes('Cannot read properties of undefined');

        if (isKnownWarning) {
          console.warn('Strudel pattern warning (suppressed):', errorMessage);
        } else {
          console.error('Strudel evaluation error:', err);
        }
      }
    },
    [pattern, getActivePattern]
  );

  const scheduleEvaluationAtBoundary = useCallback(() => {
    if (!isRunning.current) {
      runWorkflow();
      return;
    }

    const now = performance.now();
    const start = cycleStartMs.current ?? now;
    const duration = getCycleDurationMs();
    const elapsed = now - start;
    const cyclesElapsed = Math.ceil(elapsed / duration);
    const nextBoundary = start + cyclesElapsed * duration;
    const delay = Math.max(0, nextBoundary - now);

    if (boundaryTimerId.current !== null) {
      window.clearTimeout(boundaryTimerId.current);
    }

    boundaryTimerId.current = window.setTimeout(() => {
      const next = pendingPatternRef.current;
      pendingPatternRef.current = null;
      boundaryTimerId.current = null;
      runWorkflow(next ?? pattern);
    }, delay);
  }, [getCycleDurationMs, runWorkflow, pattern]);

  useEffect(() => {
    // When the generated pattern changes or cpm changes
    const trimmed = pattern?.trim() ?? '';
    if (!trimmed) {
      // Immediately hush and clear timers if pattern is empty
      if (boundaryTimerId.current !== null) {
        window.clearTimeout(boundaryTimerId.current);
        boundaryTimerId.current = null;
      }
      pendingPatternRef.current = '';
      runWorkflow('');
      return;
    }

    pendingPatternRef.current = pattern;
    scheduleEvaluationAtBoundary();
  }, [pattern, cpm, bpc, scheduleEvaluationAtBoundary, runWorkflow]);

  return {
    runWorkflow,
    stopWorkflow: () => {
      console.log('Stopping workflow...');
      if (boundaryTimerId.current !== null) {
        window.clearTimeout(boundaryTimerId.current);
        boundaryTimerId.current = null;
      }
      isRunning.current = false;
      hush();
      cycleStartMs.current = null;
      pendingPatternRef.current = null;
    },
    isRunning: () => isRunning.current,
  };
}
