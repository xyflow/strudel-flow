import { useState, MouseEvent } from 'react';
import { useReactFlow, XYPosition } from '@xyflow/react';

export function useClientPosition(): [
  XYPosition | null,
  (e: MouseEvent) => void
] {
  const [position, _setPosition] = useState<XYPosition | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const setPosition = (e: MouseEvent) =>
    _setPosition(screenToFlowPosition({ x: e.clientX, y: e.clientY }));

  return [position, setPosition];
}
