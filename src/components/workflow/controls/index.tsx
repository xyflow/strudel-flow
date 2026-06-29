import { useState } from 'react';
import { Panel } from '@xyflow/react';
import { Menu, X, NotebookText, Timer } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';

import { ControlButton } from './control-button';
import { PlayPauseButton } from './play-pause-button';
import { CpmPanel } from './cpm-panel';
import { PatternPanel } from './pattern-panel';
import { ZoomSlider } from './zoom-slider';
import { PresetPopover } from './preset-popover';
import { ShareUrlPopover } from './share-url-popover';
import { AppInfoPopover } from './app-info-popover';
import { ProjectControls } from './project-controls';

function ControlToolbar({
  onTogglePatternPanel,
  onToggleCpmPanel,
}: {
  onTogglePatternPanel: () => void;
  onToggleCpmPanel: () => void;
}) {
  return (
    <>
      <PlayPauseButton />

      <ControlButton
        onClick={onTogglePatternPanel}
        title="Toggle Pattern Panel"
      >
        <NotebookText className="size-5" />
      </ControlButton>

      <ControlButton onClick={onToggleCpmPanel} title="Toggle CPM Panel">
        <Timer className="size-5" />
      </ControlButton>

      <PresetPopover />
      <ShareUrlPopover />
      <AppInfoPopover />
      <ProjectControls />
    </>
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
          <ControlButton
            variant="menu"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            title="Toggle Controls Menu"
          >
            {isMobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </ControlButton>

          {isMobileMenuOpen && (
            <div className="flex flex-col gap-2 rounded-lg border bg-card p-2 shadow-lg">
              <ControlToolbar
                onTogglePatternPanel={() =>
                  setPatternPanelVisible((prev) => !prev)
                }
                onToggleCpmPanel={() => setCpmPanelVisible((prev) => !prev)}
              />
            </div>
          )}

          {isCpmPanelVisible && <CpmPanel />}
        </Panel>

        <Panel position="bottom-right" className="flex flex-col gap-4">
          <PatternPanel isVisible={isPatternPanelVisible} />
        </Panel>
      </>
    );
  }

  return (
    <>
      <ZoomSlider position="bottom-right" className="bg-card" />

      <Panel position="top-right" className="flex flex-col items-end gap-4">
        <ControlToolbar
          onTogglePatternPanel={() =>
            setPatternPanelVisible((prev) => !prev)
          }
          onToggleCpmPanel={() => setCpmPanelVisible((prev) => !prev)}
        />

        {isCpmPanelVisible && <CpmPanel />}
      </Panel>

      <Panel position="bottom-right" className="flex flex-col gap-4">
        <PatternPanel isVisible={isPatternPanelVisible} />
      </Panel>
    </>
  );
}
