import { useStrudelStore } from '@/store/strudel-store';
import { Slider } from '@/components/ui/slider';

export function CPM() {
  const globalCpm = useStrudelStore((state) => state.cpm);
  const setGlobalCpm = useStrudelStore((state) => state.setCpm);

  const handleCpmChange = (value: number[]) => {
    setGlobalCpm(value[0].toString());
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border min-w-48">
      <label className="text-base font-medium text-card-foreground">
        BPM: {globalCpm}
      </label>
      <div className="flex gap-3">
        <div className="flex flex-col w-full">
          <Slider
            value={[parseInt(globalCpm) || 60]}
            onValueChange={handleCpmChange}
            min={1}
            max={140}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
