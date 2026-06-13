'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Receipt, Users, DollarSign, Calendar } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SettlementList } from '@/components/splitbill/SettlementList';
import { AiSummaryCard } from '@/components/splitbill/AiSummaryCard';
import { getFullGroupData } from '@/lib/supabaseQueries';
import { calculateGroupSplit } from '@/lib/splitBill';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Group, Member, Expense, ExpenseParticipant } from '@/types';

export default function ShareBillPage() {
  const { shareId } = useParams() as { shareId: string };
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseParticipants, setExpenseParticipants] = useState<ExpenseParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShareData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getFullGroupData(shareId);
      setGroup(data.group);
      setMembers(data.members);
      setExpenses(data.expenses);
      setExpenseParticipants(data.expenseParticipants);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat hasil split bill.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shareId) fetchShareData();
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
        <LoadingState message="Memuat hasil patungan..." />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
        <Container className="max-w-xl">
          <ErrorState
            title="Data Tidak Ditemukan"
            description={error || 'Hasil split bill tidak ditemukan atau ID salah.'}
            actionLabel="Buat Split Bill Baru"
            onAction={() => router.push('/new')}
          />
        </Container>
      </div>
    );
  }

  // Calculate split calculations
  const splitResult = calculateGroupSplit(group, members, expenses, expenseParticipants);

  // Map member records to balance/summary info
  const membersWithBalances = splitResult.participants.map((p) => {
    return {
      name: p.name,
      totalOwed: p.totalOwed,
      paid: p.paid,
      balance: p.balance,
    };
  });

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'Anggota Terhapus';
  };

  return (
    <main className="min-h-screen bg-stone-50 py-8">
      <Container className="max-w-3xl">
        {/* Read-only notification header */}
        <div className="rounded-2xl bg-stone-900 text-stone-200 px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-4 mb-6 shadow-sm">
          <span>👀 Anda sedang melihat halaman hasil read-only yang dibagikan.</span>
          <Button
            onClick={() => router.push('/new')}
            className="min-h-7 px-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-black shrink-0"
          >
            Buat Milik Anda
          </Button>
        </div>

        {/* Group Info Header Card */}
        <Card className="p-6 border-stone-200 bg-white mb-6">
          <div className="flex items-start gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-green-100 text-green-700 shrink-0">
              <Receipt size={24} />
            </div>
            <div>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-black text-green-700">
                Hasil Perhitungan Patungan
              </span>
              <h1 className="mt-2 text-2xl font-black text-stone-900">{group.name}</h1>
              {group.description && (
                <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                  {group.description}
                </p>
              )}
              <div className="mt-2.5 flex items-center gap-2 text-[10px] text-stone-400">
                <Calendar size={12} />
                <span>
                  {new Date(group.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Calculation summary (the main green card) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Main Results Column */}
          <div className="md:col-span-7 space-y-6">
            {/* Split Result / Summary Calculations */}
            <Card className="p-5 border-stone-200 bg-white">
              <h3 className="text-sm font-black text-stone-900 mb-4 border-b border-stone-100 pb-2">
                Ringkasan Hasil Perhitungan
              </h3>

              {/* Green total card */}
              <div className="leaf-gradient rounded-[22px] p-5 text-white shadow-md">
                <p className="text-[10px] opacity-90 uppercase font-black tracking-wider">Total Tagihan Patungan</p>
                <p className="mt-1 text-3xl font-black">{formatCurrency(splitResult.total)}</p>
                <div className="mt-3 flex items-center justify-between text-[10px] opacity-90 border-t border-white/20 pt-2">
                  <span>Subtotal: {formatCurrency(splitResult.subtotal)}</span>
                  {splitResult.tax > 0 && <span>Pajak: {formatCurrency(splitResult.tax)}</span>}
                  {splitResult.service > 0 && <span>Servis: {formatCurrency(splitResult.service)}</span>}
                  {splitResult.discount > 0 && <span>Diskon: -{formatCurrency(splitResult.discount)}</span>}
                  {splitResult.extraFee > 0 && <span>Lain-lain: {formatCurrency(splitResult.extraFee)}</span>}
                </div>
              </div>

              {/* Members Owed & Paid breakdown */}
              {members.length > 0 && (
                <div className="mt-5 space-y-2">
                  <h4 className="font-bold text-stone-800 text-xs">Rincian Beban:</h4>
                  <div className="divide-y divide-stone-100">
                    {splitResult.participants.map((p) => (
                      <div key={p.participantId} className="flex justify-between items-center py-2 text-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-stone-400">
                            Bayar: {formatCurrency(p.paid)} • Beban: {formatCurrency(p.totalOwed)}
                          </p>
                        </div>
                        <span
                          className={`font-black shrink-0 px-2 py-0.5 rounded-full text-[10px] ${
                            p.balance > 0
                              ? 'bg-green-100 text-green-800'
                              : p.balance < 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {p.balance > 0
                            ? `Terima ${formatCurrency(p.balance)}`
                            : p.balance < 0
                            ? `Bayar ${formatCurrency(Math.abs(p.balance))}`
                            : 'Lunas'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Settlement matching */}
            <Card className="p-5 border-stone-200 bg-white">
              <h3 className="text-sm font-black text-stone-900 mb-4 border-b border-stone-100 pb-2">
                Rekomendasi Transfer Penyelesaian
              </h3>
              <SettlementList settlements={splitResult.settlements} />
            </Card>
          </div>

          {/* Details & Sharing Column */}
          <div className="md:col-span-5 space-y-6">
            {/* List of expenses (items breakdown) */}
            <Card className="p-5 border-stone-200 bg-white">
              <h3 className="text-sm font-black text-stone-900 mb-3 border-b border-stone-100 pb-2 flex items-center gap-1.5">
                <DollarSign size={16} className="text-stone-400" />
                Rincian Item Tagihan
              </h3>
              <div className="divide-y divide-stone-100 max-h-[280px] overflow-y-auto pr-1">
                {expenses.map((expense) => {
                  const payerName = getMemberName(expense.paid_by_member_id);
                  const participantNames = expenseParticipants
                    .filter((ep) => ep.expense_id === expense.id)
                    .map((ep) => getMemberName(ep.member_id));

                  return (
                    <div key={expense.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-stone-800 text-xs truncate">{expense.title}</p>
                        <span className="font-bold text-stone-950 text-xs shrink-0">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-stone-400">
                        Payer: {payerName} • Penanggung: {participantNames.join(', ')}
                      </p>
                    </div>
                  );
                })}
                {expenses.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-4">Belum ada item tagihan.</p>
                )}
              </div>
            </Card>

            {/* AI Summary and Whatsapp text generator */}
            {members.length >= 2 && expenses.length >= 1 && (
              <AiSummaryCard
                groupName={group.name}
                total={splitResult.total}
                participants={membersWithBalances}
                settlements={splitResult.settlements}
              />
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
