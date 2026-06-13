'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Receipt, Calendar, ChevronRight, PlusCircle, ArrowLeft } from 'lucide-react';
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

export default function DashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getGroups();
      setGroups(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat daftar histori patungan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
        <LoadingState message="Memuat riwayat sesi patungan..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 py-10">
      <Container className="max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-stone-900">Riwayat Patungan</h1>
            <p className="mt-1 text-sm text-stone-500">
              Lihat, kelola, dan bagikan kembali sesi split bill yang telah Anda buat.
            </p>
          </div>
          <Link href="/new" className="shrink-0">
            <Button className="min-h-11 rounded-2xl text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold">
              <PlusCircle size={16} />
              Sesi Baru
            </Button>
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 mb-6">
            {error}
          </div>
        )}

        {groups.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Belum ada riwayat patungan"
            description="Anda belum membuat sesi split bill. Klik tombol di bawah untuk mulai menghitung patungan pertama Anda dengan cepat."
            actionLabel="Mulai Split Bill Baru"
            onAction={() => router.push('/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Link key={group.id} href={`/bill/${group.id}`} className="group block">
                <Card className="h-full border-stone-200 bg-white p-5 hover:border-green-300 hover:shadow-md transition duration-200 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-xl bg-green-50 text-green-700 shrink-0">
                        <Receipt size={16} />
                      </span>
                      <h3 className="font-black text-stone-900 text-sm truncate group-hover:text-green-700 transition">
                        {group.name}
                      </h3>
                    </div>
                    {group.description && (
                      <p className="text-xs text-stone-500 leading-normal line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-[10px] text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(group.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-green-700 opacity-0 group-hover:opacity-100 transition">
                      Buka Sesi
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
