import { cn } from '@/lib/utils';

type ControlButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  variant?: 'default' | 'menu';
};

export function ControlButton({ active = false, variant = 'default', className, children, title, ...props }: ControlButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md p-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        variant === 'menu' && 'border bg-card',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        className,
      )}
      {...props}
    >{children}</button>
  );
}
