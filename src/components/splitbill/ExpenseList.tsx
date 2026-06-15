'use client';

import { useState } from 'react';
import { DollarSign, Edit3, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { Button } from '@/components/ui/Button';
import type { Expense, Member, ExpenseParticipant } from '@/types';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  expenseParticipants: ExpenseParticipant[];
  onDeleteExpense: (id: string) => Promise<void>;
  onUpdateExpense: (
    id: string,
    expense: { title: string; amount: number; paid_by_member_id: string },
    participantIds: string[],
  ) => Promise<void>;
  disabled?: boolean;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function ExpenseList({
  expenses,
  members,
  expenseParticipants,
  onDeleteExpense,
  onUpdateExpense,
  disabled = false,
}: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPaidBy, setEditPaidBy] = useState('');
  const [editParticipants, setEditParticipants] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      setDeletingId(id);
      await onDeleteExpense(id);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Gagal menghapus tagihan.'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditTitle(expense.title);
    setEditAmount(String(expense.amount));
    setEditPaidBy(expense.paid_by_member_id);
    setEditParticipants(
      expenseParticipants
        .filter((participant) => participant.expense_id === expense.id)
        .map((participant) => participant.member_id),
    );
  };

  const handleSaveEdit = async (id: string) => {
    const finalAmount = Number(editAmount);
    if (!editTitle.trim()) {
      setError('Nama tagihan wajib diisi.');
      return;
    }
    if (!editAmount || finalAmount <= 0) {
      setError('Nominal harus lebih besar dari 0.');
      return;
    }
    if (!editPaidBy) {
      setError('Pembayar wajib dipilih.');
      return;
    }
    if (editParticipants.length === 0) {
      setError('Minimal pilih 1 orang penanggung.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onUpdateExpense(
        id,
        {
          title: editTitle.trim(),
          amount: finalAmount,
          paid_by_member_id: editPaidBy,
        },
        editParticipants,
      );
      setEditingId(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Gagal mengubah tagihan.'));
    } finally {
      setIsSaving(false);
    }
  };

  const getMemberName = (id: string) => {
    return members.find((member) => member.id === id)?.name || 'Anggota terhapus';
  };

  const toggleEditParticipant = (id: string) => {
    if (editParticipants.includes(id)) {
      setEditParticipants(editParticipants.filter((participantId) => participantId !== id));
    } else {
      setEditParticipants([...editParticipants, id]);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-stone-300 shadow-sm">
          <DollarSign size={24} className="stroke-1" />
        </div>
        <p className="mt-3 text-sm font-black text-stone-600">Belum ada tagihan.</p>
        <p className="mt-1 text-xs leading-5 text-stone-400">
          Gunakan scanner struk atau isi form di atas untuk menambah tagihan pertama.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {expenses.map((expense) => {
        const payerName = getMemberName(expense.paid_by_member_id);
        const participantNames = expenseParticipants
          .filter((participant) => participant.expense_id === expense.id)
          .map((participant) => getMemberName(participant.member_id));

        const isDeleting = deletingId === expense.id;
        const isEditing = editingId === expense.id;

        if (isEditing) {
          return (
            <article key={expense.id} className="space-y-4 rounded-2xl border border-green-200 bg-green-50/50 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-black uppercase tracking-wide text-stone-500">
                    Nama tagihan
                  </label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    disabled={isSaving}
                    className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-500/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-black uppercase tracking-wide text-stone-500">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    disabled={isSaving}
                    className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-500/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-wide text-stone-500">
                  Dibayar oleh
                </label>
                <select
                  value={editPaidBy}
                  onChange={(e) => setEditPaidBy(e.target.value)}
                  disabled={isSaving}
                  className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-500/15"
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-stone-500">
                  Ditanggung oleh
                </label>
                <div className="flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-white p-2.5">
                  {members.map((member) => {
                    const isChecked = editParticipants.includes(member.id);
                    return (
                      <button
                        type="button"
                        key={member.id}
                        disabled={isSaving}
                        onClick={() => toggleEditParticipant(member.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                          isChecked
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {member.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setEditingId(null)}
                  disabled={isSaving}
                  variant="ghost"
                  className="min-h-10 rounded-xl px-4 text-xs"
                >
                  Batal
                </Button>
                <Button
                  onClick={() => handleSaveEdit(expense.id)}
                  disabled={isSaving}
                  className="min-h-10 rounded-xl px-4 text-xs"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </article>
          );
        }

        return (
          <article key={expense.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-black text-stone-950">{expense.title}</h4>
                <p className="mt-1 text-xs leading-5 text-stone-500">Dibayar oleh {payerName}</p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-base font-black text-stone-950">{formatCurrency(expense.amount)}</p>
                <p className="mt-1 text-[11px] font-bold text-stone-400">{participantNames.length} penanggung</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="line-clamp-2 text-xs leading-5 text-stone-500">
                Untuk: {participantNames.join(', ') || 'Belum ada penanggung'}
              </p>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(expense)}
                  disabled={disabled || isDeleting}
                  className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 text-xs font-bold text-stone-500 transition hover:border-green-200 hover:text-green-700 disabled:opacity-50"
                  title="Ubah Tagihan"
                >
                  <Edit3 size={14} />
                  Ubah
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(expense.id)}
                  disabled={disabled || isDeleting}
                  className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  title="Hapus Tagihan"
                >
                  <Trash2 size={14} className={isDeleting ? 'animate-pulse' : ''} />
                  Hapus
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
