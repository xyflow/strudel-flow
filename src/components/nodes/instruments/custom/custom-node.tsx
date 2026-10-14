import type { CustomControlsProps } from '../../define-node';
import type { CustomData } from './custom';
import { DEFAULT_CODE, codeSyntaxError } from './custom';
import { Textarea } from '@/components/ui/textarea';

export function CustomNode({
  values: data,
  onChange,
}: CustomControlsProps<CustomData>) {
  const draft = data.customDraft ?? data.customPattern ?? DEFAULT_CODE;
  const error = codeSyntaxError(draft);

  return (
    <div className="w-[32rem] max-w-[calc(100vw-32px)] px-3 pb-3">
      <Textarea
        aria-label="Strudel pattern"
        aria-invalid={Boolean(error)}
        title={error ?? undefined}
        value={draft}
        onChange={(event) => {
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
    </div>
  );
}
