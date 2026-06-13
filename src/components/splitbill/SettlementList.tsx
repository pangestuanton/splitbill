import { ArrowRight, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Settlement } from '@/types';

interface SettlementListProps {
  settlements: Settlement[];
}

export function SettlementList({ settlements }: SettlementListProps) {
  if (settlements.length === 0) {
    return (
      <div className="rounded-2xl bg-green-50 p-4 text-center">
        <p className="text-sm font-semibold text-green-800">
          Semua peserta sudah lunas! Tidak ada transfer yang perlu dilakukan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {settlements.map((settlement, index) => (
        <div
          key={`${settlement.fromParticipantId}-${settlement.toParticipantId}-${index}`}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-green-200 bg-green-50/50 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid size-8 place-items-center rounded-xl bg-green-100 text-green-700 shrink-0">
              <Wallet size={16} />
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-800 min-w-0">
              <span className="truncate max-w-[100px] text-stone-900">{settlement.fromName}</span>
              <ArrowRight size={14} className="text-stone-400 shrink-0" />
              <span className="truncate max-w-[100px] text-stone-900">{settlement.toName}</span>
            </div>
          </div>
          <div className="sm:text-right shrink-0">
            <span className="text-base font-black text-green-950">
              {formatCurrency(settlement.amount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
