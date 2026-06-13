'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Trash2, Check, X, FileText, Sparkles, Users, UserPlus } from 'lucide-react';
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

export function HomepageReceiptReview({ scannedResult, onConfirm, onCancel }: HomepageReceiptReviewProps) {
  const [groupName, setGroupName] = useState(scannedResult.merchant || 'Makan Bareng Teman');
  const [items, setItems] = useState<ScannedItem[]>(scannedResult.items || []);
  const [tax, setTax] = useState(scannedResult.tax || 0);
  const [service, setService] = useState(scannedResult.service || 0);
  const [discount, setDiscount] = useState(scannedResult.discount || 0);
  const receiptTotal = scannedResult.total || 0;

  // Temporary members state (since we are creating them on the fly)
  const [newMemberName, setNewMemberName] = useState('');
  const [tempMembers, setTempMembers] = useState<string[]>(['Saya', 'Teman 1', 'Teman 2']);
  
  // Paid by member name
  const [paidBy, setPaidBy] = useState('Saya');
  // Default participant names
  const [defaultParticipants, setDefaultParticipants] = useState<string[]>(['Saya', 'Teman 1', 'Teman 2']);
  const [itemParticipantNames, setItemParticipantNames] = useState<string[][]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-sync default participants when tempMembers change
  useEffect(() => {
    setDefaultParticipants(tempMembers);
    if (tempMembers.length > 0 && !tempMembers.includes(paidBy)) {
      setPaidBy(tempMembers[0]);
    }
    setItemParticipantNames(items.map(() => tempMembers.slice()));
  }, [tempMembers, items]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newMemberName.trim();
    if (!cleanName) return;
    if (tempMembers.includes(cleanName)) {
      setError('Nama teman sudah terdaftar');
      return;
    }
    setTempMembers([...tempMembers, cleanName]);
    setNewMemberName('');
    setError(null);
  };

  const handleRemoveMember = (nameToRemove: string) => {
    if (tempMembers.length <= 2) {
      setError('Sesi patungan minimal harus memiliki 2 orang');
      return;
    }
    setTempMembers(tempMembers.filter((name) => name !== nameToRemove));
    setError(null);
  };

  // Sum calculations
  const itemsSum = items.reduce((sum, item) => sum + item.amount, 0);
  const calculatedTotal = itemsSum + tax + service - discount;
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
    setItemParticipantNames((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleParticipant = (name: string) => {
    if (defaultParticipants.includes(name)) {
      setDefaultParticipants(defaultParticipants.filter((n) => n !== name));
    } else {
      setDefaultParticipants([...defaultParticipants, name]);
    }
  };

  const toggleItemParticipantName = (itemIndex: number, name: string) => {
    setItemParticipantNames((prev) => {
      const next = prev.map((row) => [...row]);
      const selected = next[itemIndex] || [];
      const found = selected.includes(name);
      next[itemIndex] = found ? selected.filter((n) => n !== name) : [...selected, name];
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

      const expensesToCreate = items.map((item, idx) => ({
        title: item.name || 'Item Tanpa Nama',
        amount: item.amount,
        paidByMemberName: paidBy,
        participantNames: itemParticipantNames[idx] && itemParticipantNames[idx].length > 0 ? itemParticipantNames[idx] : defaultParticipants,
      }));

      // Add tax and service if present
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
    } catch (err: any) {
      setError(err.message || 'Gagal membuat sesi patungan.');
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

      const expensesToCreate = [
        {
          title: `Struk Belanja: ${groupName}`,
          amount: finalAmount,
          paidByMemberName: paidBy,
          participantNames: defaultParticipants,
        },
      ];

      await onConfirm({
        groupName: groupName.trim(),
        members: tempMembers,
        expenses: expensesToCreate,
      });
    } catch (err: any) {
      setError(err.message || 'Gagal membuat sesi patungan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-green-600 animate-pulse" size={22} />
          <h2 className="text-xl font-black text-stone-900">Review & Buat Patungan Baru</h2>
        </div>
        <button
          onClick={onCancel}
          className="text-stone-400 hover:text-stone-600 transition p-1"
          disabled={isSubmitting}
          title="Batalkan"
        >
          <X size={22} />
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
            <span className="font-bold">Perhatian:</span> Total struk dari AI (
            <span className="font-bold">{formatCurrency(receiptTotal)}</span>) berbeda dengan jumlah item yang terbaca (
            <span className="font-bold">{formatCurrency(calculatedTotal)}</span>). Anda bisa menyesuaikan nilainya di bawah.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left wizard column */}
        <div className="space-y-4">
          {/* Step 1: Group Name */}
          <Card className="p-4 border-stone-200 bg-white">
            <h3 className="text-xs font-black uppercase tracking-wider text-green-700 mb-3">1. Nama Kegiatan</h3>
            <div>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Contoh: Makan Siang KFC, Villa Puncak"
                className="text-sm rounded-xl"
                disabled={isSubmitting}
                required
              />
            </div>
          </Card>

          {/* Step 2: Friend List */}
          <Card className="p-4 border-stone-200 bg-white">
            <h3 className="text-xs font-black uppercase tracking-wider text-green-700 mb-3">
              2. Teman Yang Ikut Patungan
            </h3>
            <div className="space-y-3">
              <form onSubmit={handleAddMember} className="flex gap-2">
                <Input
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Nama teman..."
                  className="text-xs rounded-xl flex-grow min-h-9"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  className="min-h-9 px-3.5 text-xs rounded-xl"
                  disabled={isSubmitting || !newMemberName.trim()}
                >
                  <UserPlus size={14} className="mr-1" />
                  Tambah
                </Button>
              </form>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {tempMembers.map((name) => (
                  <div
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 py-0.5 pl-2.5 pr-1.5 text-xs font-semibold text-stone-700"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(name)}
                      className="text-stone-400 hover:text-red-500 transition p-0.5 rounded-full"
                      disabled={isSubmitting}
                      title="Hapus"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Step 3: Payer & default participants */}
          <Card className="p-4 border-stone-200 bg-white space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-green-700">
              3. Siapa Yang Membayar Terlebih Dahulu?
            </h3>
            <div>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="min-h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-stone-950 text-xs outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-500/15"
                disabled={isSubmitting}
              >
                {tempMembers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                Siapa saja yang menanggung tagihan? (Default)
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-stone-200 bg-stone-50/50">
                {tempMembers.map((name) => {
                  const isChecked = defaultParticipants.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleParticipant(name)}
                      disabled={isSubmitting}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold border transition ${
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
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Right review items column */}
        <div className="space-y-4">
          <Card className="p-4 border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-green-700">4. Review Item Tagihan</h3>
              <button
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 hover:underline"
                disabled={isSubmitting}
              >
                <Plus size={12} />
                Tambah
              </button>
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-3 pr-1 mb-3">
              {items.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                  <div className="flex gap-2 items-center">
                    <Input
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      placeholder="Nama Item"
                      className="text-[11px] rounded-xl flex-grow min-h-8 px-2.5"
                      disabled={isSubmitting}
                    />
                    <Input
                      type="number"
                      value={item.amount === 0 ? '' : item.amount}
                      onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                      placeholder="Harga"
                      className="text-[11px] rounded-xl w-20 min-h-8 px-2.5"
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-stone-400 hover:text-red-500 transition p-1 shrink-0"
                      disabled={isSubmitting}
                      title="Hapus"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tempMembers.map((name) => {
                      const isChecked = itemParticipantNames[idx]?.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleItemParticipantName(idx, name)}
                          disabled={isSubmitting}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold border transition ${
                            isChecked ? 'border-green-200 bg-green-50 text-green-800' : 'border-stone-200 bg-white text-stone-600'
                          }`}
                        >
                          {isChecked ? <Check size={10} /> : <span className="w-3" />}
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 border-t border-stone-100 pt-3 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal Item:</span>
                <span>{formatCurrency(itemsSum)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-stone-500">Pajak (Rp)</label>
                  <Input
                    type="number"
                    value={tax === 0 ? '' : tax}
                    onChange={(e) => setTax(Math.max(0, Number(e.target.value)))}
                    className="text-[10px] min-h-7 rounded-lg px-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500">Servis (Rp)</label>
                  <Input
                    type="number"
                    value={service === 0 ? '' : service}
                    onChange={(e) => setService(Math.max(0, Number(e.target.value)))}
                    className="text-[10px] min-h-7 rounded-lg px-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500">Diskon (Rp)</label>
                  <Input
                    type="number"
                    value={discount === 0 ? '' : discount}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    className="text-[10px] min-h-7 rounded-lg px-2"
                  />
                </div>
              </div>
              <div className="flex justify-between font-black text-green-800 pt-2 border-t border-stone-100">
                <span>Total Akhir Sesi:</span>
                <span>{formatCurrency(calculatedTotal)}</span>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleSaveSeparately}
              disabled={isSubmitting}
              className="w-full text-xs font-black min-h-11 rounded-2xl"
            >
              Simpan & Masukkan Sebagai Item Terpisah
            </Button>
            
            <Button
              onClick={handleSaveAsOne}
              disabled={isSubmitting}
              variant="secondary"
              className="w-full text-xs font-black min-h-11 border-green-200 text-green-800 bg-green-50/50 rounded-2xl"
            >
              Simpan & Masukkan Sebagai Satu Tagihan
            </Button>

            <Button
              onClick={onCancel}
              variant="ghost"
              disabled={isSubmitting}
              className="w-full text-xs font-semibold min-h-10 text-stone-500 hover:bg-stone-50"
            >
              Batalkan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
