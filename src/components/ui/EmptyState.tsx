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
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-stone-200 bg-white p-8 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-green-50 text-green-700">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-lg font-black text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction} className="mt-6 min-h-10 text-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
