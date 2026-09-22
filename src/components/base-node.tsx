import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const BaseNode = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { selected?: boolean }>(
  ({ className, selected, ...props }, ref) => (
    <div ref={ref} className={cn(
      'relative min-w-56 rounded-lg border border-border/80 bg-card p-3 text-card-foreground  transition-colors hover:border-muted-foreground/40 [&_button]:cursor-pointer',
      '[.react-flow__node.selected_&]:border-primary/60 [.react-flow__node.selected_&]:ring-1 [.react-flow__node.selected_&]:ring-primary/20',
      selected && 'border-primary/60 ring-1 ring-primary/20', className,
    )} {...props} />
  ),
);
BaseNode.displayName = 'BaseNode';
