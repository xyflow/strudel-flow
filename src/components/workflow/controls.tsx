import { ZoomSlider } from '@/components/zoom-slider';
import { Panel } from '@xyflow/react';
import { useState } from 'react';
import { NotebookText, Timer, Play, Pause, Menu, X } from 'lucide-react';
import { PatternPanelWithCopy } from '@/components/pattern-panel';
import { useGlobalPlayback } from '@/hooks/use-global-playback';
import { CPM } from '@/components/cpm';
import { ShareUrlPopover } from '@/components/share-url-popover';
import { PresetPopover } from '@/components/preset-popover';
import { AppInfoPopover } from '@/components/app-info-popover';
import { useIsMobile } from '@/hooks/use-mobile';

function PlayPauseButton() {
  const { isGloballyPaused, toggleGlobalPlayback } = useGlobalPlayback();

  return (
    <button
      className={`p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground ${
        isGloballyPaused
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted hover:bg-primary'
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
  );
}

function PatternPanelButton({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
      onClick={onToggle}
      title="Toggle Pattern Panel"
    >
      <NotebookText className="w-5 h-5" />
    </button>
  );
}

function CPMPanelButton({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
      onClick={onToggle}
      title="Toggle CPM Panel"
    >
      <Timer className="w-5 h-5" />
    </button>
  );
}

export function WorkflowControls() {
  const [isPatternPanelVisible, setPatternPanelVisible] = useState(false);
  const [isCpmPanelVisible, setCpmPanelVisible] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
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
              <PlayPauseButton />

              <PatternPanelButton
                onToggle={() => setPatternPanelVisible((prev) => !prev)}
              />

              <CPMPanelButton
                onToggle={() => setCpmPanelVisible((prev) => !prev)}
              />

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
        <PlayPauseButton />

        <PatternPanelButton
          onToggle={() => setPatternPanelVisible((prev) => !prev)}
        />

        <CPMPanelButton onToggle={() => setCpmPanelVisible((prev) => !prev)} />

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
