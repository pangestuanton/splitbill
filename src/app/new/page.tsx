'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ReceiptText, Sparkles } from 'lucide-react';
import { GroupForm, type GroupFormData } from '@/components/splitbill/GroupForm';
import { createGroup } from '@/lib/supabaseQueries';
import { Container } from '@/components/layout/Container';

export default function NewBillPage() {
  const router = useRouter();

  const handleCreateGroup = async (formData: GroupFormData) => {
    const newGroup = await createGroup(formData);
    if (newGroup && newGroup.id) {
      router.push(`/bill/${newGroup.id}`);
    } else {
      throw new Error('Gagal mendapatkan ID grup yang baru dibuat.');
    }
  };

  return (
    <main className="min-h-screen py-8 sm:py-10">
      <Container className="max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 transition hover:text-green-700"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        <section className="mb-6 overflow-hidden rounded-[32px] border border-green-200 bg-white shadow-[0_20px_60px_rgba(22,101,52,0.10)]">
          <div className="leaf-gradient p-6 text-white sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-3xl bg-white/18 text-white">
                <ReceiptText size={24} />
              </span>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/16 px-3 py-1 text-xs font-black">
                  <Sparkles size={13} />
                  Sesi baru
                </span>
                <h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl">Buat Split Bill Baru</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/82">
                  Mulai dari nama kegiatan dulu. Setelah tersimpan, Anda bisa menambahkan anggota, tagihan, scanner struk, dan melihat settlement.
                </p>
              </div>
            </div>
          </div>
        </section>

        <GroupForm onSubmit={handleCreateGroup} submitLabel="Mulai Tambah Teman dan Tagihan" />
      </Container>
    </main>
  );
}
