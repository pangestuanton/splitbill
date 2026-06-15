'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronRight, Clock3, PlusCircle, Receipt, Sparkles } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getGroups } from '@/lib/supabaseQueries';

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getGroups();
      setGroups(data || []);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar histori patungan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGroups();
  }, [fetchGroups]);

  const latestGroup = groups[0];

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <LoadingState message="Memuat riwayat sesi patungan..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen py-8 sm:py-10">
      <Container className="max-w-5xl">
        <section className="overflow-hidden rounded-[32px] border border-green-200/80 bg-white shadow-[0_20px_60px_rgba(22,101,52,0.10)]">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-green-800">
                <Sparkles size={14} />
                Dashboard patungan
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                Riwayat sesi yang mudah dibuka lagi.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
                Lanjutkan pengelolaan bill, salin link share, atau buat sesi baru ketika mulai patungan berikutnya.
              </p>
            </div>

            <div className="rounded-[28px] border border-green-200 bg-green-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-green-700">Ringkasan</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-3xl font-black text-stone-950">{groups.length}</p>
                  <p className="mt-1 text-xs font-bold text-stone-500">Sesi tersimpan</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <Clock3 size={22} className="text-green-700" />
                  <p className="mt-2 text-xs font-bold leading-5 text-stone-600">
                    {latestGroup ? `Terakhir ${formatDate(latestGroup.created_at)}` : 'Belum ada sesi'}
                  </p>
                </div>
              </div>
              <Link href="/new" className="mt-4 block">
                <Button className="w-full">
                  <PlusCircle size={18} />
                  Buat Sesi Baru
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-stone-950">Semua riwayat</h2>
              <p className="mt-1 text-sm text-stone-500">Pilih sesi untuk melihat detail, anggota, item, dan settlement.</p>
            </div>
          </div>

          {groups.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Belum ada riwayat patungan"
              description="Anda belum membuat sesi split bill. Mulai dari sesi baru atau scan struk dari halaman utama."
              actionLabel="Mulai Split Bill Baru"
              onAction={() => router.push('/new')}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {groups.map((group) => (
                <Link key={group.id} href={`/bill/${group.id}`} className="group block">
                  <Card className="flex h-full flex-col justify-between p-5 transition duration-200 hover:-translate-y-0.5 hover:border-green-300 hover:shadow-[0_20px_50px_rgba(22,101,52,0.12)]">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
                          <Receipt size={20} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-stone-900 transition group-hover:text-green-700">
                            {group.name}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-stone-400">
                            <Calendar size={13} />
                            {formatDate(group.created_at)}
                          </p>
                        </div>
                      </div>
                      {group.description ? (
                        <p className="line-clamp-2 text-sm leading-6 text-stone-500">{group.description}</p>
                      ) : (
                        <p className="text-sm leading-6 text-stone-400">Belum ada deskripsi untuk sesi ini.</p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black text-stone-500">
                        Split bill
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-black text-green-700">
                        Buka sesi
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
