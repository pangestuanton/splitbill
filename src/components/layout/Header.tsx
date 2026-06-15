import Link from 'next/link';
import { Receipt, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-black text-green-800">
          <span className="grid size-10 place-items-center rounded-2xl bg-green-100 text-green-700 shadow-sm">
            <Receipt size={20} />
          </span>
          <span className="tracking-tight">SplitBill</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/#fitur"
            className="text-sm font-semibold text-stone-600 transition hover:text-green-700"
          >
            Fitur
          </Link>
          <Link
            href="/#cara-kerja"
            className="text-sm font-semibold text-stone-600 transition hover:text-green-700"
          >
            Cara pakai
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-stone-600 transition hover:text-green-700"
          >
            Riwayat
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-black text-green-800 sm:inline-flex">
            <Sparkles size={12} />
            AI scanner
          </span>
          <Link
            href="/new"
            className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-green-600 px-4 py-1 text-sm font-bold text-white shadow-[0_10px_24px_rgba(22,163,74,0.18)] transition hover:bg-green-700 active:scale-[0.98]"
          >
            Mulai
          </Link>
        </div>
      </div>
    </header>
  );
}
