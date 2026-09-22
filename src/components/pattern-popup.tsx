import { getNodeStrudelOutput } from '@/lib/strudel';
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
  const node = useAppStore(state => state.nodes.find(node => node.id === id));
  const strudelPattern = node ? getNodeStrudelOutput(node.type)?.(node, '') : '';

  return (
    <div
      className={`px-3 py-2 border-t bg-card text-card-foreground border-border w-0 min-w-full ${className}`}
    >
      <label htmlFor={`preview-${id}`} className="text-xs font-mono">
        Preview
      </label>
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
