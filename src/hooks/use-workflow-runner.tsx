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
  const config = useStrudelStore((s) => s.config);
  const cpm = useStrudelStore((s) => s.cpm);

  // Watch for changes in nodes/edges and regenerate pattern
  const nodes = useAppStore((state) => state.nodes);
  const edges = useAppStore((state) => state.edges);

  // Generate pattern when nodes/edges/config change
  useEffect(() => {
    const newPattern = generateOutput(nodes, edges);
    setPattern(newPattern);

    // If pattern is empty or becomes empty, hush immediately
    if (!newPattern.trim() && isRunning.current) {
      console.log('Pattern is empty, stopping workflow...');
      hush();
      isRunning.current = false;
    }
  }, [nodes, edges, config, cpm, setPattern]);

  const runWorkflow = useCallback(() => {
    if (!pattern.trim()) {
      console.log('No pattern to evaluate.');
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

    console.log('Running workflow with pattern:', pattern);
    isRunning.current = true;

    try {
      evaluate(pattern);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes('unexpected ast format without body expression')
      ) {
        console.log('Suppressed error:', err.message);
      } else {
        console.error(err);
      }
    }

    return () => {
      isRunning.current = false;
      hush();
    };
  }, [pattern]);

  useEffect(() => {
    runWorkflow();
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
