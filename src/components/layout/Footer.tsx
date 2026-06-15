export function Footer() {
  return (
    <footer className="border-t border-stone-200/60 bg-white/80 py-8 text-stone-500">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
        <div>
          <p className="text-sm font-black text-green-800">SplitBill</p>
          <p className="mt-1 text-xs text-stone-400">
            Hitung patungan jadi lebih gampang, cepat, dan transparan.
          </p>
        </div>
        <div className="text-xs">
          <p>(c) {new Date().getFullYear()} SplitBill. Semua hak dilindungi.</p>
          <p className="mt-1 text-stone-400">
            Dibuat menggunakan Next.js + Tailwind CSS + Supabase.
          </p>
        </div>
      </div>
    </footer>
  );
}
