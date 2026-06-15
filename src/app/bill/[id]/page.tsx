'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Dice5,
  Edit3,
  RefreshCw,
  ReceiptText,
  Share2,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { MemberForm } from '@/components/splitbill/MemberForm';
import { MemberList } from '@/components/splitbill/MemberList';
import { ExpenseForm } from '@/components/splitbill/ExpenseForm';
import { ExpenseList } from '@/components/splitbill/ExpenseList';
import { AiSummaryCard } from '@/components/splitbill/AiSummaryCard';
import { ReceiptScanner } from '@/components/splitbill/ReceiptScanner';
import { ReceiptReview } from '@/components/splitbill/ReceiptReview';
import { SplitResultPanel } from '@/components/splitbill/SplitResultPanel';

import {
  getFullGroupData,
  createMember,
  deleteMember,
  createExpense,
  deleteExpense,
  updateExpense,
} from '@/lib/supabaseQueries';
import { calculateGroupSplit } from '@/lib/splitBill';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Group, Member, Expense, ExpenseParticipant } from '@/types';

interface ScannedItem {
  name: string;
  amount: number;
}

interface ScannedReceiptResult {
  merchant?: string | null;
  date?: string | null;
  items: ScannedItem[];
  subtotal?: number;
  tax?: number;
  service?: number;
  discount?: number;
  total?: number;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function BillDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseParticipants, setExpenseParticipants] = useState<ExpenseParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<ScannedReceiptResult | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledName, setShuffledName] = useState('');
  const [winner, setWinner] = useState('');

  const loadData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const data = await getFullGroupData(id);
      setGroup(data.group);
      setMembers(data.members);
      setExpenses(data.expenses);
      setExpenseParticipants(data.expenseParticipants);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, 'Gagal memuat data split bill.'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      void loadData(true);
    }
  }, [id, loadData]);

  const handleAddMember = async (name: string) => {
    await createMember(id, name);
    await loadData();
  };

  const handleDeleteMember = async (memberId: string) => {
    await deleteMember(memberId);
    await loadData();
  };

  const handleAddExpense = async (data: {
    title: string;
    amount: number;
    paid_by_member_id: string;
    participantIds: string[];
  }) => {
    await createExpense(
      {
        group_id: id,
        paid_by_member_id: data.paid_by_member_id,
        title: data.title,
        amount: data.amount,
      },
      data.participantIds,
    );
    await loadData();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId);
    await loadData();
  };

  const handleUpdateExpense = async (
    expenseId: string,
    expense: { title: string; amount: number; paid_by_member_id: string },
    participantIds: string[],
  ) => {
    await updateExpense(expenseId, expense, participantIds);
    await loadData();
  };

  const handleConfirmScan = async (
    expensesToCreate: Array<{
      title: string;
      amount: number;
      paid_by_member_id: string;
      participantIds: string[];
    }>,
  ) => {
    for (const exp of expensesToCreate) {
      await createExpense(
        {
          group_id: id,
          paid_by_member_id: exp.paid_by_member_id,
          title: exp.title,
          amount: exp.amount,
        },
        exp.participantIds,
      );
    }
    setScannedResult(null);
    await loadData();
  };

  const handleCopyShareLink = async () => {
    const shareLink = `${window.location.origin}/share/${id}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleRoulette = () => {
    if (members.length === 0) return;

    setIsShuffling(true);
    setWinner('');
    let count = 0;
    const interval = window.setInterval(() => {
      const tempRandom = members[Math.floor(Math.random() * members.length)];
      setShuffledName(tempRandom.name);
      count += 1;
      if (count > 12) {
        window.clearInterval(interval);
        setIsShuffling(false);
        const luckyWinner = members[Math.floor(Math.random() * members.length)];
        setShuffledName(luckyWinner.name);
        setWinner(luckyWinner.name);
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <LoadingState message="Memuat data detail patungan..." />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen py-12">
        <Container className="max-w-xl">
          <ErrorState
            title="Gagal Memuat Halaman"
            description={error || 'Grup tidak ditemukan. Harap pastikan link atau ID grup Anda benar.'}
            actionLabel="Kembali ke Beranda"
            onAction={() => router.push('/')}
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

  if (scannedResult) {
    return (
      <main className="min-h-screen py-8">
        <Container className="max-w-3xl">
          <ReceiptReview
            scannedResult={scannedResult}
            members={members}
            onConfirm={handleConfirmScan}
            onCancel={() => setScannedResult(null)}
          />
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 sm:py-10">
      <Container className="max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 transition hover:text-green-700"
          >
            <ArrowLeft size={16} />
            Riwayat Sesi
          </Link>

          <Button
            variant="ghost"
            onClick={() => loadData()}
            className="min-h-10 rounded-xl px-3 text-xs text-stone-500"
            title="Segarkan Data"
          >
            <RefreshCw size={14} />
            Segarkan
          </Button>
        </div>

        <section className="mb-6 overflow-hidden rounded-[32px] border border-green-200/80 bg-white shadow-[0_20px_60px_rgba(22,101,52,0.10)]">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-green-800">
                <ReceiptText size={14} />
                SplitBill Sesi
              </span>
              <h1 className="mt-3 break-words text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                {group.name}
              </h1>
              {group.description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-500">{group.description}</p>
              )}
              <p className="mt-3 text-xs font-semibold text-stone-400">
                Dibuat pada{' '}
                {new Date(group.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Link href={`/bill/${id}/edit`}>
                <Button variant="secondary" className="w-full min-h-11 rounded-2xl text-sm">
                  <Edit3 size={16} />
                  Edit Sesi
                </Button>
              </Link>

              <Button onClick={handleCopyShareLink} className="w-full min-h-11 rounded-2xl text-sm">
                {shareCopied ? (
                  <>
                    <Check size={16} />
                    Link Disalin
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    Bagikan
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 border-t border-stone-100 bg-stone-50/70 p-4 sm:grid-cols-3 sm:p-5">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-stone-400">Total saat ini</p>
              <p className="mt-1 text-xl font-black text-stone-950">{formatCurrency(splitResult.total)}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-stone-400">Anggota</p>
              <p className="mt-1 text-xl font-black text-stone-950">{members.length} orang</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-stone-400">Item tagihan</p>
              <p className="mt-1 text-xl font-black text-stone-950">{expenses.length} item</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-7">
            <Card className="space-y-5 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
                    <UsersRound size={20} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-black text-stone-950">1. Anggota kelompok</h2>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      Tambahkan semua orang yang ikut patungan sebelum memasukkan item.
                    </p>
                  </div>
                </div>
              </div>
              <MemberForm onAddMember={handleAddMember} />
              <MemberList members={members} onDeleteMember={handleDeleteMember} />
            </Card>

            {members.length >= 2 ? (
              <ReceiptScanner onScanCompleted={setScannedResult} />
            ) : (
              <Card className="border-dashed border-green-200 bg-green-50/60 p-5 text-center">
                <Sparkles className="mx-auto text-green-700" size={24} />
                <h3 className="mt-3 text-sm font-black text-green-950">Scanner aktif setelah ada 2 anggota</h3>
                <p className="mt-1 text-xs leading-5 text-green-800/80">
                  Tambahkan minimal dua anggota agar hasil scan struk bisa langsung dibagi.
                </p>
              </Card>
            )}

            <Card className="space-y-6 p-5 sm:p-6">
              <div className="flex items-start gap-3 border-b border-stone-100 pb-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
                  <ReceiptText size={20} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-stone-950">2. Daftar tagihan dan item</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Isi item manual atau review hasil scanner, lalu pilih pembayar dan penanggungnya.
                  </p>
                </div>
              </div>

              <ExpenseForm members={members} onSubmitExpense={handleAddExpense} />

              <div className="border-t border-stone-100 pt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-stone-900">Pengeluaran terdaftar</h3>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-black text-stone-500">
                    {expenses.length} item
                  </span>
                </div>
                <ExpenseList
                  expenses={expenses}
                  members={members}
                  expenseParticipants={expenseParticipants}
                  onDeleteExpense={handleDeleteExpense}
                  onUpdateExpense={handleUpdateExpense}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-5 lg:sticky lg:top-24">
            <SplitResultPanel result={splitResult} />

            {members.length >= 2 && expenses.length >= 1 && (
              <AiSummaryCard
                groupName={group.name}
                total={splitResult.total}
                participants={membersWithBalances}
                settlements={splitResult.settlements}
              />
            )}

            {members.length >= 2 && (
              <Card className="space-y-4 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
                    <Dice5 size={20} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-stone-950">Roulette pembayar</h3>
                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      Fitur ringan untuk memilih satu orang secara acak jika kelompok ingin satu pembayar utama.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleRoulette}
                  className="w-full min-h-11 border border-green-200 bg-green-50 text-sm text-green-800 hover:bg-green-100"
                  disabled={isShuffling}
                >
                  {isShuffling ? 'Mengocok...' : 'Kocok satu pembayar'}
                </Button>

                {shuffledName && (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-center">
                    {isShuffling ? (
                      <p className="text-sm font-bold text-stone-600">{shuffledName}</p>
                    ) : (
                  <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-400">Anggota terpilih</p>
                        <p className="mt-1 text-lg font-black text-green-700">{winner}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
