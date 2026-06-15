'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, FileText, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Member } from '@/types';

interface ScannedItem {
  name: string;
  amount: number;
}

interface ScannedResult {
  merchant?: string | null;
  date?: string | null;
  items: ScannedItem[];
  subtotal?: number;
  tax?: number;
  service?: number;
  discount?: number;
  total?: number;
}

interface ReceiptReviewProps {
  scannedResult: ScannedResult;
  members: Member[];
  onConfirm: (expenses: Array<{ title: string; amount: number; paid_by_member_id: string; participantIds: string[] }>) => Promise<void>;
  onCancel: () => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function ReceiptReview({ scannedResult, members, onConfirm, onCancel }: ReceiptReviewProps) {
  const [merchant, setMerchant] = useState(scannedResult.merchant || 'Struk Belanja');
  const [items, setItems] = useState<ScannedItem[]>(scannedResult.items || []);
  const [tax, setTax] = useState(scannedResult.tax || 0);
  const [service, setService] = useState(scannedResult.service || 0);
  const [discount, setDiscount] = useState(scannedResult.discount || 0);
  const receiptTotal = scannedResult.total || 0;

  const [paidBy, setPaidBy] = useState('');
  const [defaultParticipantIds, setDefaultParticipantIds] = useState<string[]>([]);
  const [itemParticipantIds, setItemParticipantIds] = useState<string[][]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemCount = items.length;

  useEffect(() => {
    const memberIds = members.map((member) => member.id);
    if (memberIds.length === 0) return;

    setPaidBy((current) => (current && memberIds.includes(current) ? current : memberIds[0]));
    setDefaultParticipantIds((current) => {
      const valid = current.filter((id) => memberIds.includes(id));
      return valid.length > 0 ? valid : memberIds;
    });
    setItemParticipantIds((current) =>
      Array.from({ length: itemCount }, (_, index) => {
        const valid = (current[index] || []).filter((id) => memberIds.includes(id));
        return valid.length > 0 ? valid : memberIds;
      }),
    );
  }, [members, itemCount]);

  const itemsSum = items.reduce((sum, item) => sum + item.amount, 0);
  const calculatedTotal = itemsSum + tax + service - discount;
  const showWarning = receiptTotal > 0 && Math.abs(calculatedTotal - receiptTotal) > 5;

  const handleItemChange = (index: number, field: keyof ScannedItem, value: string) => {
    const updated = [...items];
    if (field === 'amount') {
      updated[index].amount = Math.max(0, Math.round(Number(value)) || 0);
    } else {
      updated[index].name = value;
    }
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { name: 'Item Baru', amount: 0 }]);
    setItemParticipantIds((current) => [...current, defaultParticipantIds]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
    setItemParticipantIds((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const toggleParticipant = (id: string) => {
    if (defaultParticipantIds.includes(id)) {
      setDefaultParticipantIds(defaultParticipantIds.filter((participantId) => participantId !== id));
    } else {
      setDefaultParticipantIds([...defaultParticipantIds, id]);
    }
  };

  const toggleItemParticipant = (itemIndex: number, memberId: string) => {
    setItemParticipantIds((prev) => {
      const next = prev.map((row) => [...row]);
      const selected = next[itemIndex] || [];
      const hasMember = selected.includes(memberId);
      next[itemIndex] = hasMember
        ? selected.filter((id) => id !== memberId)
        : [...selected, memberId];
      return next;
    });
  };

  const handleSaveSeparately = async () => {
    if (items.length === 0) {
      setError('Harap masukkan minimal 1 item.');
      return;
    }
    if (!paidBy) {
      setError('Pembayar wajib dipilih.');
      return;
    }
    if (defaultParticipantIds.length === 0) {
      setError('Harap pilih minimal 1 peserta penanggung default.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const expensesToCreate = items.map((item, index) => ({
        title: item.name || 'Item Tanpa Nama',
        amount: item.amount,
        paid_by_member_id: paidBy,
        participantIds: itemParticipantIds[index]?.length ? itemParticipantIds[index] : defaultParticipantIds,
      }));

      if (tax > 0) {
        expensesToCreate.push({
          title: `Pajak Struk (${merchant})`,
          amount: tax,
          paid_by_member_id: paidBy,
          participantIds: defaultParticipantIds,
        });
      }
      if (service > 0) {
        expensesToCreate.push({
          title: `Biaya Layanan Struk (${merchant})`,
          amount: service,
          paid_by_member_id: paidBy,
          participantIds: defaultParticipantIds,
        });
      }

      await onConfirm(expensesToCreate);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Gagal menyimpan data.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsOne = async () => {
    if (!paidBy) {
      setError('Pembayar wajib dipilih.');
      return;
    }
    if (defaultParticipantIds.length === 0) {
      setError('Harap pilih minimal 1 peserta penanggung.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const finalAmount = calculatedTotal > 0 ? calculatedTotal : itemsSum;

      await onConfirm([
        {
          title: `Struk Belanja: ${merchant}`,
          amount: finalAmount,
          paid_by_member_id: paidBy,
          participantIds: defaultParticipantIds,
        },
      ]);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Gagal menyimpan data.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[32px] border border-green-200 bg-white p-5 shadow-[0_20px_60px_rgba(22,101,52,0.10)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
              <FileText size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Review scanner</p>
              <h2 className="mt-1 text-2xl font-black text-stone-950">Review Hasil Scan Struk</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Cek nama merchant, nominal, pembayar, dan siapa saja yang menanggung setiap item sebelum disimpan.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
            disabled={isSubmitting}
            title="Tutup review"
          >
            <X size={20} />
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {showWarning && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
          <AlertTriangle size={18} className="shrink-0 text-amber-600" />
                <div className="min-w-0">
            <span className="font-bold">Perhatian:</span> Total tagihan hasil scan (
            <span className="font-bold">{formatCurrency(receiptTotal)}</span>) berbeda dengan jumlah item (
            <span className="font-bold">{formatCurrency(calculatedTotal)}</span>). Sesuaikan item di bawah bila perlu.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <div>
              <label className="mb-1 block text-xs font-bold text-stone-600">Nama merchant / struk</label>
              <Input
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Contoh: Starbucks, Toko Makmur"
                className="rounded-xl text-sm"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-stone-600">Pajak (Rp)</label>
                <Input
                  type="number"
                  value={tax === 0 ? '' : tax}
                  onChange={(e) => setTax(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="rounded-xl text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-stone-600">Service (Rp)</label>
                <Input
                  type="number"
                  value={service === 0 ? '' : service}
                  onChange={(e) => setService(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="rounded-xl text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-stone-600">Diskon (Rp)</label>
                <Input
                  type="number"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="rounded-xl text-sm"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <label className="mb-1 block text-xs font-bold text-stone-600">Siapa yang membayar struk ini?</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm text-stone-950 shadow-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-500/15"
                disabled={isSubmitting}
                required
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-stone-600">
                Penanggung default
              </label>
              <div className="flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-stone-50/70 p-2.5">
                {members.map((member) => {
                  const isChecked = defaultParticipantIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleParticipant(member.id)}
                      disabled={isSubmitting}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition ${
                        isChecked
                          ? 'border-green-200 bg-green-50 text-green-800'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <span className={`flex size-3 items-center justify-center rounded-full border ${
                        isChecked ? 'border-green-600 bg-green-600' : 'border-stone-300'
                      }`}>
                        {isChecked && <Check size={8} className="text-white" />}
                      </span>
                      {member.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-950">Daftar item struk</h3>
              <p className="mt-1 text-xs leading-5 text-stone-500">Edit harga dan pilih penanggung per item.</p>
            </div>
            <button
              onClick={handleAddItem}
              className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-green-200 bg-green-50 px-3 text-xs font-bold text-green-800 transition hover:bg-green-100"
              disabled={isSubmitting}
            >
              <Plus size={14} />
              Item
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <article key={index} className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_112px_auto] sm:items-center">
                  <Input
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="Nama item"
                    className="min-h-10 rounded-xl px-3 text-xs"
                    disabled={isSubmitting}
                  />
                  <Input
                    type="number"
                    value={item.amount === 0 ? '' : item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    placeholder="Harga"
                    className="min-h-10 rounded-xl px-3 text-xs"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="rounded-xl p-2 text-stone-400 transition hover:bg-white hover:text-red-500"
                    disabled={isSubmitting}
                    title="Hapus"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const isChecked = itemParticipantIds[index]?.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleItemParticipant(index, member.id)}
                        disabled={isSubmitting}
                        className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-3 text-[11px] font-bold transition ${
                          isChecked
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-stone-200 bg-white text-stone-600'
                        }`}
                      >
                        {isChecked ? <Check size={10} /> : <span className="w-2" />}
                        {member.name}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}

            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-5 text-center">
                <p className="text-sm font-bold text-stone-500">Belum ada item dalam daftar.</p>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-stone-100 pt-4 text-sm">
            <div className="flex items-center justify-between text-stone-500">
              <span>Subtotal item</span>
              <span className="font-bold">{formatCurrency(itemsSum)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-3 font-black text-green-900">
              <span>Total akhir struk</span>
              <span>{formatCurrency(calculatedTotal)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-2 pt-2 sm:grid-cols-3">
        <Button onClick={handleSaveSeparately} disabled={isSubmitting} className="w-full text-sm">
          Masukkan Sebagai Item Terpisah
        </Button>

        <Button
          onClick={handleSaveAsOne}
          disabled={isSubmitting}
          variant="secondary"
          className="w-full text-sm"
        >
          Masukkan Sebagai Satu Tagihan
        </Button>

        <Button
          onClick={onCancel}
          variant="ghost"
          disabled={isSubmitting}
          className="w-full text-sm text-stone-500"
        >
          Batalkan
        </Button>
      </div>
    </div>
  );
}
