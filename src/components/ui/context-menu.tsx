import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import type { ComponentProps } from 'react';

export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuItem = ContextMenuPrimitive.Item;

export function ContextMenuContent(props: ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content {...props} />
    </ContextMenuPrimitive.Portal>
  );
}
