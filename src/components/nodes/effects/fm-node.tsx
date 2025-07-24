import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';

interface FMNodeInternalState {
  selectedFrequency: string;
  selectedDepth: string;
  selectedModulator: string;
}

const FM_FREQUENCIES = [
  {
    id: 'low',
    label: '1-3Hz',
    frequency: 'sine.range(1,3)',
    description: 'Slow modulation',
  },
  {
    id: 'medium',
    label: '3-8Hz',
    frequency: 'sine.range(3,8)',
    description: 'Medium modulation',
  },
  {
    id: 'high',
    label: '8-15Hz',
    frequency: 'sine.range(8,15)',
    description: 'Fast modulation',
  },
  { id: 'static-5', label: '5Hz', frequency: '5', description: 'Fixed 5Hz' },
  {
    id: 'static-10',
    label: '10Hz',
    frequency: '10',
    description: 'Fixed 10Hz',
  },
];

const FM_DEPTHS = [
  {
    id: 'subtle',
    label: 'Subtle',
    depth: '0.3',
    description: 'Light modulation',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    depth: '0.7',
    description: 'Medium modulation',
  },
  {
    id: 'intense',
    label: 'Intense',
    depth: '1',
    description: 'Heavy modulation',
  },
  { id: 'extreme', label: 'Extreme', depth: '2', description: 'Very heavy' },
];

const FM_MODULATORS = [
  {
    id: 'sine',
    label: 'Sine',
    modulator: 'sine',
    description: 'Smooth modulation',
  },
  {
    id: 'saw',
    label: 'Saw',
    modulator: 'saw',
    description: 'Sharp rise modulation',
  },
  {
    id: 'square',
    label: 'Square',
    modulator: 'square',
    description: 'On/off modulation',
  },
  {
    id: 'tri',
    label: 'Triangle',
    modulator: 'tri',
    description: 'Linear modulation',
  },
];

export function FMNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const savedInternalState = (data as { internalState?: FMNodeInternalState })
    ?.internalState;
  const [selectedFrequency, setSelectedFrequency] = useState(
    savedInternalState?.selectedFrequency || 'medium'
  );
  const [selectedDepth, setSelectedDepth] = useState(
    savedInternalState?.selectedDepth || 'moderate'
  );
  const [selectedModulator, setSelectedModulator] = useState(
    savedInternalState?.selectedModulator || 'sine'
  );
  const [hasRestoredState, setHasRestoredState] = useState(false);

  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setSelectedFrequency(savedInternalState.selectedFrequency);
      setSelectedDepth(savedInternalState.selectedDepth);
      setSelectedModulator(savedInternalState.selectedModulator);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  useEffect(() => {
    const internalState: FMNodeInternalState = {
      selectedFrequency,
      selectedDepth,
      selectedModulator,
    };
    updateNodeData(id, { internalState });
  }, [selectedFrequency, selectedDepth, selectedModulator, id, updateNodeData]);

  useEffect(() => {
    const frequencyData = FM_FREQUENCIES.find(
      (f) => f.id === selectedFrequency
    );
    const depthData = FM_DEPTHS.find((d) => d.id === selectedDepth);
    const modulatorData = FM_MODULATORS.find((m) => m.id === selectedModulator);

    if (frequencyData && depthData && modulatorData) {
      updateNode(id, {
        fmFrequency: frequencyData.frequency,
        fmDepth: depthData.depth,
        fmModulator: modulatorData.modulator,
      });
    }
  }, [selectedFrequency, selectedDepth, selectedModulator, id, updateNode]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">FM Frequency</label>
          <div className="grid grid-cols-3 gap-1">
            {FM_FREQUENCIES.map((freq) => (
              <Button
                key={freq.id}
                variant={selectedFrequency === freq.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFrequency(freq.id)}
                title={freq.description}
              >
                {freq.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">FM Depth</label>
          <div className="grid grid-cols-2 gap-1">
            {FM_DEPTHS.map((depth) => (
              <Button
                key={depth.id}
                variant={selectedDepth === depth.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDepth(depth.id)}
                title={depth.description}
              >
                {depth.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">
            Modulator Type
          </label>
          <div className="grid grid-cols-2 gap-1">
            {FM_MODULATORS.map((modulator) => (
              <Button
                key={modulator.id}
                variant={
                  selectedModulator === modulator.id ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedModulator(modulator.id)}
                title={modulator.description}
              >
                {modulator.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

FMNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const config = useStrudelStore.getState().config[node.id];
  const frequency = config?.fmFrequency;
  const depth = config?.fmDepth;
  const modulator = config?.fmModulator;

  if (!frequency || !depth || !modulator) return strudelString;

  const fmCall = `.fm(${modulator}.range(${frequency}).mul(${depth}))`;
  return strudelString + fmCall;
};
