import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ children, className, variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) {
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-green-600 text-white hover:bg-green-700',
    secondary: 'border border-green-200 bg-green-50 text-green-800 hover:bg-green-100',
    ghost: 'bg-transparent text-stone-700 hover:bg-stone-100',
  };

  return (
    <button
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-2xl px-5 font-bold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
