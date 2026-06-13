'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Trash2, Check, X, FileText, ArrowRight } from 'lucide-react';
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

export function ReceiptReview({ scannedResult, members, onConfirm, onCancel }: ReceiptReviewProps) {
  const [merchant, setMerchant] = useState(scannedResult.merchant || 'Struk Belanja');
  const [items, setItems] = useState<ScannedItem[]>(scannedResult.items || []);
  const [tax, setTax] = useState(scannedResult.tax || 0);
  const [service, setService] = useState(scannedResult.service || 0);
  const [discount, setDiscount] = useState(scannedResult.discount || 0);
  
  // Total calculated from receipt level
  const receiptTotal = scannedResult.total || 0;

  const [paidBy, setPaidBy] = useState('');
  const [defaultParticipantIds, setDefaultParticipantIds] = useState<string[]>([]);
  const [itemParticipantIds, setItemParticipantIds] = useState<string[][]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selections
  useEffect(() => {
    if (members.length > 0) {
      setPaidBy(members[0].id);
      setDefaultParticipantIds(members.map((m) => m.id));
      setItemParticipantIds(items.map(() => members.map((m) => m.id)));
    }
  }, [members, items]);

  // Calculate items sum
  const itemsSum = items.reduce((sum, item) => sum + item.amount, 0);
  // Calculate total with tax/service/discount from OCR
  const calculatedTotal = itemsSum + tax + service - discount;

  // Warning check: if sum of items + adjustments doesn't equal receipt total
  const showWarning = receiptTotal > 0 && Math.abs(calculatedTotal - receiptTotal) > 5;

  const handleItemChange = (index: number, field: keyof ScannedItem, value: any) => {
    const updated = [...items];
    if (field === 'amount') {
      updated[index].amount = Math.max(0, Math.round(Number(value)) || 0);
    } else {
      updated[index].name = String(value);
    }
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { name: 'Item Baru', amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setItemParticipantIds((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleParticipant = (id: string) => {
    if (defaultParticipantIds.includes(id)) {
      setDefaultParticipantIds(defaultParticipantIds.filter((pid) => pid !== id));
    } else {
      setDefaultParticipantIds([...defaultParticipantIds, id]);
    }
  };

  const toggleItemParticipant = (itemIndex: number, memberId: string) => {
    setItemParticipantIds((prev) => {
      const next = prev.map((row) => [...row]);
      const selected = next[itemIndex] || [];
      const has = selected.includes(memberId);
      const updated = has ? selected.filter((id) => id !== memberId) : [...selected, memberId];
      next[itemIndex] = updated;
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

      // Create a list of expenses, one for each item
      const expensesToCreate = items.map((item, idx) => ({
        title: item.name || 'Item Tanpa Nama',
        amount: item.amount,
        paid_by_member_id: paidBy,
        participantIds: itemParticipantIds[idx] && itemParticipantIds[idx].length > 0 ? itemParticipantIds[idx] : defaultParticipantIds,
      }));

      // Add tax/service/discount as separate expenses if they are present
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
          title: `Biaya Layanan/Service Struk (${merchant})`,
          amount: service,
          paid_by_member_id: paidBy,
          participantIds: defaultParticipantIds,
        });
      }
      if (discount > 0) {
        // Discounts are entered as negative values in logic, but expenses amount must be positive.
        // Wait, for discount we could model it, but to keep logic simple:
        // since expenses add to total, we can subtract discount from other item ratios or just create a negative amount?
        // Wait, database constraint says amount >= 0. So we can't create a negative expense!
        // To handle discount in "Separate Items" mode, we can deduct it proportionally from the items we create,
        // or let the user apply it in Group settings later! The second option is much cleaner because Group settings has a direct discount field!
        // So we will ignore discount here and instruct the user to configure the discount in the group settings.
      }

      await onConfirm(expensesToCreate);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data.');
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

      // Create a single expense with the calculated total amount
      const finalAmount = calculatedTotal > 0 ? calculatedTotal : itemsSum;

      const expensesToCreate = [
        {
          title: `Struk Belanja: ${merchant}`,
          amount: finalAmount,
          paid_by_member_id: paidBy,
          participantIds: defaultParticipantIds,
        },
      ];

      await onConfirm(expensesToCreate);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
          <FileText className="text-green-600" size={20} />
          Review Hasil Scan Struk
        </h3>
        <button
          onClick={onCancel}
          className="text-stone-400 hover:text-stone-600 transition"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {showWarning && (
        <div className="flex gap-2.5 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-800 border border-amber-200">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Perhatian:</span> Total tagihan hasil scan (
            <span className="font-bold">{formatCurrency(receiptTotal)}</span>) berbeda dengan jumlah hitungan item (
            <span className="font-bold">{formatCurrency(calculatedTotal)}</span>). Anda dapat menyesuaikan harga item di bawah.
          </div>
        </div>
      )}

      <Card className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1">
            Nama Merchant / Struk
          </label>
          <Input
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="Contoh: Starbucks, Toko Makmur"
            className="text-sm rounded-xl"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">Pajak Struk (Rp)</label>
            <Input
              type="number"
              value={tax === 0 ? '' : tax}
              onChange={(e) => setTax(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="text-sm rounded-xl"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">Service (Rp)</label>
            <Input
              type="number"
              value={service === 0 ? '' : service}
              onChange={(e) => setService(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="text-sm rounded-xl"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">Diskon (Rp)</label>
            <Input
              type="number"
              value={discount === 0 ? '' : discount}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="text-sm rounded-xl"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <h4 className="font-black text-stone-900 text-sm">Daftar Item Struk</h4>
          <button
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:underline"
            disabled={isSubmitting}
          >
            <Plus size={14} />
            Tambah Item
          </button>
        </div>

        <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
          {items.map((item, idx) => (
            <div key={idx} className="space-y-2 rounded-xl border border-stone-100 p-3">
              <div className="flex gap-2 items-center">
                <Input
                  value={item.name}
                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                  placeholder="Nama Item"
                  className="text-xs rounded-xl flex-1 min-h-9 px-3"
                  disabled={isSubmitting}
                />
                <Input
                  type="number"
                  value={item.amount === 0 ? '' : item.amount}
                  onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                  placeholder="Harga"
                  className="text-xs rounded-xl w-24 min-h-9 px-3"
                  disabled={isSubmitting}
                />
                <button
                  onClick={() => handleRemoveItem(idx)}
                  className="text-stone-400 hover:text-red-500 transition p-1 shrink-0"
                  disabled={isSubmitting}
                  title="Hapus"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {members.map((member) => {
                  const isChecked = itemParticipantIds[idx]?.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleItemParticipant(idx, member.id)}
                      disabled={isSubmitting}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold border transition ${
                        isChecked ? 'border-green-200 bg-green-50 text-green-800' : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      {isChecked ? <Check size={10} /> : <span className="w-3" />}
                      {member.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-stone-400 text-center py-4">Belum ada item dalam daftar.</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-xs font-black text-stone-950">
          <span>Subtotal Item:</span>
          <span>{formatCurrency(itemsSum)}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-black text-green-800">
          <span>Total Akhir Struk (Termasuk Pajak/Servis/Diskon):</span>
          <span>{formatCurrency(calculatedTotal)}</span>
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1">
            Siapa Yang Membayar Struk Ini?
          </label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="min-h-11 w-full rounded-2xl border border-stone-200 bg-white px-3 text-stone-950 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-500/15"
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
          <label className="block text-xs font-bold text-stone-600 mb-1">
            Anggota Default Yang Menanggung Item
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-stone-200 bg-stone-50/50">
            {members.map((member) => {
              const isChecked = defaultParticipantIds.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleParticipant(member.id)}
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border transition ${
                    isChecked
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  <span className={`size-3 rounded-full flex items-center justify-center border ${
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

      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={handleSaveSeparately}
          disabled={isSubmitting}
          className="w-full text-xs font-black min-h-11"
        >
          Masukkan Sebagai Item Terpisah
        </Button>
        
        <Button
          onClick={handleSaveAsOne}
          disabled={isSubmitting}
          variant="secondary"
          className="w-full text-xs font-black min-h-11 border-green-200 text-green-800 bg-green-50/50"
        >
          Masukkan Sebagai Satu Tagihan Total
        </Button>

        <Button
          onClick={onCancel}
          variant="ghost"
          disabled={isSubmitting}
          className="w-full text-xs font-semibold min-h-10 text-stone-500 hover:bg-stone-50"
        >
          Batalkan & Tutup
        </Button>
      </div>
    </div>
  );
}
