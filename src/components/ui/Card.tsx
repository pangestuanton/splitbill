import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('rounded-[24px] border border-stone-200 bg-white p-5 shadow-[0_14px_40px_rgba(22,101,52,0.08)]', className)} {...props}>
      {children}
    </div>
  );
}
