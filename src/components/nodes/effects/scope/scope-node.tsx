import { useEffect, useMemo, useRef } from 'react';
import WorkflowNode from '@/components/nodes/shared/workflow-node';
import { ParameterControls } from '@/components/nodes/shared/parameter-controls';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import { useAppStore } from '@/store/app-store';
import { findConnectedComponents } from '@/lib/graph-utils';
import { drawScope } from '@/lib/strudel-scope';
import { DEFAULT_SCOPE_SCALE, scopeIdForGroup } from './scope';

const PARAMETERS = [
  {
    key: 'scopeScale',
    label: 'Scale',
    initial: DEFAULT_SCOPE_SCALE,
    min: 0.1,
    max: 4,
    step: 0.05,
  },
] as const;

export function ScopeNode({ id, data, type }: WorkflowNodeProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const nodes = useAppStore((state) => state.nodes);
  const edges = useAppStore((state) => state.edges);
  const playing = useAppStore((state) => state.isPlaying);
  const scopeId = useMemo(() => {
    const group = findConnectedComponents(nodes, edges).find((ids) =>
      ids.includes(id),
    );
    return scopeIdForGroup(group?.[0] ?? id);
  }, [nodes, edges, id]);
  const scale = Number(data.scopeScale ?? DEFAULT_SCOPE_SCALE);

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext('2d');
    if (!element || !ctx) return;
    let frame: number;
    const draw = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = Math.round(element.clientWidth * ratio);
      const height = Math.round(element.clientHeight * ratio);
      if (element.width !== width || element.height !== height) {
        element.width = width;
        element.height = height;
      }
      drawScope(
        ctx,
        scopeId,
        Number.isFinite(scale) ? scale : DEFAULT_SCOPE_SCALE,
        playing,
      );
      if (playing) frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [scopeId, scale, playing]);

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="w-72 max-w-[calc(100vw-32px)] space-y-3 px-4 pb-4">
        <canvas
          ref={canvas}
          role="img"
          aria-label="Audio waveform"
          className="h-28 w-full rounded border border-border bg-background text-primary"
        />
        <ParameterControls id={id} data={data} parameters={PARAMETERS} />
      </div>
    </WorkflowNode>
  );
}
