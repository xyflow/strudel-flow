import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '@/store/app-context';
import { useWorkflowRunner } from './use-workflow-runner';
// @ts-expect-error - Missing type declarations for @strudel/web
import { hush } from '@strudel/web';

export function useGlobalPlayback() {
  const { runWorkflow, stopWorkflow } = useWorkflowRunner();
  const nodes = useAppStore((state) => state.nodes);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const [isGloballyPaused, setIsGloballyPaused] = useState(false);
  const nodeStatesBeforePause = useRef<
    Record<string, 'running' | 'paused' | 'stopped'>
  >({});

  const globalPause = useCallback(() => {
    if (isGloballyPaused) return;

    nodeStatesBeforePause.current = {};
    nodes.forEach((node) => {
      const currentState = node.data.state || 'paused';
      if (currentState === 'running') {
        nodeStatesBeforePause.current[node.id] = 'running';
        updateNodeData(node.id, { state: 'paused' });
      }
    });

    hush();
    stopWorkflow();
    setIsGloballyPaused(true);
  }, [nodes, stopWorkflow, isGloballyPaused, updateNodeData]);

  const globalPlay = useCallback(() => {
    if (!isGloballyPaused) return;

    Object.keys(nodeStatesBeforePause.current).forEach((nodeId) => {
      if (nodeStatesBeforePause.current[nodeId] === 'running') {
        updateNodeData(nodeId, { state: 'running' });
      }
    });

    nodeStatesBeforePause.current = {};
    setIsGloballyPaused(false);
    runWorkflow();
  }, [updateNodeData, runWorkflow, isGloballyPaused]);

  const toggleGlobalPlayback = useCallback(() => {
    if (isGloballyPaused) {
      globalPlay();
    } else {
      globalPause();
    }
  }, [globalPlay, globalPause, isGloballyPaused]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.code === 'Space' &&
        !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)
      ) {
        event.preventDefault();
        toggleGlobalPlayback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleGlobalPlayback]);

  return {
    isGloballyPaused,
    globalPause,
    globalPlay,
    toggleGlobalPlayback,
  };
}
