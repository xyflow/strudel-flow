import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';

interface CustomNodeInternalState {
  pattern: string;
}

export function CustomNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  const savedInternalState = (
    data as { internalState?: CustomNodeInternalState }
  )?.internalState;

  const [pattern, setPattern] = useState(
    savedInternalState?.pattern || 'sound("bd sd hh sd")'
  );

  const [hasRestoredState, setHasRestoredState] = useState(false);

  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setPattern(savedInternalState.pattern);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  useEffect(() => {
    const internalState: CustomNodeInternalState = {
      pattern,
    };

    updateNodeData(id, { internalState });
  }, [pattern, id, updateNodeData]);

  // Update strudel whenever pattern changes
  useEffect(() => {
    updateNode(id, { customPattern: pattern });
  }, [pattern, id, updateNode]);

  const handlePatternChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPattern(event.target.value);
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        {/* Pattern Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">
            Raw Strudel Code
          </label>
          <Textarea
            value={pattern}
            onChange={handlePatternChange}
            placeholder='Enter raw Strudel code...&#10;Example: sound("bd sd").gain(0.8).lpf(1000)'
            className="font-mono text-sm min-h-24 resize-none border rounded-md px-3 py-2 bg-transparent border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            spellCheck={false}
          />
        </div>

        {/* Help & Examples */}
        <Accordion type="single" collapsible>
          <AccordionItem value="help">
            <AccordionTrigger className="text-xs font-mono py-2">
              Examples & Help
            </AccordionTrigger>
            <AccordionContent className="overflow-hidden">
              <div className="flex flex-col gap-3 text-xs font-mono">
                {/* Examples */}
                <div>
                  <div className="font-semibold mb-2">Examples:</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>
                      • <code>sound("bd sd hh sd")</code>
                    </div>
                    <div>
                      • <code>n("0 2 4 2").scale("C4:major")</code>
                    </div>
                    <div>
                      • <code>sound("bd*2 sd").gain(0.8)</code>
                    </div>
                    <div>
                      • <code>note("c3 eb3 g3").slow(2)</code>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <div className="font-semibold mb-2">Tips:</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>
                      • Use <code>sound()</code> for samples
                    </div>
                    <div>
                      • Use <code>n().scale()</code> for melodies
                    </div>
                    <div>
                      • Use <code>note()</code> for specific notes
                    </div>
                    <div>
                      • Chain effects: <code>.gain().lpf()</code>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div>
                  <div className="font-semibold mb-2">Learn More:</div>
                  <div className="text-muted-foreground">
                    Visit{' '}
                    <a
                      href="https://strudel.cc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 underline"
                    >
                      strudel.cc
                    </a>{' '}
                    for full documentation
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </WorkflowNode>
  );
}

CustomNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const customPattern =
    useStrudelStore.getState().config[node.id]?.customPattern;

  if (!customPattern || !customPattern.trim()) return strudelString;

  // Return the raw pattern - no additional processing needed
  const pattern = customPattern.trim();
  return strudelString ? `${strudelString}.stack(${pattern})` : pattern;
};
