'use client';

import { useState } from 'react';
import { Check, Copy, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ParticipantInfo {
  name: string;
  totalOwed: number;
  paid: number;
  balance: number;
}

interface SettlementInfo {
  fromName: string;
  toName: string;
  amount: number;
}

interface AiSummaryCardProps {
  groupName: string;
  total: number;
  participants: ParticipantInfo[];
  settlements: SettlementInfo[];
}

export function AiSummaryCard({ groupName, total, participants, settlements }: AiSummaryCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [activeMode, setActiveMode] = useState<'summary' | 'whatsapp' | null>(null);

  const generateText = async (mode: 'summary' | 'whatsapp') => {
    try {
      setIsLoading(true);
      setError(null);
      setText(null);
      setActiveMode(mode);

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName,
          total,
          participants,
          settlements,
          mode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses permintaan.');
      }

      setText(data.result);
      setIsFallbackMode(data.isFallback || false);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Gagal menghubungi asisten AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Card className="space-y-5 border-green-100 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
          <Sparkles size={20} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-black text-stone-950">Asisten Ringkasan dan Share</h3>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Buat penjelasan ringkas atau teks siap kirim ke WhatsApp grup dengan satu klik.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => generateText('summary')}
          disabled={isLoading}
          variant="secondary"
          className="min-h-12 rounded-2xl border-green-200 bg-green-50/70 text-xs text-green-800 hover:bg-green-100"
        >
          <Sparkles size={14} className="shrink-0" />
          Ringkasan AI
        </Button>

        <Button
          onClick={() => generateText('whatsapp')}
          disabled={isLoading}
          variant="secondary"
          className="min-h-12 rounded-2xl border-green-200 bg-green-50/70 text-xs text-green-800 hover:bg-green-100"
        >
          <MessageSquare size={14} className="shrink-0" />
          Pesan WA
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-stone-50 py-6 text-stone-500">
          <div className="size-4 animate-spin rounded-full border-2 border-stone-200 border-t-green-600" />
          <span className="text-xs font-semibold">Sedang merangkum teks...</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {text && (
        <div className="space-y-3">
          <div className="relative rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black text-green-700">
                {activeMode === 'whatsapp' ? 'Teks WhatsApp' : 'Penjelasan AI'}
                {isFallbackMode ? ' - Generator Lokal' : ''}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-stone-500 transition hover:bg-white hover:text-green-700"
                title="Salin Teks"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-green-600" />
                    <span className="text-green-600">Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <pre className="select-all whitespace-pre-wrap font-sans text-xs leading-relaxed text-stone-700">
              {text}
            </pre>
          </div>
        </div>
      )}

      <div className="border-t border-stone-100 pt-4 text-center text-[11px] leading-5 text-stone-400">
        Angka hasil kalkulasi dihitung oleh logic internal lokal. AI hanya membantu menyusun deskripsi teks.
      </div>
    </Card>
  );
}
