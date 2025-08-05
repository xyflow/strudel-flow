import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { getContextMenuValue, parseContextMenuValue, CellState } from './';
import { ReactNode } from 'react';

export interface ModifierContextMenuProps {
  children: ReactNode;
  currentState: CellState;
  onModifierSelect: (modifier: CellState) => void;
  label?: string;
}

const MODIFIER_OPTIONS = {
  replicate: [
    { value: 'replicate-2', label: '!2' },
    { value: 'replicate-3', label: '!3' },
    { value: 'replicate-4', label: '!4' },
  ],
  slow: [
    { value: 'slow-2', label: '/2' },
    { value: 'slow-3', label: '/3' },
    { value: 'slow-4', label: '/4' },
  ],
  elongate: [
    { value: 'elongate-2', label: '@2' },
    { value: 'elongate-3', label: '@3' },
    { value: 'elongate-4', label: '@4' },
  ],
  speed: [
    { value: 'speed-2', label: '*2' },
    { value: 'speed-3', label: '*3' },
    { value: 'speed-4', label: '*4' },
  ],
};

export function ModifierContextMenu({
  children,
  currentState,
  onModifierSelect,
  label = 'Modifiers',
}: ModifierContextMenuProps) {
  const handleValueChange = (value: string) => {
    const newModifier = parseContextMenuValue(value);
    onModifierSelect(newModifier);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuLabel>{label}</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup
          value={getContextMenuValue(currentState)}
          onValueChange={handleValueChange}
        >
          {/* Replicate options */}
          <ContextMenuLabel>Replicate</ContextMenuLabel>
          {MODIFIER_OPTIONS.replicate.map((option) => (
            <ContextMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </ContextMenuRadioItem>
          ))}

          <ContextMenuSeparator />

          {/* Slow options */}
          <ContextMenuLabel>Slow</ContextMenuLabel>
          {MODIFIER_OPTIONS.slow.map((option) => (
            <ContextMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </ContextMenuRadioItem>
          ))}

          <ContextMenuSeparator />

          {/* Elongate options */}
          <ContextMenuLabel>Elongate</ContextMenuLabel>
          {MODIFIER_OPTIONS.elongate.map((option) => (
            <ContextMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </ContextMenuRadioItem>
          ))}

          <ContextMenuSeparator />

          {/* Speed options */}
          <ContextMenuLabel>Speed</ContextMenuLabel>
          {MODIFIER_OPTIONS.speed.map((option) => (
            <ContextMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
