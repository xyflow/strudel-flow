import { cn } from '@/lib/utils';

type ControlButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  variant?: 'default' | 'menu';
};

export function ControlButton({
  active = false,
  variant = 'default',
  className,
  children,
  ...props
}: ControlButtonProps) {
  return (
    <button
      className={cn(
        'p-2 rounded transition-colors',
        variant === 'menu'
          ? 'bg-card border shadow-sm hover:bg-accent'
          : active
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
