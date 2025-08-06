import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { useAppStore } from '@/store/app-context';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';

export function CustomNode({ id, data, type }: WorkflowNodeProps) {
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Use node data directly with defaults
  const customPattern = data.customPattern || 'sound("bd sd hh sd")';

  const handlePatternChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    updateNodeData(id, { customPattern: event.target.value });
  };

  return (
    <WorkflowNode id={id} data={data} type={type}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md w-80">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">
            Raw Strudel Code
          </label>
          <Textarea
            value={customPattern}
            onChange={handlePatternChange}
            placeholder='Enter raw Strudel code...&#10;Example: sound("bd sd").gain(0.8).lpf(1000)'
            className="font-mono text-sm min-h-24 resize-none border rounded-md px-3 py-2 bg-transparent border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            spellCheck={false}
          />
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="help">
            <AccordionTrigger className="text-xs font-mono py-2">
              Examples & Help
            </AccordionTrigger>
            <AccordionContent className="overflow-hidden">
              <div className="flex flex-col gap-3 text-xs font-mono">
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
  const customPattern = node.data.customPattern;

  if (!customPattern || !customPattern.trim()) return strudelString;

  const pattern = customPattern.trim();
  return strudelString ? `${strudelString}.stack(${pattern})` : pattern;
};
