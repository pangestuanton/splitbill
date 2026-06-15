'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calculator, CheckCircle2, Receipt, Share2, Sparkles, Users } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { ReceiptScanner } from '@/components/splitbill/ReceiptScanner';
import { HomepageReceiptReview } from '@/components/splitbill/HomepageReceiptReview';
import { createGroup, createMember, createExpense } from '@/lib/supabaseQueries';

interface ScannedItem {
  name: string;
  amount: number;
}

interface ScannedReceiptResult {
  merchant?: string | null;
  date?: string | null;
  items: ScannedItem[];
  subtotal?: number;
  tax?: number;
  service?: number;
  discount?: number;
  total?: number;
}

const features = [
  {
    icon: Users,
    title: 'Peserta fleksibel',
    description: 'Pilih siapa saja yang ikut menanggung tiap item, bukan sekadar bagi rata semua.',
  },
  {
    icon: Calculator,
    title: 'Hitung otomatis',
    description: 'Pajak, service, diskon, dan biaya tambahan dibagi proporsional dengan jelas.',
  },
  {
    icon: Share2,
    title: 'Siap dikirim',
    description: 'Ringkasan hasil dibuat rapi agar mudah disalin ke WhatsApp atau grup chat.',
  },
];

const steps = [
  {
    title: 'Foto struk atau isi manual',
    description: 'Mulai dari scanner AI atau buat sesi baru jika ingin input sendiri.',
  },
  {
    title: 'Atur teman dan item',
    description: 'Tentukan pembayar dan penanggung untuk setiap pengeluaran.',
  },
  {
    title: 'Bagikan hasil transfer',
    description: 'Lihat siapa harus transfer ke siapa dengan instruksi yang ringkas.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [scannedResult, setScannedResult] = useState<ScannedReceiptResult | null>(null);

  const handleScanCompleted = (result: ScannedReceiptResult) => {
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
    const newGroup = await createGroup({
      name: data.groupName,
    });
    const groupId = newGroup.id;

    const nameToIdMap: Record<string, string> = {};
    for (const name of data.members) {
      const member = await createMember(groupId, name);
      nameToIdMap[name] = member.id;
    }

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

    router.push(`/bill/${groupId}`);
  };

  return (
    <main className="min-h-screen text-stone-950">
      {scannedResult ? (
        <section className="py-8 sm:py-12">
          <Container className="max-w-5xl">
            <HomepageReceiptReview
              scannedResult={scannedResult}
              onConfirm={handleConfirmScan}
              onCancel={() => setScannedResult(null)}
            />
          </Container>
        </section>
      ) : (
        <>
          <section className="overflow-hidden">
            <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-black text-green-800 shadow-sm">
                  <Sparkles size={14} className="text-green-600" />
                  Split bill cepat, transparan, dan mobile-first
                </div>

                <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
                  Hitung patungan tanpa drama.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
                  Buat tagihan, pilih siapa makan apa, lalu lihat instruksi transfer yang paling jelas. Bisa mulai manual atau langsung dari foto struk.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/new"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-green-600 px-6 font-bold text-white shadow-[0_14px_30px_rgba(22,163,74,0.22)] transition hover:bg-green-700 active:scale-[0.98]"
                  >
                    Mulai Split Bill
                  </Link>
                  <a
                    href="#fitur"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-green-200 bg-white px-6 font-bold text-green-800 shadow-sm transition hover:bg-green-50 active:scale-[0.98]"
                  >
                    Lihat Cara Kerja
                  </a>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {['Item tidak harus rata', 'Pajak proporsional', 'Hasil siap share'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 text-xs font-bold text-stone-700 shadow-sm">
                      <CheckCircle2 size={15} className="text-green-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[32px] border border-green-200/80 bg-white p-3 shadow-[0_22px_60px_rgba(22,101,52,0.12)]">
                  <ReceiptScanner onScanCompleted={handleScanCompleted} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-stone-400">Contoh total</p>
                    <p className="mt-2 text-3xl font-black text-stone-950">Rp184.000</p>
                    <p className="mt-2 text-sm leading-6 text-stone-500">3 peserta, 5 item, pajak dan service sudah masuk.</p>
                  </div>
                  <div className="rounded-[24px] border border-green-200 bg-green-50 p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-green-700">Settlement</p>
                    <div className="mt-3 space-y-2 text-sm font-bold text-green-950">
                      <p>Diki transfer Rp22.000</p>
                      <p>Rani transfer Rp20.000</p>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>

          <section className="border-y border-stone-200/70 bg-white/72 py-14" id="fitur">
            <Container>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Fitur utama</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
                  Semua detail patungan tetap mudah dibaca.
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-500">
                  SplitBill didesain untuk kondisi nyata: beda pesanan, beda pembayar, ada pajak, ada diskon, dan hasilnya perlu cepat dibagikan.
                </p>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {features.map((feature) => (
                  <article key={feature.title} className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_14px_40px_rgba(22,101,52,0.08)] transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-[0_20px_50px_rgba(22,101,52,0.12)]">
                    <div className="grid size-12 place-items-center rounded-2xl bg-green-100 text-green-700">
                      <feature.icon size={24} />
                    </div>
                    <h3 className="mt-5 text-lg font-black text-stone-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-500">{feature.description}</p>
                  </article>
                ))}
              </div>
            </Container>
          </section>

          <section className="py-14 sm:py-16" id="cara-kerja">
            <Container>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Cara kerja</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
                  Tiga langkah sampai hasil siap dikirim.
                </h2>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {steps.map((step, index) => (
                  <article key={step.title} className="relative rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
                    <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-green-600 text-sm font-black text-white shadow-[0_10px_24px_rgba(22,163,74,0.18)]">
                      {index + 1}
                    </span>
                    <h3 className="mt-5 text-base font-black text-stone-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-500">{step.description}</p>
                  </article>
                ))}
              </div>

              <div className="mt-10 rounded-[32px] border border-green-200 bg-green-50 p-6 text-center sm:p-8">
                <Receipt className="mx-auto text-green-700" size={30} />
                <h3 className="mt-3 text-xl font-black text-green-950">Siap mulai dari struk atau input manual.</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-green-800/80">
                  Gunakan scanner di atas untuk mempercepat input item, atau buat sesi kosong jika ingin membangun daftar dari awal.
                </p>
              </div>
            </Container>
          </section>
        </>
      )}
    </main>
  );
}
