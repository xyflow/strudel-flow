import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { getContextMenuValue, parseContextMenuValue } from './cell-state-utils';
import { CellState } from './';
import { ReactNode } from 'react';

export interface ModifierContextMenuProps {
  children: ReactNode;
  currentState: CellState;
  onModifierSelect: (modifier: CellState) => void;
  label?: string;
}

// Map of modifier options organized by category
const MODIFIER_OPTIONS = {
  basic: [
    { value: 'off', label: 'Off' },
    { value: 'normal', label: 'Normal' },
  ],
  replicate: [
    { value: 'replicate-2', label: '!2 (×2)' },
    { value: 'replicate-3', label: '!3 (×3)' },
    { value: 'replicate-4', label: '!4 (×4)' },
  ],
  slow: [
    { value: 'slow-2', label: '/2 (Half speed)' },
    { value: 'slow-3', label: '/3 (Third speed)' },
    { value: 'slow-4', label: '/4 (Quarter speed)' },
  ],
  elongate: [
    { value: 'elongate-2', label: '@2 (2x longer)' },
    { value: 'elongate-3', label: '@3 (3x longer)' },
    { value: 'elongate-4', label: '@4 (4x longer)' },
  ],
  speed: [
    { value: 'speed-2', label: '*2 (Double speed)' },
    { value: 'speed-3', label: '*3 (Triple speed)' },
    { value: 'speed-4', label: '*4 (Quad speed)' },
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
          {/* Basic options */}
          {MODIFIER_OPTIONS.basic.map((option) => (
            <ContextMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </ContextMenuRadioItem>
          ))}

          <ContextMenuSeparator />

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
