'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ReceiptScannerProps {
  onScanCompleted: (result: any) => void;
  disabled?: boolean;
}

export function ReceiptScanner({ onScanCompleted, disabled = false }: ReceiptScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImage(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScan = async () => {
    if (!image) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/receipt-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'NO_API_KEY') {
          throw new Error('OPENROUTER_API_KEY belum dikonfigurasi. Harap atur API key untuk menggunakan fitur scan struk.');
        }
        throw new Error(data.error || 'Gagal memindai struk belanja.');
      }

      onScanCompleted(data);
      handleClearImage(); // Reset scanner after completion
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memindai struk.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-stone-200 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-green-600" />
        <h3 className="font-black text-stone-900 text-sm">Scan Struk Belanja (AI Vision)</h3>
      </div>

      {!image ? (
        <div className="flex flex-col items-center justify-center py-6 px-4 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50 hover:bg-stone-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={disabled}
          />
          <div className="grid size-11 place-items-center rounded-2xl bg-green-50 text-green-700 mb-3">
            <Camera size={20} />
          </div>
          <p className="text-xs font-semibold text-stone-700">Unggah foto struk belanja</p>
          <p className="mt-1 text-[10px] text-stone-400">Ketuk untuk mengambil foto atau pilih dari galeri</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-stone-200 aspect-[4/3] bg-stone-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Preview Struk" className="max-h-full max-w-full object-contain" />
            <button
              onClick={handleClearImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900/60 text-white hover:bg-stone-900/80 transition"
              disabled={isLoading}
              title="Batalkan"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 pl-1">
            <span className="truncate max-w-[200px] font-semibold">{fileName}</span>
            <button
              onClick={handleClearImage}
              className="text-stone-400 hover:text-red-500 font-bold"
              disabled={isLoading}
            >
              Hapus
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <Button
            onClick={handleScan}
            disabled={isLoading || disabled}
            className="w-full min-h-11 rounded-2xl text-xs gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Membaca Struk (AI)...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Scan & Analisis Struk
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
