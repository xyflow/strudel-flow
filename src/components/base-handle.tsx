import { forwardRef } from 'react';
import { Handle, HandleProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

export type BaseHandleProps = HandleProps;
export const BaseHandle = forwardRef<HTMLDivElement, BaseHandleProps>(
  ({ className, children, ...props }, ref) => (
    <Handle ref={ref} {...props}
      className={cn('size-3! rounded-full! border-[3px]! border-muted-foreground/50! bg-background! transition-colors hover:border-primary! hover:bg-primary! after:absolute after:-inset-2 after:rounded-full', className)}
    >{children}</Handle>
  ),
);
BaseHandle.displayName = 'BaseHandle';
