'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, FileText, Plus, Trash2, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatCurrency';

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

interface HomepageReceiptReviewProps {
  scannedResult: ScannedResult;
  onConfirm: (data: {
    groupName: string;
    members: string[];
    expenses: Array<{
      title: string;
      amount: number;
      paidByMemberName: string;
      participantNames: string[];
    }>;
  }) => Promise<void>;
  onCancel: () => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function HomepageReceiptReview({ scannedResult, onConfirm, onCancel }: HomepageReceiptReviewProps) {
  const [groupName, setGroupName] = useState(scannedResult.merchant || 'Makan Bareng Teman');
  const [items, setItems] = useState<ScannedItem[]>(scannedResult.items || []);
  const [tax, setTax] = useState(scannedResult.tax || 0);
  const [service, setService] = useState(scannedResult.service || 0);
  const [discount, setDiscount] = useState(scannedResult.discount || 0);
  const receiptTotal = scannedResult.total || 0;

  const [newMemberName, setNewMemberName] = useState('');
  const [tempMembers, setTempMembers] = useState<string[]>(['Saya', 'Teman 1', 'Teman 2']);
  const [paidBy, setPaidBy] = useState('Saya');
  const [defaultParticipants, setDefaultParticipants] = useState<string[]>(['Saya', 'Teman 1', 'Teman 2']);
  const [itemParticipantNames, setItemParticipantNames] = useState<string[][]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemCount = items.length;

  useEffect(() => {
    if (tempMembers.length === 0) return;

    setPaidBy((current) => (current && tempMembers.includes(current) ? current : tempMembers[0]));
    setDefaultParticipants((current) => {
      const valid = current.filter((name) => tempMembers.includes(name));
      return valid.length > 0 ? valid : tempMembers;
    });
    setItemParticipantNames((current) =>
      Array.from({ length: itemCount }, (_, index) => {
        const valid = (current[index] || []).filter((name) => tempMembers.includes(name));
        return valid.length > 0 ? valid : tempMembers;
      }),
    );
  }, [tempMembers, itemCount]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newMemberName.trim();
    if (!cleanName) return;
    if (tempMembers.includes(cleanName)) {
      setError('Nama teman sudah terdaftar.');
      return;
    }
    setTempMembers([...tempMembers, cleanName]);
    setNewMemberName('');
    setError(null);
  };

  const handleRemoveMember = (nameToRemove: string) => {
    if (tempMembers.length <= 2) {
      setError('Sesi patungan minimal harus memiliki 2 orang.');
      return;
    }
    setTempMembers(tempMembers.filter((name) => name !== nameToRemove));
    setError(null);
  };

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
    setItemParticipantNames((current) => [...current, defaultParticipants]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
    setItemParticipantNames((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const toggleParticipant = (name: string) => {
    if (defaultParticipants.includes(name)) {
      setDefaultParticipants(defaultParticipants.filter((participantName) => participantName !== name));
    } else {
      setDefaultParticipants([...defaultParticipants, name]);
    }
  };

  const toggleItemParticipantName = (itemIndex: number, name: string) => {
    setItemParticipantNames((prev) => {
      const next = prev.map((row) => [...row]);
      const selected = next[itemIndex] || [];
      const found = selected.includes(name);
      next[itemIndex] = found ? selected.filter((memberName) => memberName !== name) : [...selected, name];
      return next;
    });
  };

  const handleSaveSeparately = async () => {
    if (!groupName.trim()) {
      setError('Nama grup/kegiatan wajib diisi.');
      return;
    }
    if (tempMembers.length < 2) {
      setError('Minimal tambahkan 2 orang anggota untuk membagi tagihan.');
      return;
    }
    if (items.length === 0) {
      setError('Harap masukkan minimal 1 item.');
      return;
    }
    if (!paidBy) {
      setError('Pembayar wajib dipilih.');
      return;
    }
    if (defaultParticipants.length === 0) {
      setError('Harap pilih minimal 1 teman penanggung.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const expensesToCreate = items.map((item, index) => ({
        title: item.name || 'Item Tanpa Nama',
        amount: item.amount,
        paidByMemberName: paidBy,
        participantNames: itemParticipantNames[index]?.length
          ? itemParticipantNames[index]
          : defaultParticipants,
      }));

      if (tax > 0) {
        expensesToCreate.push({
          title: `Pajak Struk (${groupName})`,
          amount: tax,
          paidByMemberName: paidBy,
          participantNames: defaultParticipants,
        });
      }
      if (service > 0) {
        expensesToCreate.push({
          title: `Service Charge Struk (${groupName})`,
          amount: service,
          paidByMemberName: paidBy,
          participantNames: defaultParticipants,
        });
      }

      await onConfirm({
        groupName: groupName.trim(),
        members: tempMembers,
        expenses: expensesToCreate,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Gagal membuat sesi patungan.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsOne = async () => {
    if (!groupName.trim()) {
      setError('Nama grup/kegiatan wajib diisi.');
      return;
    }
    if (tempMembers.length < 2) {
      setError('Minimal tambahkan 2 orang anggota untuk membagi tagihan.');
      return;
    }
    if (!paidBy) {
      setError('Pembayar wajib dipilih.');
      return;
    }
    if (defaultParticipants.length === 0) {
      setError('Harap pilih minimal 1 teman penanggung.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const finalAmount = calculatedTotal > 0 ? calculatedTotal : itemsSum;

      await onConfirm({
        groupName: groupName.trim(),
        members: tempMembers,
        expenses: [
          {
            title: `Struk Belanja: ${groupName}`,
            amount: finalAmount,
            paidByMemberName: paidBy,
            participantNames: defaultParticipants,
          },
        ],
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Gagal membuat sesi patungan.'));
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
              <h2 className="mt-1 text-2xl font-black text-stone-950">Review dan Buat Patungan Baru</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Lengkapi nama kegiatan, daftar teman, pembayar, dan item sebelum sesi disimpan.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
            disabled={isSubmitting}
            title="Batalkan"
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
          <div>
            <span className="font-bold">Perhatian:</span> Total struk dari AI (
            <span className="font-bold">{formatCurrency(receiptTotal)}</span>) berbeda dengan jumlah item (
            <span className="font-bold">{formatCurrency(calculatedTotal)}</span>). Sesuaikan nilainya bila perlu.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">1. Nama kegiatan</p>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Contoh: Makan Siang, Villa Puncak"
                className="mt-3 rounded-xl text-sm"
                disabled={isSubmitting}
                required
              />
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">2. Teman yang ikut</p>
              <p className="mt-1 text-sm leading-6 text-stone-500">Ganti nama contoh atau tambahkan anggota baru.</p>
            </div>

            <form onSubmit={handleAddMember} className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nama teman"
                className="rounded-xl text-sm sm:flex-1"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                className="rounded-xl text-sm"
                disabled={isSubmitting || !newMemberName.trim()}
              >
                <UserPlus size={16} />
                Tambah
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {tempMembers.map((name) => (
                <div
                  key={name}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 py-1.5 pl-3 pr-1.5 text-xs font-bold text-stone-700"
                >
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(name)}
                    className="rounded-full p-1 text-stone-400 transition hover:bg-white hover:text-red-500"
                    disabled={isSubmitting}
                    title="Hapus"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">3. Pembayar dan default split</p>
              <label className="mt-3 block text-xs font-bold text-stone-600">Dibayar oleh</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="mt-1 min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm text-stone-950 shadow-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-500/15"
                disabled={isSubmitting}
              >
                {tempMembers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-stone-600">
                Penanggung default
              </label>
              <div className="flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-stone-50/70 p-2.5">
                {tempMembers.map((name) => {
                  const isChecked = defaultParticipants.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleParticipant(name)}
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
                      {name}
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
              <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">4. Review item</p>
              <h3 className="mt-1 text-base font-black text-stone-950">Daftar tagihan dari struk</h3>
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
                  {tempMembers.map((name) => {
                    const isChecked = itemParticipantNames[index]?.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleItemParticipantName(index, name)}
                        disabled={isSubmitting}
                        className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-3 text-[11px] font-bold transition ${
                          isChecked
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-stone-200 bg-white text-stone-600'
                        }`}
                      >
                        {isChecked ? <Check size={10} /> : <span className="w-2" />}
                        {name}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-stone-100 pt-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-stone-500">Pajak (Rp)</label>
              <Input
                type="number"
                value={tax === 0 ? '' : tax}
                onChange={(e) => setTax(Math.max(0, Number(e.target.value)))}
                className="min-h-10 rounded-xl px-3 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-stone-500">Servis (Rp)</label>
              <Input
                type="number"
                value={service === 0 ? '' : service}
                onChange={(e) => setService(Math.max(0, Number(e.target.value)))}
                className="min-h-10 rounded-xl px-3 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-stone-500">Diskon (Rp)</label>
              <Input
                type="number"
                value={discount === 0 ? '' : discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="min-h-10 rounded-xl px-3 text-xs"
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-stone-100 pt-4 text-sm">
            <div className="flex items-center justify-between text-stone-500">
              <span>Subtotal item</span>
              <span className="font-bold">{formatCurrency(itemsSum)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-3 font-black text-green-900">
              <span>Total akhir sesi</span>
              <span>{formatCurrency(calculatedTotal)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-2 pt-2 sm:grid-cols-3">
        <Button onClick={handleSaveSeparately} disabled={isSubmitting} className="w-full text-sm">
          Simpan Sebagai Item Terpisah
        </Button>

        <Button
          onClick={handleSaveAsOne}
          disabled={isSubmitting}
          variant="secondary"
          className="w-full text-sm"
        >
          Simpan Sebagai Satu Tagihan
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
