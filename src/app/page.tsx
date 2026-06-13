'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calculator, Receipt, Share2, Users, Sparkles, ChevronRight } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { ReceiptScanner } from '@/components/splitbill/ReceiptScanner';
import { HomepageReceiptReview } from '@/components/splitbill/HomepageReceiptReview';
import { createGroup, createMember, createExpense } from '@/lib/supabaseQueries';

const features = [
  {
    icon: Users,
    title: 'Peserta fleksibel',
    description: 'Tambahkan semua teman yang ikut dan pilih siapa saja yang menanggung setiap item.',
  },
  {
    icon: Calculator,
    title: 'Hitung otomatis',
    description: 'Pajak, service, diskon, dan pembagian item dihitung otomatis secara transparan.',
  },
  {
    icon: Share2,
    title: 'Siap dibagikan',
    description: 'Hasil akhir bisa disalin dan dikirim langsung ke grup chat.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [scannedResult, setScannedResult] = useState<any | null>(null);

  const handleScanCompleted = (result: any) => {
    setScannedResult(result);
  };

  const handleConfirmScan = async (data: {
    groupName: string;
    members: string[];
    expenses: Array<{
      title: string;
      amount: number;
      paidByMemberName: string;
      participantNames: string[];
    }>;
  }) => {
    // 1. Create group on Supabase
    const newGroup = await createGroup({
      name: data.groupName,
    });
    const groupId = newGroup.id;

    // 2. Create members and build local name-to-UUID mapper
    const nameToIdMap: Record<string, string> = {};
    for (const name of data.members) {
      const member = await createMember(groupId, name);
      nameToIdMap[name] = member.id;
    }

    // 3. Create expenses mapped to newly created member IDs
    for (const exp of data.expenses) {
      const paid_by_member_id = nameToIdMap[exp.paidByMemberName];
      const participantIds = exp.participantNames.map((name) => nameToIdMap[name]);

      await createExpense(
        {
          group_id: groupId,
          paid_by_member_id,
          title: exp.title,
          amount: exp.amount,
        },
        participantIds,
      );
    }

    // 4. Redirect to details view
    router.push(`/bill/${groupId}`);
  };

  return (
    <main className="min-h-screen bg-white text-stone-950">
      {scannedResult ? (
        // Receipt review screen active
        <section className="bg-stone-50 py-10">
          <Container className="max-w-4xl">
            <HomepageReceiptReview
              scannedResult={scannedResult}
              onConfirm={handleConfirmScan}
              onCancel={() => setScannedResult(null)}
            />
          </Container>
        </section>
      ) : (
        // Standard hero & landing screen
        <>
          <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-20">
            <div>
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-800">
                <Sparkles size={14} className="text-green-600 shrink-0" />
                Sekarang dengan Receipt Scanner AI
              </div>
              <h1 className="text-4xl font-black tracking-tight text-stone-950 md:text-6xl leading-[1.15]">
                Hitung patungan tanpa drama.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 md:text-lg">
                Foto struk belanja/makan Anda dan biarkan AI mendata itemnya otomatis. Tambah anggota, sesuaikan tagihan, lalu bagikan hasil patungan secara instan!
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/new"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-green-600 px-6 font-bold text-white transition hover:bg-green-700 shadow-sm"
                >
                  Mulai Patungan Manual
                </Link>
                <a
                  href="#fitur"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 font-bold text-stone-700 transition hover:bg-stone-50 shadow-sm"
                >
                  Lihat Fitur Utama
                </a>
              </div>
            </div>

            {/* Receipt Scanner Widget positioned in the main hero view */}
            <div className="space-y-4">
              <ReceiptScanner onScanCompleted={handleScanCompleted} />
              
              {/* Fallback mini card design helper for aesthetics */}
              <div className="card-soft p-4 border-stone-200/60 bg-stone-50/20 text-xs">
                <p className="font-bold text-stone-800">💡 Cara penggunaan cepat:</p>
                <ol className="mt-2 space-y-1 list-decimal list-inside text-stone-500">
                  <li>Foto struk belanja makan Anda di atas.</li>
                  <li>AI membaca merchant, tanggal, & daftar item.</li>
                  <li>Review daftar item, masukkan nama teman, & simpan!</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="bg-stone-50 py-16" id="fitur">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="text-2xl font-black md:text-3xl text-center">Patungan Pintar dengan Segudang Kemudahan</h2>
              <p className="text-center text-sm text-stone-500 mt-2 max-w-xl mx-auto">
                SplitBill didesain agar proses membagi uang pengeluaran kelompok menjadi lebih adil, transparan, dan bebas repot.
              </p>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.title} className="card-soft p-6 bg-white border-stone-200">
                    <div className="grid size-12 place-items-center rounded-2xl bg-green-100 text-green-700">
                      <feature.icon size={24} />
                    </div>
                    <h3 className="mt-4 text-lg font-black text-stone-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-500">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-16" id="cara-kerja">
            <h2 className="text-2xl font-black md:text-3xl text-center">3 Langkah Sangat Mudah</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {['Foto Struk / Upload', 'Masukkan Teman', 'Bagikan Hasil Patungan'].map((step, index) => (
                <div key={step} className="rounded-[24px] border border-stone-200 bg-white p-6 relative flex flex-col justify-between h-48 shadow-sm">
                  <div>
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-green-600 font-black text-xs text-white">
                      {index + 1}
                    </span>
                    <h3 className="mt-4 font-black text-stone-900 text-sm">{step}</h3>
                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      {index === 0 
                        ? 'Unggah foto nota struk belanjaan Anda di widget atas agar AI Vision mendata otomatis.'
                        : index === 1
                        ? 'Masukkan nama-nama anggota kelompok yang ikut patungan menanggung biaya.'
                        : 'Salin instruksi transfer transfer bank yang paling sedikit untuk dikirim langsung ke grup WA.'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
