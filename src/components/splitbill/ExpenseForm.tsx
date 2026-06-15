'use client';

import { useEffect, useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
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

  useEffect(() => {
    if (!paidBy && members.length > 0) {
      setPaidBy(members[0].id);
    }

    if (selectedParticipants.length === 0 && members.length > 0) {
      setSelectedParticipants(members.map((member) => member.id));
    }
  }, [members, paidBy, selectedParticipants.length]);

  const handleSelectAll = () => {
    setSelectedParticipants(members.map((member) => member.id));
  };

  const handleClearAll = () => {
    setSelectedParticipants([]);
  };

  const toggleParticipant = (id: string) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter((participantId) => participantId !== id));
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

      setTitle('');
      setAmount('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan tagihan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (members.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/60 p-6 text-center text-sm text-green-900">
        <p className="font-black">Butuh minimal 2 anggota.</p>
        <p className="mt-1 text-xs leading-5 text-green-800/80">
          Setelah anggota cukup, form item akan aktif untuk mulai menghitung tagihan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-stone-600">Nama Tagihan / Item</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Nasi goreng, parkir, es teh"
            disabled={disabled || isSubmitting}
            required
            className="rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-stone-600">Nominal Tagihan (Rp)</label>
          <Input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Contoh: 25000"
            disabled={disabled || isSubmitting}
            required
            className="rounded-xl text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-stone-600">Dibayar Oleh</label>
        <div className="flex gap-2">
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="min-h-12 flex-grow rounded-2xl border border-stone-200 bg-white px-3 text-sm text-stone-950 shadow-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-500/15"
            disabled={disabled || isSubmitting}
            required
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              if (members.length > 0) {
                const randomIndex = Math.floor(Math.random() * members.length);
                setPaidBy(members[randomIndex].id);
              }
            }}
            className="flex shrink-0 items-center gap-1 rounded-2xl border border-green-200 bg-green-50 px-4 text-xs font-bold text-green-800 transition hover:bg-green-100 disabled:opacity-60"
            title="Acak Pembayar"
            disabled={disabled || isSubmitting}
          >
            Acak
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="block text-xs font-bold text-stone-600">
            Ditanggung Oleh / Ikut Patungan
          </label>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-black text-green-700 hover:underline disabled:opacity-60"
              disabled={disabled || isSubmitting}
            >
              Pilih semua
            </button>
            <span className="text-[11px] text-stone-300">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-black text-stone-400 hover:text-stone-600 hover:underline disabled:opacity-60"
              disabled={disabled || isSubmitting}
            >
              Hapus
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 rounded-2xl border border-stone-200 bg-stone-50/70 p-3 sm:grid-cols-2">
          {members.map((member) => {
            const isSelected = selectedParticipants.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleParticipant(member.id)}
                disabled={disabled || isSubmitting}
                className={`flex min-h-11 items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-bold transition ${
                  isSelected
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                {isSelected ? (
                  <CheckSquare size={16} className="shrink-0 text-green-600" />
                ) : (
                  <Square size={16} className="shrink-0 text-stone-300" />
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
        className="w-full rounded-2xl text-sm"
        disabled={disabled || isSubmitting || !title.trim() || !amount}
      >
        {isSubmitting ? 'Menyimpan...' : 'Tambahkan Tagihan'}
      </Button>
    </form>
  );
}
