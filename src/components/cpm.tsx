import { useStrudelStore } from '@/store/strudel-store';
import { useShallow } from 'zustand/react/shallow';
import { Slider } from '@/components/ui/slider';

export function CPM() {
  const { cpm, bpc, setCpm, setBpc } = useStrudelStore(
    useShallow((s) => ({ cpm: s.cpm, bpc: s.bpc, setCpm: s.setCpm, setBpc: s.setBpc }))
  );

  const bpm = parseInt(cpm) || 120;
  const beatsPerCycle = parseInt(bpc) || 4;

  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border min-w-48">
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-base font-medium text-card-foreground">
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
          <label className="text-base font-medium text-card-foreground pb-2">
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
