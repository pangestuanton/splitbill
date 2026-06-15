import { ReceiptText, UsersRound } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatCurrency';
import type { SplitBillResult } from '@/types';
import { SettlementList } from './SettlementList';

interface SplitResultPanelProps {
  result: SplitBillResult;
  title?: string;
  description?: string;
}

function getBalanceBadge(balance: number) {
  if (balance > 0) {
    return {
      label: `Terima ${formatCurrency(balance)}`,
      className: 'bg-green-100 text-green-800',
    };
  }

  if (balance < 0) {
    return {
      label: `Bayar ${formatCurrency(Math.abs(balance))}`,
      className: 'bg-amber-100 text-amber-800',
    };
  }

  return {
    label: 'Lunas',
    className: 'bg-stone-100 text-stone-600',
  };
}

export function SplitResultPanel({
  result,
  title = 'Ringkasan dan hasil patungan',
  description = 'Lihat total bersih, beban per anggota, dan instruksi transfer.',
}: SplitResultPanelProps) {
  const breakdown = [
    { label: 'Subtotal', value: result.subtotal },
    { label: 'Pajak', value: result.tax, hideWhenZero: true },
    { label: 'Service', value: result.service, hideWhenZero: true },
    { label: 'Diskon', value: result.discount, hideWhenZero: true, negative: true },
    { label: 'Lain-lain', value: result.extraFee, hideWhenZero: true },
  ].filter((item) => !item.hideWhenZero || item.value > 0);

  return (
    <Card className="space-y-5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
          <ReceiptText size={20} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-black text-stone-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-stone-500">{description}</p>
        </div>
      </div>

      <div className="leaf-gradient overflow-hidden rounded-[26px] p-5 text-white shadow-[0_18px_42px_rgba(22,101,52,0.18)]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/82">Total tagihan bersih</p>
        <p className="mt-2 text-4xl font-black tracking-tight">{formatCurrency(result.total)}</p>
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/20 pt-4 sm:grid-cols-3">
          {breakdown.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/12 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/70">{item.label}</p>
              <p className="mt-1 text-sm font-black">
                {item.negative ? '-' : ''}
                {formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UsersRound size={18} className="text-green-700" />
            <h4 className="text-sm font-black text-stone-900">Beban per anggota</h4>
          </div>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-black text-stone-500">
            {result.participants.length} orang
          </span>
        </div>

        <div className="space-y-2">
          {result.participants.map((participant) => {
            const badge = getBalanceBadge(participant.balance);
            return (
              <div
                key={participant.participantId}
                className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-stone-950">{participant.name}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      Bayar {formatCurrency(participant.paid)}. Beban {formatCurrency(participant.totalOwed)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 border-t border-stone-100 pt-5">
        <div>
          <h4 className="text-sm font-black text-stone-900">Rekomendasi transfer</h4>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Instruksi dibuat agar jumlah transfer tetap sesedikit mungkin.
          </p>
        </div>
        <SettlementList settlements={result.settlements} />
      </section>
    </Card>
  );
}
