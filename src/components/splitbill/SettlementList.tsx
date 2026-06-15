import { ArrowRight, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Settlement } from '@/types';

interface SettlementListProps {
  settlements: Settlement[];
}

export function SettlementList({ settlements }: SettlementListProps) {
  if (settlements.length === 0) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm font-bold text-green-800">
          Semua peserta sudah lunas! Tidak ada transfer yang perlu dilakukan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {settlements.map((settlement, index) => (
        <div
          key={`${settlement.fromParticipantId}-${settlement.toParticipantId}-${index}`}
          className="rounded-2xl border border-green-200 bg-green-50/70 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white text-green-700 shadow-sm">
                <Wallet size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-green-700">Transfer</p>
                <div className="mt-1 flex min-w-0 items-center gap-2 text-sm font-black text-stone-900">
                  <span className="max-w-[96px] truncate sm:max-w-[140px]">{settlement.fromName}</span>
                  <ArrowRight size={14} className="shrink-0 text-green-700" />
                  <span className="max-w-[96px] truncate sm:max-w-[140px]">{settlement.toName}</span>
                </div>
              </div>
            </div>
            <span className="shrink-0 text-right text-base font-black text-green-950">
              {formatCurrency(settlement.amount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
