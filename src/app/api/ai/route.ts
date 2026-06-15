import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';
import { formatCurrency } from '@/lib/formatCurrency';

interface SettlementInfo {
  fromName: string;
  toName: string;
  amount: number;
}

interface ParticipantInfo {
  name: string;
  totalOwed: number;
  paid: number;
  balance: number;
}

interface SplitBillPayload {
  groupName: string;
  total: number;
  participants: ParticipantInfo[];
  settlements: SettlementInfo[];
  mode: 'summary' | 'whatsapp';
}

export async function POST(request: Request) {
  try {
    const body: SplitBillPayload = await request.json();
    const { groupName, total, participants, settlements, mode } = body;

    const totalBillStr = formatCurrency(total);
    const membersSummary = participants
      .map((p) => `- ${p.name}: Bayar ${formatCurrency(p.paid)}, Tanggungan ${formatCurrency(p.totalOwed)} (${p.balance >= 0 ? 'Menerima' : 'Mentransfer'} ${formatCurrency(Math.abs(p.balance))})`)
      .join('\n');

    const settlementsSummary = settlements.length > 0
      ? settlements.map((s) => `- ${s.fromName} transfer ke ${s.toName} sebesar ${formatCurrency(s.amount)}`).join('\n')
      : 'Semua peserta sudah lunas, tidak ada transfer diperlukan.';

    // Check if OpenRouter key is set
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Return local fallback text
      const fallbackText = generateLocalFallback(mode, groupName, totalBillStr, participants, settlements);
      return NextResponse.json({ result: fallbackText, isFallback: true });
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (mode === 'whatsapp') {
      systemPrompt = 'Anda adalah asisten keuangan yang membantu membuat ringkasan pembagian tagihan (split bill) siap kirim ke WhatsApp yang rapi, to-the-point, dan mudah dibaca dalam Bahasa Indonesia. PENTING: JANGAN gunakan emoji sama sekali. JANGAN gunakan format tabel dalam bentuk teks. Angka harus tepat dan tidak boleh diubah.';
      userPrompt = `Buat pesan ringkasan split bill siap kirim ke WhatsApp untuk kegiatan berikut:
Nama Acara/Grup: ${groupName}
Total Tagihan: ${totalBillStr}

Rincian Peserta:
${membersSummary}

Penyelesaian Transfer:
${settlementsSummary}

Pesan harus sangat ringkas, langsung ke informasi utama transfer, to-the-point, bebas dari emoji, dan tidak menggunakan format tabel.`;
    } else {
      systemPrompt = 'Anda adalah asisten yang menjelaskan hasil pembagian tagihan secara ringkas, to-the-point, dan jelas dalam Bahasa Indonesia. PENTING: JANGAN gunakan emoji sama sekali. JANGAN gunakan format tabel dalam bentuk teks. Angka harus tepat dan tidak boleh diubah.';
      userPrompt = `Buat penjelasan ringkas (2-3 kalimat) mengenai hasil split bill berikut:
Nama Acara/Grup: ${groupName}
Total Tagihan: ${totalBillStr}

Rincian Peserta:
${membersSummary}

Penyelesaian Transfer:
${settlementsSummary}

Jelaskan secara langsung total tagihan dan siapa saja yang perlu menyelesaikan pembayaran agar semuanya lunas. Tulis dengan gaya to-the-point, bebas dari emoji, dan hindari format tabel.`;
    }

    const aiResponse = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 0.3);

    return NextResponse.json({ result: aiResponse.trim(), isFallback: false });
  } catch (error: unknown) {
    console.error('AI Summary Route Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Gagal memproses ringkasan AI.',
        result: 'Gagal menghubungi asisten AI. Silakan gunakan salinan ringkasan lokal.',
      },
      { status: 500 },
    );
  }
}

function generateLocalFallback(
  mode: 'summary' | 'whatsapp',
  groupName: string,
  totalBillStr: string,
  participants: ParticipantInfo[],
  settlements: SettlementInfo[],
): string {
  if (mode === 'whatsapp') {
    const memberLines = participants
      .map((p) => `- *${p.name}*: Patungan ${formatCurrency(p.totalOwed)} (Sudah bayar: ${formatCurrency(p.paid)})`)
      .join('\n');

    const settlementLines = settlements.length > 0
      ? settlements.map((s) => `- *${s.fromName}* -> *${s.toName}*: *${formatCurrency(s.amount)}*`).join('\n')
      : '- Semua lunas! Tidak ada transfer diperlukan.';

    return `*TAGIHAN PATUNGAN: ${groupName.toUpperCase()}*
Total: *${totalBillStr}*

*Rincian Patungan:*
${memberLines}

*Penyelesaian Transfer:*
${settlementLines}

Mohon segera diselesaikan ya teman-teman. Terima kasih!`;
  } else {
    const settlementsText = settlements.length > 0
      ? settlements.map((s) => `${s.fromName} perlu membayar ${formatCurrency(s.amount)} ke ${s.toName}`).join(', ')
      : 'semua peserta sudah patungan dengan pas dan tidak ada transfer yang diperlukan';

    return `Total tagihan untuk "${groupName}" adalah sebesar ${totalBillStr} di antara ${participants.length} orang. Penyelesaian pembayaran dapat dilakukan dengan cara: ${settlementsText}.`;
  }
}
