import { useStrudelStore } from '@/store/strudel-store';
import { Slider } from '@/components/ui/slider';

export function CPM() {
  const globalCpm = useStrudelStore((state) => state.cpm);
  const globalBpc = useStrudelStore((state) => state.bpc);
  const setGlobalCpm = useStrudelStore((state) => state.setCpm);
  const setGlobalBpc = useStrudelStore((state) => state.setBpc);

  const handleCpmChange = (value: number[]) => {
    setGlobalCpm(value[0].toString());
  };

  const handleBpcChange = (value: number[]) => {
    setGlobalBpc(value[0].toString());
  };

  const bpm = parseInt(globalCpm) || 120;
  const bpc = parseInt(globalBpc) || 4;

  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border min-w-48">
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-base font-medium text-card-foreground">
            BPM: {bpm}
          </label>
          <Slider
            value={[bpm]}
            onValueChange={handleCpmChange}
            min={1}
            max={200}
            step={1}
            className="w-full pt-2"
          />
        </div>

        <div>
          <label className="text-base font-medium text-card-foreground pb-2">
            BPC: {bpc}
          </label>
          <Slider
            value={[bpc]}
            onValueChange={handleBpcChange}
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
