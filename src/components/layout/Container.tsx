import type { PropsWithChildren, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Container({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4', className)} {...props}>
      {children}
    </div>
  );
}
