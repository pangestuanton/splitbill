import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-green-200 bg-white p-8 text-center shadow-[0_14px_40px_rgba(22,101,52,0.08)]">
      <div className="grid size-14 place-items-center rounded-3xl bg-green-50 text-green-700">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-lg font-black text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction} className="mt-6 text-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
