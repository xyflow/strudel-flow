import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-context';
import { useStrudelStore } from '@/store/strudel-store';

export function useNodeState<T extends object>(
  id: string,
  data: { internalState?: T },
  initialState: T
) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);
  const updateNode = useStrudelStore((state) => state.updateNode);

  const [internalState, setInternalState] = useState<T>(
    data.internalState || initialState
  );

  useEffect(() => {
    updateNodeData(id, { internalState });
    updateNode(id, internalState);
  }, [id, internalState, updateNode, updateNodeData]);

  return [internalState, setInternalState] as const;
}
