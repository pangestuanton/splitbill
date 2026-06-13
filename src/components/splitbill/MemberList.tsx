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
    } catch (err: any) {
      setDeleteError(err.message || 'Gagal menghapus anggota.');
    } finally {
      setDeletingId(null);
    }
  };

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-stone-400">
        <Users size={28} className="stroke-1 text-stone-300" />
        <p className="mt-2 text-xs">Belum ada anggota. Tambahkan teman di atas.</p>
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
      <div className="flex flex-wrap gap-2">
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
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 py-1 pl-1.5 pr-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-300"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-green-100 text-[10px] font-black text-green-700">
                {initials}
              </span>
              <span className="max-w-32 truncate">{member.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(member.id)}
                disabled={disabled || isDeleting}
                className="text-stone-400 hover:text-red-600 disabled:opacity-50 transition"
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
