import { useEffect, useRef, useCallback } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import { generateOutput } from '@/lib/strudel';
// @ts-expect-error - Missing type declarations for @strudel/web
import { evaluate, hush } from '@strudel/web';

export function useWorkflowRunner() {
  const isRunning = useRef(false);
  const pattern = useStrudelStore((s) => s.pattern);
  const setPattern = useStrudelStore((s) => s.setPattern);
  const cpm = useStrudelStore((s) => s.cpm);

  const nodes = useAppStore((state) => state.nodes);
  const edges = useAppStore((state) => state.edges);
  useEffect(() => {
    const newPattern = generateOutput(nodes, edges);

    if (newPattern.trim() || nodes.length === 0) {
      setPattern(newPattern);
    }

    if (!newPattern.trim() && isRunning.current) {
      console.log('Pattern is empty, stopping workflow...');
      hush();
      isRunning.current = false;
    }
  }, [nodes, edges, cpm, setPattern]);

  const runWorkflow = useCallback(() => {
    const activePattern = pattern
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');

    const hasContent = activePattern.replace(/setcpm\(\d+\)\s*/g, '').trim();

    if (!hasContent) {
      console.log('No active pattern to evaluate.');
      if (isRunning.current) {
        hush();
        isRunning.current = false;
      }
      return;
    }

    if (isRunning.current) {
      console.log('Stopping previous workflow...');
      hush();
    }

    console.log('Running workflow with pattern:', activePattern);
    isRunning.current = true;

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

    return () => {
      isRunning.current = false;
      hush();
    };
  }, [pattern]);

  useEffect(() => {
    if (pattern) {
      runWorkflow();
    }
  }, [pattern, runWorkflow]);

  return {
    runWorkflow,
    stopWorkflow: () => {
      console.log('Stopping workflow...');
      isRunning.current = false;
      hush();
    },
    isRunning: () => isRunning.current,
  };
}
