'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface MemberFormProps {
  onAddMember: (name: string) => Promise<void>;
  disabled?: boolean;
}

export function MemberForm({ onAddMember, disabled = false }: MemberFormProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setError(null);
      setIsSubmitting(true);
      await onAddMember(name.trim());
      setName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan anggota.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama teman (misal: Andi, Budi)"
          disabled={disabled || isSubmitting}
          maxLength={30}
          className="flex-1 rounded-2xl text-sm"
          required
        />
        <Button
          type="submit"
          variant="primary"
          className="rounded-2xl px-4 sm:w-auto"
          disabled={disabled || isSubmitting || !name.trim()}
        >
          <Plus size={18} />
          Tambah
        </Button>
      </form>
      {error && (
        <p className="text-xs font-semibold text-red-600 pl-1">{error}</p>
      )}
    </div>
  );
}
