'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { GroupForm } from '@/components/splitbill/GroupForm';
import { getGroupById, updateGroup } from '@/lib/supabaseQueries';
import type { Group } from '@/types';

export default function EditBillPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getGroupById(id);
      setGroup(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data grup.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchGroup();
  }, [id]);

  const handleUpdateGroup = async (formData: any) => {
    await updateGroup(id, formData);
    router.push(`/bill/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
        <LoadingState message="Memuat formulir pengeditan..." />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
        <Container className="max-w-xl">
          <ErrorState
            title="Gagal Memuat Grup"
            description={error || 'Grup tidak ditemukan.'}
            actionLabel="Kembali ke Detail"
            onAction={() => router.push(`/bill/${id}`)}
          />
        </Container>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 py-10">
      <Container className="max-w-2xl">
        <Link
          href={`/bill/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 hover:underline mb-6"
        >
          <ArrowLeft size={16} />
          Kembali ke Detail Patungan
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black text-stone-900">Edit Pengaturan Tagihan</h1>
            <p className="mt-2 text-sm text-stone-500">
              Perbarui nama kegiatan, rincian pajak, biaya service, diskon, atau ongkos kirim.
            </p>
          </div>

          <GroupForm
            initialData={{
              name: group.name,
              description: group.description,
              tax_rate: Number(group.tax_rate) || 0,
              service_rate: Number(group.service_rate) || 0,
              discount_type: group.discount_type,
              discount_value: Number(group.discount_value) || 0,
              extra_fee: Number(group.extra_fee) || 0,
            }}
            onSubmit={handleUpdateGroup}
            submitLabel="Simpan Perubahan"
          />
        </div>
      </Container>
    </main>
  );
}
