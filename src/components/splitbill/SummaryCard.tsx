import type { SplitBillResult } from '@/types/splitbill';
import { formatCurrency } from '@/lib/format';

interface SummaryCardProps {
  result: SplitBillResult;
}

export function SummaryCard({ result }: SummaryCardProps) {
  return (
    <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-[0_14px_40px_rgba(22,101,52,0.08)]">
      <div className="leaf-gradient rounded-[22px] p-5 text-white">
        <p className="text-sm opacity-90">Total Tagihan</p>
        <p className="mt-2 text-3xl font-black">{formatCurrency(result.total)}</p>
      </div>
      <div className="mt-5 space-y-3">
        {result.settlements.length === 0 ? (
          <p className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">Semua peserta sudah lunas.</p>
        ) : (
          result.settlements.map((settlement) => (
            <div key={`${settlement.fromParticipantId}-${settlement.toParticipantId}`} className="rounded-2xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm text-green-800">
                {settlement.fromName} transfer ke {settlement.toName}
              </p>
              <p className="text-xl font-black text-green-900">{formatCurrency(settlement.amount)}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
