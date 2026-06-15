export function LoadingState({ message = 'Memuat data...' }: { message?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center rounded-[28px] border border-stone-200/80 bg-white p-8 text-center shadow-[0_14px_40px_rgba(22,101,52,0.08)]">
      <div className="grid size-14 place-items-center rounded-3xl bg-green-50">
        <div className="size-8 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />
      </div>
      <p className="mt-4 text-sm font-bold text-stone-700">{message}</p>
      <p className="mt-1 text-xs leading-5 text-stone-400">Sebentar, data patungan sedang disiapkan.</p>
    </div>
  );
}
