'use client';

import { useState } from 'react';
import { Trash2, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Expense, Member, ExpenseParticipant } from '@/types';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  expenseParticipants: ExpenseParticipant[];
  onDeleteExpense: (id: string) => Promise<void>;
  disabled?: boolean;
}

export function ExpenseList({
  expenses,
  members,
  expenseParticipants,
  onDeleteExpense,
  disabled = false,
}: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-black text-stone-950 text-sm">
                  {formatCurrency(expense.amount)}
                </span>
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
