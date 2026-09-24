import { Maximize, Minus, Plus } from 'lucide-react';
import { Panel, useReactFlow, PanelProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { ControlButton } from './control-button';

type ZoomSliderProps = Omit<PanelProps, 'children'>;
export function ZoomSlider({ className, ...props }: ZoomSliderProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <Panel className={cn('m-4! flex rounded-md border border-border/60 bg-card/90 p-1 sm:m-6!', className)} {...props}>
      <ControlButton title="Zoom out" onClick={() => zoomOut({ duration: 200 })} className="hidden sm:inline-flex"><Minus className="size-4" /></ControlButton>
      <ControlButton title="Fit patch" onClick={() => fitView({ duration: 300, padding: 0.3, maxZoom: 1 })}><Maximize className="size-4" /></ControlButton>
      <ControlButton title="Zoom in" onClick={() => zoomIn({ duration: 200 })} className="hidden sm:inline-flex"><Plus className="size-4" /></ControlButton>
    </Panel>
  );
}
