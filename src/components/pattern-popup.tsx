import { useStrudelStore } from '@/store/strudel-store';
import { useState, useEffect } from 'react';
import { getNodeStrudelOutput } from '@/lib/node-registry';
import { useReactFlow } from '@xyflow/react';

export default function PatternPopup({
  className = '',
  id,
  rows = 3,
}: {
  className?: string;
  id: string;
  rows?: number;
}) {
  const { getNode } = useReactFlow();
  // Subscribe to the specific node's config to trigger re-renders
  const nodeConfig = useStrudelStore((state) => state.config[id]);
  const [strudelPattern, setStrudelPattern] = useState('');
  
  // Update pattern whenever the node's config changes
  useEffect(() => {
    const node = getNode(id);
    if (!node || !node.type) {
      setStrudelPattern('');
      return;
    }

    const strudelOutput = getNodeStrudelOutput(node.type);
    if (strudelOutput) {
      const pattern = strudelOutput(node as any, '');
      setStrudelPattern(pattern);
    } else {
      setStrudelPattern('');
    }
  }, [getNode, id, nodeConfig]);

  return (
    <div
      className={`px-3 py-2 border-t ${className}`}
      style={{
        background: 'var(--color-card)',
        color: 'var(--color-card-foreground)',
        borderColor: 'var(--color-border)',
      }}
    >
      <label htmlFor="pre" className="text-xs font-mono">
        Preview
      </label>
      <pre
        className="w-full p-2 border rounded font-mono text-sm mt-1"
        id="pre"
        style={{
          minHeight: `${rows * 1.5}em`,
          background: 'var(--color-muted)',
          color: 'var(--color-muted-foreground)',
          borderColor: 'var(--color-border)',
        }}
      >
        {strudelPattern ? strudelPattern : 'No pattern.'}
      </pre>
    </div>
  );
}
