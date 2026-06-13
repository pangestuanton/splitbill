'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GroupForm } from '@/components/splitbill/GroupForm';
import { createGroup } from '@/lib/supabaseQueries';
import { Container } from '@/components/layout/Container';

export default function NewBillPage() {
  const router = useRouter();

  const handleCreateGroup = async (formData: any) => {
    const newGroup = await createGroup(formData);
    if (newGroup && newGroup.id) {
      router.push(`/bill/${newGroup.id}`);
    } else {
      throw new Error('Gagal mendapatkan ID grup yang baru dibuat.');
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 py-10">
      <Container className="max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-bold text-green-700 hover:underline mb-6"
        >
          ← Kembali ke Beranda
        </Link>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black text-stone-900">Buat Split Bill Baru</h1>
            <p className="mt-2 text-sm text-stone-500">
              Mulai sesi baru untuk menghitung patungan dengan memasukkan nama kegiatan dan opsional detail pajak atau diskon.
            </p>
          </div>

          <GroupForm onSubmit={handleCreateGroup} submitLabel="Mulai Tambah Teman & Tagihan" />
        </div>
      </Container>
    </main>
  );
}
