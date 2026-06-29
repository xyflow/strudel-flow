import { useState, useRef, ChangeEvent } from 'react';
import { Save, Upload, Settings2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { SettingsDialog } from '@/components/settings-dialog';
import { AppNode } from '@/components/nodes';
import { useAppStore } from '@/store/app-store';
import { useStrudelStore } from '@/store/strudel-store';
import { downloadState, stateFromJson } from '@/lib/project-state';

import { ControlButton } from './control-button';
import { SaveProjectDialog } from './save-project-dialog';

export function ProjectControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveFilename, setSaveFilename] = useState('strudel-flow-project.json');

  const {
    nodes,
    edges,
    theme,
    colorMode,
    setNodes,
    setEdges,
    setTheme,
    setColorMode,
  } = useAppStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      theme: state.theme,
      colorMode: state.colorMode,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setTheme: state.setTheme,
      setColorMode: state.setColorMode,
    })),
  );

  const { cpm, bpc, setCpm, setBpc } = useStrudelStore(
    useShallow((state) => ({
      cpm: state.cpm,
      bpc: state.bpc,
      setCpm: state.setCpm,
      setBpc: state.setBpc,
    })),
  );

  const handleSave = () => {
    downloadState({ nodes, edges, theme, colorMode, cpm, bpc }, saveFilename);
    setIsSaveDialogOpen(false);
  };

  const handleLoad = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const state = stateFromJson(content);
        if (state) {
          const loadedNodes = (state.nodes as AppNode[]).map((node) => ({
            ...node,
            data: {
              ...node.data,
              state: 'paused' as const,
            },
          }));
          setNodes(loadedNodes);
          setEdges(state.edges);
          setTheme(state.theme);
          setColorMode(state.colorMode);
          setCpm(state.cpm);
          if (state.bpc) {
            setBpc(state.bpc);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <SaveProjectDialog
        isOpen={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        filename={saveFilename}
        onFilenameChange={setSaveFilename}
        onSave={handleSave}
      >
        <ControlButton title="Save project">
          <Save className="size-5" />
        </ControlButton>
      </SaveProjectDialog>

      <ControlButton
        title="Load project"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="size-5" />
      </ControlButton>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLoad}
        className="hidden"
        accept=".json"
      />

      <SettingsDialog>
        <ControlButton title="Settings">
          <Settings2 className="size-5" />
        </ControlButton>
      </SettingsDialog>
    </>
  );
}
