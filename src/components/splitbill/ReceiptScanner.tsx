'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export interface ReceiptScanResult {
  merchant?: string | null;
  date?: string | null;
  items: Array<{ name: string; amount: number }>;
  subtotal?: number;
  tax?: number;
  service?: number;
  discount?: number;
  total?: number;
  confidence?: string;
}

interface ReceiptScannerProps {
  onScanCompleted: (result: ReceiptScanResult) => void;
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
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize image if it exceeds 1024px to keep base64 size small and fast
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress quality to 70% JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImage(dataUrl);
        } else {
          setImage(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
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

      let data: (Partial<ReceiptScanResult> & { code?: string; error?: string }) = {};
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = (await response.json()) as Partial<ReceiptScanResult> & { code?: string; error?: string };
      } else {
        const errorText = await response.text();
        throw new Error(errorText || `Gagal menghubungi server (Status: ${response.status})`);
      }

      if (!response.ok) {
        if (data.code === 'NO_API_KEY') {
          throw new Error('OPENROUTER_API_KEY belum dikonfigurasi. Harap atur API key untuk menggunakan fitur scan struk.');
        }
        throw new Error(data.error || 'Gagal memindai struk belanja.');
      }

      onScanCompleted({
        merchant: data.merchant,
        date: data.date,
        items: data.items || [],
        subtotal: data.subtotal,
        tax: data.tax,
        service: data.service,
        discount: data.discount,
        total: data.total,
        confidence: data.confidence,
      });
      handleClearImage(); // Reset scanner after completion
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memindai struk.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="space-y-4 border-dashed border-green-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-black text-stone-950">Scan Struk Belanja</h3>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Unggah foto struk agar AI membantu membaca merchant, total, dan daftar item.
          </p>
        </div>
      </div>

      {!image ? (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={disabled}
          />
          <button
            type="button"
            className="flex w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-green-200 bg-green-50/50 px-4 py-8 text-center transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <div className="mb-3 grid size-14 place-items-center rounded-3xl bg-white text-green-700 shadow-sm">
              <Camera size={24} />
            </div>
            <p className="text-sm font-black text-stone-800">Pilih atau ambil foto struk</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              Format gambar umum didukung. Foto akan dikompresi sebelum dianalisis.
            </p>
          </button>
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[24px] border border-stone-200 bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Preview Struk" className="max-h-full max-w-full object-contain" />
            <button
              onClick={handleClearImage}
              className="absolute right-2 top-2 rounded-full bg-stone-900/60 p-1.5 text-white transition hover:bg-stone-900/80"
              disabled={isLoading}
              title="Batalkan"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pl-1 text-xs text-stone-500">
            <span className="max-w-[220px] truncate font-semibold">{fileName}</span>
            <button
              onClick={handleClearImage}
              className="font-bold text-stone-400 transition hover:text-red-500"
              disabled={isLoading}
            >
              Hapus
            </button>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleScan}
            disabled={isLoading || disabled}
            className="w-full rounded-2xl text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Membaca struk...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Scan dan Analisis Struk
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
