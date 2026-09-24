import { SelectItem } from '@/components/ui/select';
import { SoundCategory } from '@/data/sounds';

export function CategorySelectItems({ categories }: { categories: SoundCategory[] }) {
  return (
    <>
      {categories.map((cat) => (
        <div key={cat.label}>
          <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">
            {cat.label}
          </div>
          {cat.options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </div>
      ))}
    </>
  );
}
