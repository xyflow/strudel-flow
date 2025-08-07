import { ZoomSlider } from '@/components/zoom-slider';
import { Panel } from '@xyflow/react';
import { useState } from 'react';
import { NotebookText, Timer, Play, Pause, Menu, X } from 'lucide-react';
import { PatternPanelWithCopy } from '@/components/pattern-panel';
import { useGlobalPlayback } from '@/hooks/use-global-playback';
import { CPM } from '../cpm';
import { ShareUrlPopover } from '@/components/share-url-popover';
import { PresetPopover } from '@/components/preset-popover';
import { AppInfoPopover } from '@/components/app-info-popover';
import { useIsMobile } from '@/hooks/use-mobile';

export function WorkflowControls() {
  const [isPatternPanelVisible, setPatternPanelVisible] = useState(false);
  const [isCpmPanelVisible, setCpmPanelVisible] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isGloballyPaused, toggleGlobalPlayback } = useGlobalPlayback();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <Panel position="top-right" className="flex flex-col items-end gap-2">
          <button
            className="p-2 rounded bg-card border shadow-sm hover:bg-accent transition-colors"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            title="Toggle Controls Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {isMobileMenuOpen && (
            <div className="bg-card border rounded-lg shadow-lg p-2 flex flex-col gap-2">
              <button
                className={`p-2 rounded transition ${
                  isGloballyPaused
                    ? 'bg-primary'
                    : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
                onClick={toggleGlobalPlayback}
                title={`${
                  isGloballyPaused ? 'Resume' : 'Pause'
                } All (Spacebar)`}
              >
                {isGloballyPaused ? (
                  <Play className="w-5 h-5" />
                ) : (
                  <Pause className="w-5 h-5" />
                )}
              </button>

              <button
                className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
                onClick={() => setPatternPanelVisible((prev) => !prev)}
                title="Toggle Pattern Panel"
              >
                <NotebookText className="w-5 h-5" />
              </button>

              <button
                className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
                onClick={() => setCpmPanelVisible((prev) => !prev)}
                title="Toggle CPM Panel"
              >
                <Timer className="w-5 h-5" />
              </button>

              <PresetPopover />

              <ShareUrlPopover />

              <AppInfoPopover />
            </div>
          )}

          {isCpmPanelVisible && <CPM />}
        </Panel>

        <Panel position="bottom-right" className="flex flex-col gap-4">
          <PatternPanelWithCopy isVisible={isPatternPanelVisible} />
        </Panel>
      </>
    );
  }

  return (
    <>
      <ZoomSlider position="bottom-left" className="bg-card" />

      <Panel position="top-right" className="flex flex-col items-end gap-4">
        <button
          className={`p-2 rounded transition ${
            isGloballyPaused
              ? 'bg-primary'
              : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
          }`}
          onClick={toggleGlobalPlayback}
          title={`${isGloballyPaused ? 'Resume' : 'Pause'} All (Spacebar)`}
        >
          {isGloballyPaused ? (
            <Play className="w-5 h-5" />
          ) : (
            <Pause className="w-5 h-5" />
          )}
        </button>
        <button
          className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
          onClick={() => setPatternPanelVisible((prev) => !prev)}
          title="Toggle Pattern Panel"
        >
          <NotebookText className="w-5 h-5" />
        </button>
        <button
          className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
          onClick={() => setCpmPanelVisible((prev) => !prev)}
          title="Toggle CPM Panel"
        >
          <Timer className="w-5 h-5" />
        </button>

        <PresetPopover />

        <ShareUrlPopover />

        <AppInfoPopover />

        {isCpmPanelVisible && <CPM />}
      </Panel>

      <Panel position="bottom-right" className="flex flex-col gap-4">
        <PatternPanelWithCopy isVisible={isPatternPanelVisible} />
      </Panel>
    </>
  );
}
