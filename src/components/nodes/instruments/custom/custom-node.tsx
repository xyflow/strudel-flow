import { CODE_EXAMPLES, DEFAULT_CODE, codeSyntaxError } from './custom';
import { useState } from 'react';
import WorkflowNode from '@/components/nodes/shared/workflow-node';
import type { WorkflowNodeProps } from '@/components/nodes/types';
import { useAppStore } from '@/store/app-store';
import { Textarea } from '@/components/ui/textarea';
export function CustomNode({ id, data, type }: WorkflowNodeProps) {
  const update = useAppStore((state) => state.updateNodeData);
  const [error, setError] = useState<string | null>(null);
  const applied = data.customPattern ?? DEFAULT_CODE;
  const draft = data.customDraft ?? applied;
  const dirty = draft !== applied;
  const edit = (customDraft: string) => {
    update(id, { customDraft });
    setError(null);
  };
  const apply = () => {
    const syntaxError = codeSyntaxError(draft);
    setError(syntaxError);
    if (!syntaxError) update(id, { customPattern: draft, customDraft: draft });
  };

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex w-96 max-w-[calc(100vw-32px)] flex-col gap-3 px-4 pt-1 pb-4">
        <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <select
            aria-label="Code starting pattern"
            value=""
            onChange={(e) => edit(CODE_EXAMPLES[Number(e.target.value)].code)}
            className="nodrag h-9 rounded border bg-card px-2 text-foreground"
          >
            <option value="" disabled>
              Load example…
            </option>
            {CODE_EXAMPLES.map((example, index) => (
              <option key={example.label} value={index}>
                {example.label}
              </option>
            ))}
          </select>
        </label>
        <Textarea
          aria-label="Strudel pattern"
          aria-invalid={Boolean(error)}
          value={draft}
          onChange={(e) => edit(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              apply();
            }
          }}
          placeholder={'note("c3 e3 g3")\n  .sound("triangle")'}
          className="nodrag nowheel min-h-52 resize-y rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-xs leading-relaxed"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span
            className="mr-auto text-[10px] text-muted-foreground"
            role="status"
          >
            {dirty ? 'Unapplied changes' : 'Applied'}
          </span>
          <button
            disabled={!dirty}
            onClick={() => edit(applied)}
            className="nodrag rounded border px-3 py-2 text-xs disabled:opacity-40"
          >
            Revert
          </button>
          <button
            disabled={!dirty}
            onClick={apply}
            className="nodrag rounded bg-primary px-3 py-2 text-xs text-primary-foreground disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </div>
    </WorkflowNode>
  );
}
