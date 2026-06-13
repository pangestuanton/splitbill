import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  title = 'Terjadi Kesalahan',
  description,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-red-100 bg-red-50/50 p-8 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-red-100 text-red-600">
        <AlertCircle size={24} />
      </div>
      <h3 className="mt-4 text-lg font-black text-red-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-red-700/80 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6 min-h-10 text-sm bg-red-600 hover:bg-red-700 text-white">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
