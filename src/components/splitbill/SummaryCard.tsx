import type { SplitBillResult } from '@/types/splitbill';
import { formatCurrency } from '@/lib/format';
import { SettlementList } from './SettlementList';

interface SummaryCardProps {
  result: SplitBillResult;
}

export function SummaryCard({ result }: SummaryCardProps) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_14px_40px_rgba(22,101,52,0.08)]">
      <div className="leaf-gradient rounded-[24px] p-5 text-white">
        <p className="text-xs font-black uppercase tracking-[0.18em] opacity-90">Total Tagihan</p>
        <p className="mt-2 text-4xl font-black tracking-tight">{formatCurrency(result.total)}</p>
      </div>
      <div className="mt-5">
        <SettlementList settlements={result.settlements} />
      </div>
    </section>
  );
}
