'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { GroupForm, type GroupFormData } from '@/components/splitbill/GroupForm';
import { getGroupById, updateGroup } from '@/lib/supabaseQueries';
import type { Group } from '@/types';

export default function EditBillPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getGroupById(id);
      setGroup(data);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data grup.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      void fetchGroup();
    }
  }, [id, fetchGroup]);

  const handleUpdateGroup = async (formData: GroupFormData) => {
    await updateGroup(id, formData);
    router.push(`/bill/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <LoadingState message="Memuat formulir pengeditan..." />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen py-12">
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
    <main className="min-h-screen py-8 sm:py-10">
      <Container className="max-w-3xl">
        <Link
          href={`/bill/${id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 transition hover:text-green-700"
        >
          <ArrowLeft size={16} />
          Kembali ke Detail Patungan
        </Link>

        <section className="mb-6 rounded-[32px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(22,101,52,0.10)] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-3xl bg-green-50 text-green-700">
              <Settings2 size={24} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Pengaturan sesi</p>
              <h1 className="mt-2 break-words text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                Edit Tagihan
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
                Perbarui nama kegiatan, catatan, pajak, service, diskon, atau biaya lainnya. Perubahan akan langsung memengaruhi hasil settlement.
              </p>
            </div>
          </div>
        </section>

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
      </Container>
    </main>
  );
}
