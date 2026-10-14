import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const BaseNode = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'nokey relative min-w-56 rounded-lg border border-border/80 dark:border-[var(--patch-border)] bg-card p-1 text-card-foreground shadow-[0_1px_6px_rgb(0_0_0/0.07)] dark:shadow-[0_1px_6px_rgb(0_0_0/0.16)] transition-colors hover:border-muted-foreground/40 dark:hover:border-[var(--patch-border-hover)] [&_button]:cursor-pointer',
      '[.react-flow__node.selected_&]:border-primary/60 [.react-flow__node.selected_&]:ring-1 [.react-flow__node.selected_&]:ring-primary/20',
      className,
    )}
    {...props}
  />
));
BaseNode.displayName = 'BaseNode';
