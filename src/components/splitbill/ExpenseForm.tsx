'use client';

import { useState } from 'react';
import { Check, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Member } from '@/types';

interface ExpenseFormProps {
  members: Member[];
  onSubmitExpense: (data: {
    title: string;
    amount: number;
    paid_by_member_id: string;
    participantIds: string[];
  }) => Promise<void>;
  disabled?: boolean;
}

export function ExpenseForm({ members, onSubmitExpense, disabled = false }: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize defaults if available
  if (!paidBy && members.length > 0) {
    setPaidBy(members[0].id);
  }
  if (selectedParticipants.length === 0 && members.length > 0) {
    setSelectedParticipants(members.map((m) => m.id));
  }

  const handleSelectAll = () => {
    setSelectedParticipants(members.map((m) => m.id));
  };

  const handleClearAll = () => {
    setSelectedParticipants([]);
  };

  const toggleParticipant = (id: string) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter((pid) => pid !== id));
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Number(amount);

    if (!title.trim()) {
      setError('Nama item/tagihan wajib diisi');
      return;
    }
    if (!amount || finalAmount <= 0) {
      setError('Nominal tagihan harus lebih besar dari 0');
      return;
    }
    if (!paidBy) {
      setError('Pembayar wajib dipilih');
      return;
    }
    if (selectedParticipants.length === 0) {
      setError('Minimal pilih 1 peserta penanggung');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await onSubmitExpense({
        title: title.trim(),
        amount: finalAmount,
        paid_by_member_id: paidBy,
        participantIds: selectedParticipants,
      });

      // Reset form
      setTitle('');
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan tagihan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (members.length < 2) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-stone-500 text-sm shadow-sm">
        Harap tambahkan minimal 2 anggota terlebih dahulu untuk mulai memasukkan tagihan.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1">
            Nama Tagihan / Item
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Nasi Goreng, Parkir, Es Teh"
            disabled={disabled || isSubmitting}
            required
            className="text-sm rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1">
            Nominal Tagihan (Rp)
          </label>
          <Input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Contoh: 25000"
            disabled={disabled || isSubmitting}
            required
            className="text-sm rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1">
            Dibayar Oleh
          </label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="min-h-11 w-full rounded-2xl border border-stone-200 bg-white px-3 text-stone-950 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-500/15"
            disabled={disabled || isSubmitting}
            required
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-stone-600">
            Ditanggung Oleh / Ikut Patungan
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[10px] font-black text-green-700 hover:underline"
              disabled={disabled || isSubmitting}
            >
              Pilih Semua
            </button>
            <span className="text-[10px] text-stone-300">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] font-black text-stone-400 hover:text-stone-600 hover:underline"
              disabled={disabled || isSubmitting}
            >
              Hapus Pilihan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-2xl border border-stone-200 bg-stone-50/50">
          {members.map((member) => {
            const isSelected = selectedParticipants.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleParticipant(member.id)}
                disabled={disabled || isSubmitting}
                className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-semibold transition ${
                  isSelected
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                {isSelected ? (
                  <CheckSquare size={16} className="text-green-600 shrink-0" />
                ) : (
                  <Square size={16} className="text-stone-300 shrink-0" />
                )}
                <span className="truncate">{member.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full min-h-11 rounded-2xl text-sm"
        disabled={disabled || isSubmitting || !title.trim() || !amount}
      >
        {isSubmitting ? 'Menyimpan...' : 'Tambahkan Tagihan'}
      </Button>
    </form>
  );
}
