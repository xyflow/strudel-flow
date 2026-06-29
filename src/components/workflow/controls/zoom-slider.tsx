import { Maximize, Minus, Plus } from 'lucide-react';
import {
  Panel,
  useViewport,
  useStore,
  useReactFlow,
  PanelProps,
} from '@xyflow/react';

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ZoomSliderProps = Omit<PanelProps, 'children'>;

export function ZoomSlider({ className, ...props }: ZoomSliderProps) {
  const { zoom } = useViewport();
  const { zoomTo, zoomIn, zoomOut, fitView } = useReactFlow();

  const { minZoom, maxZoom } = useStore(
    (state) => ({
      minZoom: state.minZoom,
      maxZoom: state.maxZoom,
    }),
    (a, b) => a.minZoom !== b.minZoom || a.maxZoom !== b.maxZoom,
  );

  return (
    <Panel
      className={cn(
        'flex gap-1 rounded-md border bg-primary-foreground p-1 text-foreground',
        className,
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => zoomOut({ duration: 300 })}
      >
        <Minus className="size-4" />
      </Button>
      <Slider
        className="w-[140px]"
        value={[zoom]}
        min={minZoom}
        max={maxZoom}
        step={0.01}
        onValueChange={(values) => zoomTo(values[0])}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => zoomIn({ duration: 300 })}
      >
        <Plus className="size-4" />
      </Button>
      <Button
        className="min-w-20 tabular-nums"
        variant="ghost"
        onClick={() => zoomTo(1, { duration: 300 })}
      >
        {(100 * zoom).toFixed(0)}%
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fitView({ duration: 300 })}
      >
        <Maximize className="size-4" />
      </Button>
    </Panel>
  );
}
