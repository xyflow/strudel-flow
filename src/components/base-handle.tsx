import { forwardRef } from 'react';
import { Handle, HandleProps } from '@xyflow/react';

import { cn } from '@/lib/utils';

export type BaseHandleProps = HandleProps;

export const BaseHandle = forwardRef<HTMLDivElement, BaseHandleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Handle
        ref={ref}
        {...props}
        className={cn(
          'h-[15px] w-[15px] rounded-full border-border  bg-secondary transition dark:border-secondary dark:bg-secondary',
          className
        )}
        {...props}
      >
        {children}
      </Handle>
    );
  }
);

BaseHandle.displayName = 'BaseHandle';
