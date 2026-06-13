import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-stone-200/60 bg-stone-50 py-8 text-stone-500">
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="text-sm font-bold text-green-800">SplitBill</p>
          <p className="mt-1 text-xs text-stone-400">
            Hitung patungan jadi lebih gampang, cepat, dan transparan.
          </p>
        </div>
        <div className="text-xs">
          <p>© {new Date().getFullYear()} SplitBill. Semua hak dilindungi.</p>
          <p className="mt-1 text-stone-400">
            Dibuat menggunakan Next.js + Tailwind CSS + Supabase.
          </p>
        </div>
      </div>
    </footer>
  );
}
