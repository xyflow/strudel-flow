import { useStrudelStore } from '@/store/strudel-store';
import { useState, useEffect } from 'react';
import { getNodeStrudelOutput } from '@/lib/node-registry';
import { useReactFlow } from '@xyflow/react';
import { AppNode } from '@/components/nodes';

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
      const pattern = strudelOutput(node as AppNode, '');
      setStrudelPattern(pattern);
    } else {
      setStrudelPattern('');
    }
  }, [getNode, id, nodeConfig]);

  return (
    <div
      className={`px-3 py-2 border-t bg-card text-card-foreground border-border w-0 min-w-full ${className}`}
    >
      <label htmlFor="pre" className="text-xs font-mono">
        Preview
      </label>
      <pre
        className="w-full p-2 border rounded font-mono text-xs mt-1 whitespace-pre-wrap bg-muted text-muted-foreground border-border w-0 min-w-full select-text"
        id="pre"
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
