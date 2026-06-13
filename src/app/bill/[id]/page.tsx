'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit3, Share2, ArrowLeft, RefreshCw, Copy, Check } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { MemberForm } from '@/components/splitbill/MemberForm';
import { MemberList } from '@/components/splitbill/MemberList';
import { ExpenseForm } from '@/components/splitbill/ExpenseForm';
import { ExpenseList } from '@/components/splitbill/ExpenseList';
import { SettlementList } from '@/components/splitbill/SettlementList';
import { AiSummaryCard } from '@/components/splitbill/AiSummaryCard';
import { ReceiptScanner } from '@/components/splitbill/ReceiptScanner';
import { ReceiptReview } from '@/components/splitbill/ReceiptReview';

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

export default function BillDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseParticipants, setExpenseParticipants] = useState<ExpenseParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scanner review flow state
  const [scannedResult, setScannedResult] = useState<any | null>(null);

  // Share link copy state
  const [shareCopied, setShareCopied] = useState(false);

  const loadData = async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const data = await getFullGroupData(id);
      setGroup(data.group);
      setMembers(data.members);
      setExpenses(data.expenses);
      setExpenseParticipants(data.expenseParticipants);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data split bill.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData(true);
  }, [id]);

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
    participantIds: string[]
  ) => {
    await updateExpense(expenseId, expense, participantIds);
    await loadData();
  };

  const handleScanCompleted = (result: any) => {
    setScannedResult(result);
  };

  const handleConfirmScan = async (
    expensesToCreate: Array<{
      title: string;
      amount: number;
      paid_by_member_id: string;
      participantIds: string[];
    }>,
  ) => {
    // Insert all expenses
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
        <LoadingState message="Memuat data detail patungan..." />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
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

  // Calculate calculations
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

  // If scanner review mode is active
  if (scannedResult) {
    return (
      <main className="min-h-screen bg-stone-50 py-8">
        <Container className="max-w-2xl">
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
    <main className="min-h-screen bg-stone-50 py-8">
      <Container className="max-w-5xl">
        {/* Navigation row */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-stone-700 transition"
          >
            <ArrowLeft size={16} />
            Riwayat Sesi
          </Link>

          <Button
            variant="ghost"
            onClick={() => loadData()}
            className="min-h-9 px-3 rounded-xl gap-1 text-xs text-stone-500"
            title="Segarkan Data"
          >
            <RefreshCw size={14} />
            Segarkan
          </Button>
        </div>

        {/* Hero Detail Group Card */}
        <Card className="p-6 border-stone-200 bg-white mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-black text-green-700">
                SplitBill Sesi
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black text-stone-900">{group.name}</h1>
              {group.description && (
                <p className="mt-2 text-sm text-stone-500 leading-relaxed max-w-2xl">
                  {group.description}
                </p>
              )}
              <p className="mt-1 text-[11px] text-stone-400">
                Dibuat pada: {new Date(group.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <Link href={`/bill/${id}/edit`}>
                <Button
                  variant="secondary"
                  className="min-h-10 rounded-xl px-3 text-xs gap-1.5 text-green-800 border-green-200 hover:bg-green-50 bg-green-50/20"
                >
                  <Edit3 size={14} />
                  Edit Sesi
                </Button>
              </Link>

              <Button
                onClick={handleCopyShareLink}
                className="min-h-10 rounded-xl px-3 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              >
                {shareCopied ? (
                  <>
                    <Check size={14} />
                    Link Disalin!
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    Bagikan
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* 2 Column Layout: Editor Form vs Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Inputs) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Members Section */}
            <Card className="p-5 border-stone-200 bg-white">
              <h3 className="text-base font-black text-stone-900 mb-3 border-b border-stone-100 pb-2">
                1. Anggota Kelompok
              </h3>
              <div className="space-y-4">
                <MemberForm onAddMember={handleAddMember} />
                <MemberList members={members} onDeleteMember={handleDeleteMember} />
              </div>
            </Card>

            {/* AI Receipt Scanner Section */}
            {members.length >= 2 && (
              <ReceiptScanner onScanCompleted={handleScanCompleted} />
            )}

            {/* Expenses Input & List Section */}
            <Card className="p-5 border-stone-200 bg-white">
              <h3 className="text-base font-black text-stone-900 mb-4 border-b border-stone-100 pb-2">
                2. Daftar Tagihan / Item
              </h3>
              <div className="space-y-6">
                <ExpenseForm members={members} onSubmitExpense={handleAddExpense} />
                <div className="border-t border-stone-100 pt-4">
                  <h4 className="font-bold text-stone-800 text-xs mb-3">Daftar Pengeluaran Terdaftar</h4>
                  <ExpenseList
                    expenses={expenses}
                    members={members}
                    expenseParticipants={expenseParticipants}
                    onDeleteExpense={handleDeleteExpense}
                    onUpdateExpense={handleUpdateExpense}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (Outputs / Results) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Split Result / Summary Calculations */}
            <Card className="p-5 border-stone-200 bg-white">
              <h3 className="text-base font-black text-stone-900 mb-4 border-b border-stone-100 pb-2">
                3. Ringkasan & Hasil Patungan
              </h3>

              {/* Green total card */}
              <div className="leaf-gradient rounded-[22px] p-5 text-white shadow-md">
                <p className="text-xs opacity-90 uppercase font-black tracking-wider">Total Tagihan Bersih</p>
                <p className="mt-1 text-3xl font-black">{formatCurrency(splitResult.total)}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] opacity-90 border-t border-white/20 pt-2">
                  <span>Subtotal: {formatCurrency(splitResult.subtotal)}</span>
                  {splitResult.tax > 0 && <span>Pajak: {formatCurrency(splitResult.tax)}</span>}
                  {splitResult.service > 0 && <span>Service: {formatCurrency(splitResult.service)}</span>}
                  {splitResult.discount > 0 && <span>Diskon: -{formatCurrency(splitResult.discount)}</span>}
                  {splitResult.extraFee > 0 && <span>Lain-lain: {formatCurrency(splitResult.extraFee)}</span>}
                </div>
              </div>

              {/* Members Owed & Paid breakdown */}
              {members.length > 0 && (
                <div className="mt-5 space-y-2">
                  <h4 className="font-bold text-stone-800 text-xs">Beban per Anggota:</h4>
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

              {/* Settlement matching */}
              <div className="mt-5 space-y-3">
                <h4 className="font-bold text-stone-800 text-xs">Rekomendasi Transfer Penyelesaian:</h4>
                <SettlementList settlements={splitResult.settlements} />
              </div>
            </Card>

            {/* AI Text Summary Generator Card */}
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
