export function LoadingState({ message = 'Memuat data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="size-10 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />
      <p className="mt-4 text-sm font-semibold text-stone-500">{message}</p>
    </div>
  );
}
