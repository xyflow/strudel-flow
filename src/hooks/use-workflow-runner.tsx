import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import { generateOutput } from '@/lib/strudel';
// @ts-expect-error - Missing type declarations for @strudel/web
import { evaluate, hush } from '@strudel/web';

export function useWorkflowRunner() {
  const isRunning = useRef(false);
  const lastEvaluatedPattern = useRef<string>('');
  const debounceTimerId = useRef<number | null>(null);
  const pattern = useStrudelStore((s) => s.pattern);
  const setPattern = useStrudelStore((s) => s.setPattern);
  const cpm = useStrudelStore((s) => s.cpm);
  const bpc = useStrudelStore((s) => s.bpc);

  const nodes = useAppStore((state) => state.nodes);
  const edges = useAppStore((state) => state.edges);

  // Memoize pattern generation to avoid unnecessary recalculations
  // Include cpm and bpc as dependencies so pattern regenerates when tempo changes
  const generatedPattern = useMemo(() => {
    return generateOutput(nodes, edges, cpm, bpc);
  }, [nodes, edges, cpm, bpc]);
  // Update pattern when graph changes
  useEffect(() => {
    setPattern(generatedPattern);
  }, [generatedPattern, setPattern]);

  const getActivePattern = useCallback((p: string) => {
    return p
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
  }, []);

  // Smart pattern comparison - only evaluate if pattern actually changed
  const shouldEvaluatePattern = useCallback(
    (newPattern: string) => {
      const activePattern = getActivePattern(newPattern);
      const hasContent = activePattern
        .replace(/setcpm\([^)]+\)\s*/g, '')
        .trim();

      // Don't evaluate if no content
      if (!hasContent) return false;

      // Don't evaluate if pattern hasn't changed
      if (activePattern === lastEvaluatedPattern.current) return false;

      return true;
    },
    [getActivePattern]
  );

  const evaluatePattern = useCallback(
    (patternToEvaluate: string) => {
      const activePattern = getActivePattern(patternToEvaluate);
      const hasContent = activePattern
        .replace(/setcpm\([^)]+\)\s*/g, '')
        .trim();

      if (!hasContent) {
        if (isRunning.current) {
          console.log('No active pattern - hushing');
          hush();
          isRunning.current = false;
        }
        lastEvaluatedPattern.current = '';
        return;
      }

      // Skip if pattern hasn't actually changed
      if (activePattern === lastEvaluatedPattern.current) {
        return;
      }

      console.log('Evaluating new pattern:', activePattern);
      isRunning.current = true;
      lastEvaluatedPattern.current = activePattern;

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
    [getActivePattern]
  );

  // Debounced evaluation to batch rapid changes
  const debouncedEvaluate = useCallback(
    (patternToEvaluate: string) => {
      // Clear any existing debounce timer
      if (debounceTimerId.current !== null) {
        window.clearTimeout(debounceTimerId.current);
      }

      // For immediate changes (tempo, key changes), evaluate right away
      const isImmediateChange =
        patternToEvaluate.includes('setcpm(') ||
        patternToEvaluate.includes('scale(');

      if (isImmediateChange) {
        evaluatePattern(patternToEvaluate);
        return;
      }

      // For other changes, debounce to batch rapid UI interactions
      debounceTimerId.current = window.setTimeout(() => {
        evaluatePattern(patternToEvaluate);
        debounceTimerId.current = null;
      }, 50); // 50ms debounce for UI interactions
    },
    [evaluatePattern]
  );

  // Event-driven pattern evaluation - only when pattern actually changes
  useEffect(() => {
    if (!pattern || !pattern.trim()) {
      // Clear timers and hush if pattern is empty
      if (debounceTimerId.current !== null) {
        window.clearTimeout(debounceTimerId.current);
        debounceTimerId.current = null;
      }
      if (isRunning.current) {
        hush();
        isRunning.current = false;
      }
      lastEvaluatedPattern.current = '';
      return;
    }

    // Only evaluate if the pattern should actually change
    if (shouldEvaluatePattern(pattern)) {
      debouncedEvaluate(pattern);
    }
  }, [pattern, shouldEvaluatePattern, debouncedEvaluate]);

  return {
    runWorkflow: () => debouncedEvaluate(pattern),
    stopWorkflow: () => {
      console.log('Stopping workflow...');
      if (debounceTimerId.current !== null) {
        window.clearTimeout(debounceTimerId.current);
        debounceTimerId.current = null;
      }
      isRunning.current = false;
      lastEvaluatedPattern.current = '';
      hush();
    },
    isRunning: () => isRunning.current,
  };
}
