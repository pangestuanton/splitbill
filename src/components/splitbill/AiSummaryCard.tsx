'use client';

import { useState } from 'react';
import { Copy, Check, MessageSquare, Sparkles } from 'lucide-react';
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
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghubungi asisten AI.');
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
    <Card className="space-y-4 border-green-100 bg-white">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-green-600" />
        <h3 className="font-black text-stone-900 text-base">Asisten Ringkasan & Share</h3>
      </div>

      <p className="text-xs leading-5 text-stone-500">
        Buat penjelasan ringkas bertenaga AI atau susun teks siap kirim ke WhatsApp grup dengan satu klik.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => generateText('summary')}
          disabled={isLoading}
          variant="secondary"
          className="min-h-11 text-xs gap-1.5 rounded-xl border-green-200 text-green-800 bg-green-50/50 hover:bg-green-50"
        >
          <Sparkles size={14} className="shrink-0" />
          Ringkasan AI
        </Button>

        <Button
          onClick={() => generateText('whatsapp')}
          disabled={isLoading}
          variant="secondary"
          className="min-h-11 text-xs gap-1.5 rounded-xl border-green-200 text-green-800 bg-green-50/50 hover:bg-green-50"
        >
          <MessageSquare size={14} className="shrink-0" />
          Pesan WhatsApp
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-6 gap-2 text-stone-500">
          <div className="size-4 animate-spin rounded-full border-2 border-stone-200 border-t-green-600" />
          <span className="text-xs font-semibold">Sedang merangkum teks...</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {text && (
        <div className="space-y-3">
          <div className="relative rounded-2xl bg-stone-50 p-4 border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-black text-green-700">
                {activeMode === 'whatsapp' ? 'Teks WhatsApp' : 'Penjelasan AI'} {isFallbackMode ? '(Generator Lokal)' : ''}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] font-bold text-stone-500 hover:text-green-700 transition"
                title="Salin Teks"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-green-600" />
                    <span className="text-green-600">Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs text-stone-700 font-sans whitespace-pre-wrap leading-relaxed select-all">
              {text}
            </pre>
          </div>
        </div>
      )}

      <div className="text-[10px] text-stone-400 text-center leading-4 pt-1 border-t border-stone-100">
        ℹ️ Angka hasil kalkulasi dihitung oleh logic internal lokal dan dijamin akurat. AI hanya membantu menyusun deskripsi teks.
      </div>
    </Card>
  );
}
