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
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-red-100 bg-white p-8 text-center shadow-[0_14px_40px_rgba(127,29,29,0.08)]">
      <div className="grid size-14 place-items-center rounded-3xl bg-red-50 text-red-600">
        <AlertCircle size={24} />
      </div>
      <h3 className="mt-4 text-lg font-black text-red-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-red-700/80 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6 text-sm bg-red-600 text-white hover:bg-red-700">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
