import { useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Copy, Download, Folder, Trash2, Upload } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { capturePatch, applyPatch } from '@/lib/patch-state';
import { downloadState, getShareUrl, loadFromUrl, stateFromJson } from '@/lib/project-state';
import { PatternPanel } from './pattern-panel';
import { ControlButton } from './control-button';

type SavedPatch = { id: string; name: string; url: string };
const storageKey = 'strudel-flow-patches-v1';
function readPatches(): SavedPatch[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(value) ? value.filter((item): item is SavedPatch => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.url === 'string') : [];
  } catch { return []; }
}

export function PresetPopover() {
  const [saved, setSaved] = useState(readPatches);
  const [name, setName] = useState('Untitled patch');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();
  const persist = (next: SavedPatch[]) => {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setSaved(next); return true; }
    catch { setStatus('Browser storage is unavailable. Copy the link or download your patch.'); return false; }
  };
  const restore = (url: string) => {
    try {
      const state = loadFromUrl(url);
      if (!state || !applyPatch(state)) throw new Error();
      setLink(url); setStatus('Patch loaded');
      requestAnimationFrame(() => { void fitView({ padding: 0.3, maxZoom: 1 }); });
    } catch { setStatus('Could not load this patch.'); }
  };
  const copy = async () => {
    const url = getShareUrl(capturePatch()); setLink(url);
    try { await navigator.clipboard.writeText(url); setStatus('Link copied'); }
    catch { setStatus('Select and copy the link below.'); }
  };
  return (
    <Popover onOpenChange={(open) => { if (open) { setSaved(readPatches()); setLink(getShareUrl(capturePatch())); setStatus(''); } }}>
      <PopoverTrigger asChild><ControlButton title="Patches"><Folder className="size-4" /></ControlButton></PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="nowheel max-h-[calc(100dvh-100px)] w-[min(420px,calc(100vw-24px))] overflow-y-auto rounded-lg p-4">
        <h3 className="mb-4 text-sm font-medium">Your patches</h3>
        <form className="flex gap-2" onSubmit={(event) => {
          event.preventDefault(); const url = getShareUrl(capturePatch()); setLink(url);
          if (persist([{ id: crypto.randomUUID(), name: name.trim() || 'Untitled patch', url }, ...saved])) setStatus('Saved in this browser. The link contains the whole patch.');
        }}>
          <input aria-label="Patch name" maxLength={80} value={name} onChange={event => setName(event.target.value)} className="min-w-0 flex-1 rounded-md border bg-muted/30 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <Button type="submit">Save link</Button>
        </form>
        <div className="my-3 flex gap-1">
          <Button variant="secondary" size="sm" onClick={copy}><Copy className="size-3.5" />Copy link</Button>
          <Button variant="ghost" size="sm" onClick={() => downloadState(capturePatch(), `${name.trim() || 'patch'}.json`)}><Download className="size-3.5" />Export</Button>
          <Button variant="ghost" size="sm" onClick={() => input.current?.click()}><Upload className="size-3.5" />Import</Button>
          <input ref={input} type="file" accept=".json" className="hidden" onChange={async event => {
            const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
            try { const state = stateFromJson(await file.text()); if (!state || !applyPatch(state)) throw new Error();
              setName(file.name.replace(/\.json$/i, '')); setLink(getShareUrl(capturePatch())); setStatus('Patch imported');
              requestAnimationFrame(() => { void fitView({ padding: 0.3, maxZoom: 1 }); });
            } catch { setStatus('Could not read this patch file.'); }
          }} />
        </div>
        <input aria-label="Shareable patch link" value={link} readOnly onFocus={event => event.target.select()} className="w-full rounded-md border bg-background/50 px-2 py-2 font-mono text-[10px] text-muted-foreground" />
        <p role="status" className="my-2 min-h-4 text-[11px] text-muted-foreground">{status || 'Save a snapshot here, or copy its link to share.'}</p>
        {saved.length > 0 && <div className="mb-4 max-h-36 space-y-1 overflow-y-auto">{saved.map(patch => <div key={patch.id} className="group flex items-center rounded-md bg-muted/40">
          <button className="min-w-0 flex-1 truncate px-3 py-2 text-left text-xs hover:text-primary" onClick={() => { restore(patch.url); setName(patch.name); }}>{patch.name}</button>
          <Button variant="ghost" size="icon" aria-label={`Delete ${patch.name}`} onClick={() => persist(saved.filter(item => item.id !== patch.id))}><Trash2 className="size-3.5" /></Button>
        </div>)}</div>}
        <div className="border-t pt-3"><PatternPanel isVisible /></div>
      </PopoverContent>
    </Popover>
  );
}
