import { ZoomSlider } from '@/components/zoom-slider';
import { Panel } from '@xyflow/react';
import { useState } from 'react';
import { NotebookText, Timer } from 'lucide-react';
import { PatternPanelWithCopy } from '@/components/pattern-panel';
import { CPM } from '../cpm';

export function WorkflowControls() {
  const [isPatternPanelVisible, setPatternPanelVisible] = useState(false);
  const [isCpmPanelVisible, setCpmPanelVisible] = useState(false);

  return (
    <>
      <ZoomSlider position="bottom-left" className="bg-card" />

      <Panel position="top-right" className="flex flex-col items-end gap-4">
        <button
          className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
          onClick={() => setPatternPanelVisible((prev) => !prev)}
        >
          <NotebookText className="w-5 h-5" />
        </button>
        <button
          className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
          onClick={() => setCpmPanelVisible((prev) => !prev)}
        >
          <Timer className="w-5 h-5" />
        </button>
        <PatternPanelWithCopy isVisible={isPatternPanelVisible} />
      </Panel>
      <Panel
        position="bottom-right"
        className="flex flex-col gap-4 bg-muted text-muted-foreground"
      >
        {isCpmPanelVisible && <CPM />}
      </Panel>
    </>
  );
}
