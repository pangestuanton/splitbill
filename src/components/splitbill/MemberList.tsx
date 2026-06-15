'use client';

import { useState } from 'react';
import { Trash2, Users } from 'lucide-react';
import type { Member } from '@/types';

interface MemberListProps {
  members: Member[];
  onDeleteMember: (id: string) => Promise<void>;
  disabled?: boolean;
}

export function MemberList({ members, onDeleteMember, disabled = false }: MemberListProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeleteError(null);
      setDeletingId(id);
      await onDeleteMember(id);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus anggota.');
    } finally {
      setDeletingId(null);
    }
  };

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 p-6 text-center text-stone-400">
        <Users size={28} className="mx-auto stroke-1 text-stone-300" />
        <p className="mt-2 text-sm font-bold text-stone-500">Belum ada anggota.</p>
        <p className="mt-1 text-xs">Tambahkan teman di atas untuk mulai membagi tagihan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deleteError && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
          {deleteError}
        </div>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {members.map((member) => {
          const initials = member.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

          const isDeleting = deletingId === member.id;

          return (
            <div
              key={member.id}
              className="flex min-w-0 items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-2.5 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-green-200 hover:bg-green-50/50"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-[11px] font-black text-green-700">
                {initials}
              </span>
              <span className="min-w-0 flex-1 truncate">{member.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(member.id)}
                disabled={disabled || isDeleting}
                className="rounded-full p-1.5 text-stone-400 transition hover:bg-white hover:text-red-600 disabled:opacity-50"
                title="Hapus Anggota"
              >
                <Trash2 size={14} className={isDeleting ? 'animate-pulse text-red-500' : ''} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
