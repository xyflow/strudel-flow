import { useShallow } from 'zustand/react/shallow';

import { Slider } from '@/components/ui/slider';
import { useStrudelStore } from '@/store/strudel-store';

export function CpmPanel() {
  const { cpm, bpc, setCpm, setBpc } = useStrudelStore(
    useShallow((s) => ({
      cpm: s.cpm,
      bpc: s.bpc,
      setCpm: s.setCpm,
      setBpc: s.setBpc,
    })),
  );

  const bpm = parseInt(cpm) || 120;
  const beatsPerCycle = parseInt(bpc) || 4;

  return (
    <div className="flex min-w-48 flex-col gap-4 rounded-md border bg-card p-4">
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium text-card-foreground">
            BPM: {bpm}
          </label>
          <Slider
            value={[bpm]}
            onValueChange={([v]) => setCpm(v.toString())}
            min={1}
            max={200}
            step={1}
            className="w-full pt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-card-foreground">
            BPC: {beatsPerCycle}
          </label>
          <Slider
            value={[beatsPerCycle]}
            onValueChange={([v]) => setBpc(v.toString())}
            min={1}
            max={10}
            step={1}
            className="w-full pt-2"
          />
        </div>
      </div>
    </div>
  );
}
