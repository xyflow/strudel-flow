import { useEffect, useState } from 'react';

export function useCopyText(text: string) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timeout = setTimeout(() => setStatus('idle'), 2000);
    return () => clearTimeout(timeout);
  }, [status]);

  const copy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  };

  return { copy, status };
}
