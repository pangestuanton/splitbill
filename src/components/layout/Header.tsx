import Link from 'next/link';
import { Receipt } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-green-800">
          <span className="grid size-9 place-items-center rounded-2xl bg-green-100 text-green-700">
            <Receipt size={20} />
          </span>
          SplitBill
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-stone-600 transition hover:text-green-700"
          >
            Riwayat
          </Link>
          <Link
            href="/new"
            className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-green-600 px-4 py-1 text-sm font-bold text-white transition hover:bg-green-700"
          >
            Mulai
          </Link>
        </div>
      </div>
    </header>
  );
}
