import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Data gambar tidak ditemukan.' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Fitur scan dinonaktifkan karena OPENROUTER_API_KEY belum dikonfigurasi.',
          code: 'NO_API_KEY',
        },
        { status: 400 },
      );
    }

    // Prepare system and user prompt
    const systemPrompt = `Anda adalah sistem OCR khusus struk belanja. Tugas Anda adalah membaca gambar struk dan mengekstrak datanya ke format JSON terstruktur.
Anda hanya boleh membalas dengan JSON yang valid, tanpa teks penjelasan sebelum atau sesudahnya. Pastikan semua harga berupa angka (number) bulat dan singkirkan simbol seperti Rp, titik ribuan, atau koma desimal jika mengganggu nilai integer.`;

    const userPrompt = `Ekstrak data struk ini ke format JSON berikut:
{
  "merchant": "Nama tempat/merchant jika terbaca, atau null",
  "date": "Tanggal struk jika terbaca, atau null",
  "items": [
    {
      "name": "Nama Item (misal: Nasi Goreng)",
      "amount": 25000
    }
  ],
  "subtotal": 25000,
  "tax": 0,
  "service": 0,
  "discount": 0,
  "total": 25000,
  "confidence": "high"
}

Perhatikan:
1. "items" berisi daftar item yang dibeli dengan harganya (amount).
2. "subtotal", "tax" (pajak), "service" (biaya layanan), "discount" (diskon), dan "total" harus dihitung sebagai integer angka.
3. Nilai "confidence" dapat bernilai "high", "medium", atau "low".
4. Kirimkan HANYA objek JSON saja.`;

    // Call OpenRouter with multimodal message structure
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: [
          { type: 'text', text: userPrompt },
          {
            type: 'image_url',
            image_url: {
              url: image, // base64 data URL e.g. "data:image/jpeg;base64,..."
            },
          },
        ],
      },
    ];

    const responseContent = await callOpenRouter(messages, 0.2);

    // Parse AI content, cleaning any markdown wrappers
    let jsonText = responseContent.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText
        .replace(/^```json/i, '')
        .replace(/^```/i, '')
        .replace(/```$/, '')
        .trim();
    }

    try {
      const parsedData = JSON.parse(jsonText);
      
      // Basic sanitization
      if (parsedData && Array.isArray(parsedData.items)) {
        parsedData.items = parsedData.items.map((item: any) => ({
          name: String(item.name || 'Item Tanpa Nama'),
          amount: Math.round(Number(item.amount)) || 0,
        }));
        parsedData.subtotal = Math.round(Number(parsedData.subtotal)) || 0;
        parsedData.tax = Math.round(Number(parsedData.tax)) || 0;
        parsedData.service = Math.round(Number(parsedData.service)) || 0;
        parsedData.discount = Math.round(Number(parsedData.discount)) || 0;
        parsedData.total = Math.round(Number(parsedData.total)) || 0;
      }

      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error('Failed to parse OCR JSON:', jsonText, parseError);
      return NextResponse.json(
        {
          error: 'Gagal menguraikan hasil pembacaan AI ke format JSON terstruktur.',
          raw: responseContent,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error('Receipt Scanner Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memindai gambar struk.' },
      { status: 500 },
    );
  }
}
export const maxDuration = 60; // Allow enough time for vision model response
