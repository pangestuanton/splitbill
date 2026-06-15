import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-950 shadow-sm outline-none transition duration-200 placeholder:text-stone-400 focus:border-green-400 focus:ring-4 focus:ring-green-500/15 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400',
        className,
      )}
      {...props}
    />
  );
}
