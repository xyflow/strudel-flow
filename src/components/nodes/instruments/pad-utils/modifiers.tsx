import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  MODIFIER_OPTIONS,
  getModifierDisplay,
  getModifierValue,
  parseModifierValue,
  type CellState,
} from './modifier-utils';

/**
 * ModifierDropdown component props
 */
export interface ModifierDropdownProps {
  currentState: CellState;
  onModifierSelect: (modifier: CellState) => void;
  label?: string;
}

/**
 * ModifierDropdown component for selecting column modifiers
 */
export function ModifierDropdown({
  currentState,
  onModifierSelect,
  label = 'Modifiers',
}: ModifierDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayText = getModifierDisplay(currentState);
  const currentValue = getModifierValue(currentState);

  const handleValueChange = (value: string) => {
    const newModifier = parseModifierValue(value);
    onModifierSelect(newModifier);
    setIsOpen(false);
  };

  const handleClear = () => {
    onModifierSelect({ type: 'off' });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`w-12 h-10 transition-all duration-150 rounded-md text-xs font-mono select-none ${
            currentState.type === 'off'
              ? 'bg-card-foreground/20 hover:bg-popover-foreground/50'
              : 'bg-accent'
          }`}
        >
          {displayText || '○'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2" align="start">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground px-2">
            {label}
          </div>

          {/* Clear option */}
          <button
            className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-muted transition-colors ${
              currentState.type === 'off' ? 'bg-muted font-medium' : ''
            }`}
            onClick={handleClear}
          >
            None
          </button>

          {/* Dynamic modifier options */}
          {Object.entries(MODIFIER_OPTIONS).map(([type, options]) => (
            <div key={type} className="border-t pt-2">
              <div className="text-xs font-medium text-muted-foreground px-2 mb-1">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
              {options.map((option) => (
                <button
                  key={option.value}
                  className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-muted transition-colors ${
                    currentValue === option.value ? 'bg-muted font-medium' : ''
                  }`}
                  onClick={() => handleValueChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
