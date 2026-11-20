import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DEFAULT_MODIFIER_GROUPS,
  type CellState,
  type ModifierGroups,
} from './modifier-options';

interface ModifierDropdownProps {
  currentState: CellState;
  onModifierSelect: (modifier: CellState) => void;
  modifierGroups?: ModifierGroups;
}

export function ModifierDropdown({
  currentState,
  onModifierSelect,
  modifierGroups,
}: ModifierDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayText =
    currentState.type === 'modifier' ? currentState.value : '○';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={
            currentState.type === 'off'
              ? 'Step variation'
              : `Step variation ${currentState.value}`
          }
          className={`w-12 h-6 transition-colors duration-150 rounded-lg text-[10px] font-mono select-none ${
            currentState.type === 'off'
              ? 'text-muted-foreground/50 hover:bg-muted hover:text-foreground'
              : 'bg-primary/15 text-primary'
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

          {Object.entries(modifierGroups || DEFAULT_MODIFIER_GROUPS).map(
            ([groupName, modifiers]) => (
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
            ),
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
