import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Simple type - just track what modifier is selected
export type CellState = { type: 'off' } | { type: 'modifier'; value: string }; // value like "!2", "/3", "@4", "*2"

// Simple options grouped by type
const MODIFIER_GROUPS = {
  Replicate: [
    { value: '!2', label: '!2' },
    { value: '!3', label: '!3' },
    { value: '!4', label: '!4' },
  ],
  Slow: [
    { value: '/2', label: '/2' },
    { value: '/3', label: '/3' },
    { value: '/4', label: '/4' },
  ],
  Elongate: [
    { value: '@2', label: '@2' },
    { value: '@3', label: '@3' },
    { value: '@4', label: '@4' },
  ],
  Speed: [
    { value: '*2', label: '*2' },
    { value: '*3', label: '*3' },
    { value: '*4', label: '*4' },
  ],
};

export interface ModifierDropdownProps {
  currentState: CellState;
  onModifierSelect: (modifier: CellState) => void;
}

export function ModifierDropdown({
  currentState,
  onModifierSelect,
}: ModifierDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayText =
    currentState.type === 'modifier' ? currentState.value : '○';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`w-12 h-10 transition-all duration-150 rounded-md text-xs font-mono select-none ${
            currentState.type === 'off'
              ? 'bg-card-foreground/20 hover:bg-popover-foreground/50'
              : 'bg-accent text-primary-foreground'
          }`}
        >
          {displayText}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2" align="start">
        <div className="space-y-1">
          <button
            className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-muted ${
              currentState.type === 'off' ? 'bg-muted font-medium' : ''
            }`}
            onClick={() => {
              onModifierSelect({ type: 'off' });
              setIsOpen(false);
            }}
          >
            None
          </button>

          {Object.entries(MODIFIER_GROUPS).map(([groupName, modifiers]) => (
            <div key={groupName} className="border-t pt-2">
              <div className="text-xs font-medium text-muted-foreground px-2 mb-1">
                {groupName}
              </div>
              {modifiers.map((mod) => (
                <button
                  key={mod.value}
                  className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-muted ${
                    currentState.type === 'modifier' &&
                    currentState.value === mod.value
                      ? 'bg-muted font-medium'
                      : ''
                  }`}
                  onClick={() => {
                    onModifierSelect({ type: 'modifier', value: mod.value });
                    setIsOpen(false);
                  }}
                >
                  {mod.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
