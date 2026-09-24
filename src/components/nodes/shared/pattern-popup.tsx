import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nodeDefinitions } from '../registry';
import { useAppStore } from '@/store/app-store';

export default function PatternPopup({
  className = '',
  id,
  rows = 3,
}: {
  className?: string;
  id: string;
  rows?: number;
}) {
  const node = useAppStore((state) =>
    state.nodes.find((node) => node.id === id),
  );
  const strudelPattern = node
    ? nodeDefinitions[node.type]?.generatePattern(node.data, '')
    : '';
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (copyStatus === 'idle') return;
    const timer = window.setTimeout(() => setCopyStatus('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const copyCode = async () => {
    if (!strudelPattern) return;
    try {
      await navigator.clipboard.writeText(strudelPattern);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  };

  return (
    <div
      className={`px-3 py-2 border-t bg-card text-card-foreground border-border w-0 min-w-full ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono">Strudel Pattern</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="nodrag nopan h-6 px-2 text-xs"
          aria-label="Copy preview code"
          disabled={!strudelPattern}
          onClick={copyCode}
        >
          {copyStatus === 'copied' ? <Check className="size-3" /> : <Copy className="size-3" />}
          <span aria-live="polite">{copyStatus === 'copied' ? 'Copied!' : 'Copy'}</span>
        </Button>
      </div>
      {copyStatus === 'error' && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          Could not copy. Select the code and copy it manually.
        </p>
      )}
      <pre
        className="w-full p-2 border rounded font-mono text-xs mt-1 whitespace-pre-wrap bg-background text-foreground border-border w-0 min-w-full select-text"
        id={`preview-${id}`}
        style={{
          minHeight: `${rows * 1.5}em`,
          wordBreak: 'break-all',
          overflowWrap: 'break-word',
          lineBreak: 'anywhere',
        }}
      >
        {strudelPattern
          ? strudelPattern.replace(/\./g, '.\u200B')
          : 'No pattern.'}
      </pre>
    </div>
  );
}
