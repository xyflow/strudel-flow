import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

interface PresetButtonProps extends React.ComponentProps<typeof Button> {
  isActive: boolean;
}

function PresetButton({ isActive, className, ...props }: PresetButtonProps) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      className={cn('h-8 text-xs', className)}
      {...props}
    />
  );
}

type Preset = {
  label: string;
  [key: string]: any;
};

interface PresetGroupProps<T extends Preset> {
  label?: string;
  presets: readonly T[];
  selectedValue: string | number;
  onSelect: (id: T[keyof T]) => void;
  gridColsClass?: string;
  buttonClassName?: string;
  idKey?: keyof T;
}

export function PresetGroup<T extends Preset>({
  label,
  presets,
  selectedValue,
  onSelect,
  gridColsClass = 'grid-cols-4',
  buttonClassName,
  idKey = 'id',
}: PresetGroupProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-mono font-medium">{label}</label>
      )}
      <div className={`grid ${gridColsClass} gap-1`}>
        {presets.map((preset) => {
          const id = preset[idKey];
          return (
            <PresetButton
              key={id}
              isActive={selectedValue === id}
              onClick={() => onSelect(id)}
              className={buttonClassName}
            >
              {preset.label}
            </PresetButton>
          );
        })}
      </div>
    </div>
  );
}
