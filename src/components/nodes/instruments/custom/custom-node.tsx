import type { CustomControlsProps } from '../../define-node';
import type { CustomData } from './custom';
import { DEFAULT_CODE, codeSyntaxError } from './custom';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { codeToNodes } from '@/lib/code-to-nodes';

export function CustomNode({
  id,
  values: data,
  onChange,
}: CustomControlsProps<CustomData>) {
  const [conversionError, setConversionError] = useState<string | null>(null);
  const { fitView } = useReactFlow();
  const draft = data.customDraft ?? data.customPattern ?? DEFAULT_CODE;
  const error = codeSyntaxError(draft);
  const convert = () => {
    try {
      const state = useAppStore.getState();
      const node = state.nodes.find((item) => item.id === id);
      if (!node) return;
      const graph = codeToNodes(node, draft, state.nodes, state.edges, Number(state.bpc) || 4);
      const existing = new Set(
        state.nodes.filter((item) => item.id !== id).map((item) => item.id),
      );
      useAppStore.setState(graph);
      requestAnimationFrame(
        () =>
          void fitView({
            nodes: graph.nodes.filter((item) => !existing.has(item.id)),
            padding: 0.3,
            minZoom: 0.05,
            maxZoom: 1,
            duration: 200,
          }),
      );
    } catch (error) {
      setConversionError(
        error instanceof Error
          ? error.message
          : 'Could not convert this pattern.',
      );
    }
  };

  return (
    <div className="w-[32rem] max-w-[calc(100vw-32px)] px-3 pb-3">
      <Textarea
        aria-label="Strudel pattern"
        aria-invalid={Boolean(error)}
        title={error ?? undefined}
        value={draft}
        onChange={(event) => {
          setConversionError(null);
          const code = event.target.value;
          onChange({
            customDraft: code,
            ...(!codeSyntaxError(code) ? { customPattern: code } : {}),
          });
        }}
        placeholder={'note("c3 e3 g3")\n  .sound("triangle")'}
        className="nodrag nowheel min-h-80 resize-y rounded-lg border border-input bg-transparent px-3 py-3 font-mono text-xs leading-relaxed"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          Turn patterns and layers into editable nodes.
        </span>
        <Button
          className="nodrag shrink-0"
          size="sm"
          variant="outline"
          disabled={!draft.trim() || Boolean(error)}
          onClick={convert}
        >
          Convert to nodes
        </Button>
      </div>
      {conversionError && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {conversionError}
        </p>
      )}
    </div>
  );
}
