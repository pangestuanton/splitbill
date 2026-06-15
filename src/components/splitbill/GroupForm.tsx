'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export interface GroupFormData {
  name: string;
  description: string | null;
  tax_rate: number;
  service_rate: number;
  discount_type: 'fixed' | 'percent';
  discount_value: number;
  extra_fee: number;
}

interface GroupFormProps {
  initialData?: GroupFormData;
  onSubmit: (data: GroupFormData) => Promise<void>;
  submitLabel?: string;
}

export function GroupForm({ initialData, onSubmit, submitLabel = 'Simpan Grup' }: GroupFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [taxRate, setTaxRate] = useState(initialData?.tax_rate || 0);
  const [serviceRate, setServiceRate] = useState(initialData?.service_rate || 0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>(initialData?.discount_type || 'fixed');
  const [discountValue, setDiscountValue] = useState(initialData?.discount_value || 0);
  const [extraFee, setExtraFee] = useState(initialData?.extra_fee || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama grup/kegiatan wajib diisi');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        tax_rate: Number(taxRate) || 0,
        service_rate: Number(serviceRate) || 0,
        discount_type: discountType,
        discount_value: Number(discountValue) || 0,
        extra_fee: Number(extraFee) || 0,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan grup. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <Card className="space-y-5 p-5 sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">Detail sesi</p>
          <h2 className="mt-1 text-lg font-black text-stone-950">Informasi dasar</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Nama ini akan tampil di detail bill, riwayat, dan halaman share.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">
            Nama Kegiatan / Grup *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Makan Malam Alumni, Patungan Villa"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">
            Deskripsi (Opsional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tambahkan catatan singkat mengenai grup ini..."
            className="min-h-24 w-full rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-green-400 focus:ring-4 focus:ring-green-500/15 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400"
            disabled={isSubmitting}
          />
        </div>
      </Card>

      <Card className="space-y-5 p-5 sm:p-6">
        <div className="border-b border-stone-100 pb-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">Opsional</p>
          <h2 className="mt-1 text-lg font-black text-stone-950">Biaya tambahan dan diskon</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Pajak, service, diskon, dan biaya lain akan masuk ke kalkulasi proporsional.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Pajak (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={taxRate === 0 ? '' : taxRate}
              onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Service Charge (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={serviceRate === 0 ? '' : serviceRate}
              onChange={(e) => setServiceRate(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Tipe Diskon
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percent')}
              className="min-h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm text-stone-950 shadow-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-500/15"
              disabled={isSubmitting}
            >
              <option value="fixed">Rupiah (Rp)</option>
              <option value="percent">Persen (%)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Nilai Diskon
            </label>
            <Input
              type="number"
              min="0"
              value={discountValue === 0 ? '' : discountValue}
              onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1">
            Biaya Lainnya / Ongkir (Rp)
          </label>
          <Input
            type="number"
            min="0"
            value={extraFee === 0 ? '' : extraFee}
            onChange={(e) => setExtraFee(Math.max(0, Number(e.target.value)))}
            placeholder="0"
            disabled={isSubmitting}
          />
        </div>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting || !name.trim()}>
        {isSubmitting ? 'Memproses...' : submitLabel}
      </Button>
    </form>
  );
}
