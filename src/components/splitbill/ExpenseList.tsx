'use client';

import { useState } from 'react';
import { Trash2, DollarSign, Edit3, Check, X } from 'lucide-react';
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

  // Inline edit state
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
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus tagihan.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditTitle(expense.title);
    setEditAmount(String(expense.amount));
    setEditPaidBy(expense.paid_by_member_id);
    
    // Find existing participant IDs
    const existingParts = expenseParticipants
      .filter((ep) => ep.expense_id === expense.id)
      .map((ep) => ep.member_id);
    setEditParticipants(existingParts);
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
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah tagihan.');
    } finally {
      setIsSaving(false);
    }
  };

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || 'Anggota Terhapus';
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-stone-400 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-stone-50 text-stone-300">
          <DollarSign size={24} className="stroke-1" />
        </div>
        <p className="mt-3 text-xs font-semibold">Belum ada tagihan.</p>
        <p className="mt-1 text-[11px] text-stone-400">
          Gunakan scanner struk atau isi form di atas untuk menambah tagihan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}
      <div className="divide-y divide-stone-100">
        {expenses.map((expense) => {
          const payerName = getMemberName(expense.paid_by_member_id);

          // Find participants for this expense
          const participantNames = expenseParticipants
            .filter((ep) => ep.expense_id === expense.id)
            .map((ep) => getMemberName(ep.member_id));

          const isDeleting = deletingId === expense.id;
          const isEditing = editingId === expense.id;

          if (isEditing) {
            return (
              <div key={expense.id} className="py-4 bg-stone-50/50 p-3.5 rounded-2xl my-2 border border-stone-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Nama Tagihan</label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      disabled={isSaving}
                      className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 outline-none focus:border-green-400 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      disabled={isSaving}
                      className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 outline-none focus:border-green-400 text-stone-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Dibayar Oleh</label>
                  <select
                    value={editPaidBy}
                    onChange={(e) => setEditPaidBy(e.target.value)}
                    disabled={isSaving}
                    className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 outline-none focus:border-green-400 text-stone-950"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Ditanggung Oleh</label>
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-stone-200 bg-white">
                    {members.map((m) => {
                      const isChecked = editParticipants.includes(m.id);
                      return (
                        <button
                          type="button"
                          key={m.id}
                          disabled={isSaving}
                          onClick={() => {
                            if (isChecked) {
                              setEditParticipants(editParticipants.filter((pid) => pid !== m.id));
                            } else {
                              setEditParticipants([...editParticipants, m.id]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition ${
                            isChecked
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <Button
                    onClick={() => setEditingId(null)}
                    disabled={isSaving}
                    variant="ghost"
                    className="min-h-8 text-[11px] rounded-lg px-3 text-stone-500 hover:bg-stone-100"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={() => handleSaveEdit(expense.id)}
                    disabled={isSaving}
                    className="min-h-8 text-[11px] rounded-lg px-4 bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div key={expense.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-stone-900 truncate text-sm">
                    {expense.title}
                  </h4>
                  <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-black text-green-700">
                    Dibayar: {payerName}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-500 truncate">
                  Untuk: {participantNames.join(', ')}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-black text-stone-950 text-sm mr-2">
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => handleStartEdit(expense)}
                  disabled={disabled || isDeleting}
                  className="text-stone-400 hover:text-green-700 disabled:opacity-50 transition p-1"
                  title="Ubah Tagihan"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(expense.id)}
                  disabled={disabled || isDeleting}
                  className="text-stone-400 hover:text-red-600 disabled:opacity-50 transition p-1"
                  title="Hapus Tagihan"
                >
                  <Trash2 size={15} className={isDeleting ? 'animate-pulse text-red-500' : ''} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
