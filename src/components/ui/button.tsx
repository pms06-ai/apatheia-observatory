import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  primary:
    'bg-gold/15 text-gold hover:bg-gold/25 focus-visible:ring-gold/40',
  secondary:
    'bg-bg-elevated border border-line text-text-muted hover:border-line-strong hover:text-text-primary focus-visible:ring-line-strong',
  ghost:
    'text-text-muted hover:bg-charcoal-850 hover:text-text-primary focus-visible:ring-line',
  danger:
    'bg-copper/15 text-copper hover:bg-copper/25 focus-visible:ring-copper/40',
} as const;

const sizeStyles = {
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-3.5 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:pointer-events-none disabled:opacity-40',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
