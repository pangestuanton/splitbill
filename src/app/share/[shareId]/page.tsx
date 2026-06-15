'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Eye, PlusCircle, Receipt, ReceiptText } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { AiSummaryCard } from '@/components/splitbill/AiSummaryCard';
import { SplitResultPanel } from '@/components/splitbill/SplitResultPanel';
import { getFullGroupData } from '@/lib/supabaseQueries';
import { calculateGroupSplit } from '@/lib/splitBill';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Group, Member, Expense, ExpenseParticipant } from '@/types';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ShareBillPage() {
  const { shareId } = useParams() as { shareId: string };
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseParticipants, setExpenseParticipants] = useState<ExpenseParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShareData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getFullGroupData(shareId);
      setGroup(data.group);
      setMembers(data.members);
      setExpenses(data.expenses);
      setExpenseParticipants(data.expenseParticipants);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, 'Gagal memuat hasil split bill.'));
    } finally {
      setIsLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    if (shareId) {
      void fetchShareData();
    }
  }, [shareId, fetchShareData]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <LoadingState message="Memuat hasil patungan..." />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen py-12">
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

  const splitResult = calculateGroupSplit(group, members, expenses, expenseParticipants);
  const membersWithBalances = splitResult.participants.map((participant) => ({
    name: participant.name,
    totalOwed: participant.totalOwed,
    paid: participant.paid,
    balance: participant.balance,
  }));

  const getMemberName = (id: string) => {
    return members.find((member) => member.id === id)?.name || 'Anggota terhapus';
  };

  return (
    <main className="min-h-screen py-8 sm:py-10">
      <Container className="max-w-5xl">
        <div className="mb-6 rounded-[24px] border border-green-200 bg-green-50 p-4 text-green-950 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-green-700 shadow-sm">
                <Eye size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black">Mode read-only</p>
                <p className="mt-1 text-xs leading-5 text-green-800/80">
                  Anda sedang melihat hasil patungan yang dibagikan. Detail tidak bisa diedit dari halaman ini.
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/new')}
              className="min-h-10 shrink-0 rounded-2xl px-4 text-xs"
            >
              <PlusCircle size={15} />
              Buat Milik Anda
            </Button>
          </div>
        </div>

        <section className="mb-6 rounded-[32px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(22,101,52,0.10)] sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-3xl bg-green-50 text-green-700">
              <Receipt size={24} />
            </div>
            <div className="min-w-0">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                Hasil Perhitungan Patungan
              </span>
              <h1 className="mt-3 break-words text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                {group.name}
              </h1>
              {group.description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-500">{group.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-stone-400">
                <Calendar size={14} />
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
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-7">
            <SplitResultPanel
              result={splitResult}
              title="Ringkasan hasil patungan"
              description="Total, beban anggota, dan instruksi transfer yang bisa langsung diikuti."
            />
          </div>

          <div className="space-y-6 lg:col-span-5">
            <Card className="space-y-4 p-5 sm:p-6">
              <div className="flex items-start gap-3 border-b border-stone-100 pb-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
                  <ReceiptText size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-stone-950">Rincian item tagihan</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Daftar item yang menjadi dasar perhitungan total.
                  </p>
                </div>
              </div>

              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {expenses.map((expense) => {
                  const payerName = getMemberName(expense.paid_by_member_id);
                  const participantNames = expenseParticipants
                    .filter((participant) => participant.expense_id === expense.id)
                    .map((participant) => getMemberName(participant.member_id));

                  return (
                    <article key={expense.id} className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-black text-stone-900">{expense.title}</h4>
                          <p className="mt-1 text-xs leading-5 text-stone-500">Dibayar oleh {payerName}</p>
                        </div>
                        <span className="shrink-0 text-sm font-black text-stone-950">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-stone-500">
                        Penanggung: {participantNames.join(', ') || 'Belum ada'}
                      </p>
                    </article>
                  );
                })}

                {expenses.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-5 text-center">
                    <p className="text-sm font-bold text-stone-500">Belum ada item tagihan.</p>
                  </div>
                )}
              </div>
            </Card>

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
