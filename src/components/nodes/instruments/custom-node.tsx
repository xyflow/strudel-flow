import { useState } from 'react';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-store';
import { Textarea } from '@/components/ui/textarea';
const CODE_EXAMPLES = [
  { label: 'Drums', code: 'sound("bd*4, [~ sd]*2, hh*8")\n  .gain(0.7)' },
  {
    label: 'Bass',
    code: 'note("c2 ~ c2 [eb2 g2]")\n  .sound("sawtooth")\n  .lpf(700).decay(0.15).sustain(0)',
  },
  {
    label: 'Melody',
    code: 'n("0 2 4 <6 7>")\n  .scale("C4:minor")\n  .sound("triangle").room(0.3)',
  },
  {
    label: 'Chords',
    code: 'n("<[0,2,4,6] [5,7,9,11]>")\n  .scale("C3:major")\n  .sound("triangle").slow(2).room(0.4)',
  },
  {
    label: 'Layers',
    code: 'stack(\n  sound("bd*4, [~ sd]*2").gain(0.7),\n  n("0 2 4 7").scale("C4:minor")\n    .sound("triangle").gain(0.5)\n)',
  },
];

const DEFAULT_CODE = 'sound("bd sd hh sd")';
function codeExpression(code: string) {
  return code.trim().replace(/;+\s*$/, '');
}
function codeSyntaxError(code: string): string | null {
  if (!code.trim()) return null;
  try {
    // Parse without invoking the function or running the user's expression.
    new Function(`return (\n${codeExpression(code)}\n);`);
    return null;
  } catch (error) {
    return `${error instanceof Error ? error.message : 'Invalid syntax'}. Use one pattern expression, or stack(...) for layers.`;
  }
}

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

CustomNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const expression = codeExpression(node.data.customPattern ?? DEFAULT_CODE);
  if (!expression) return strudelString;
  const pattern = `(\n${expression}\n)`;
  return strudelString ? `stack(${strudelString}, ${pattern})` : pattern;
};
