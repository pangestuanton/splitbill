# AGENTS.md — Aturan Kerja Agent untuk Project SplitBill

## 1. Tujuan Dokumen

Dokumen ini menjadi pedoman untuk semua AI coding agent yang mengerjakan project **SplitBill**. Agent harus mengikuti aturan produk, desain, struktur folder, dan kualitas kode agar project tidak berantakan.

---

## 2. Ringkasan Project

SplitBill adalah website untuk menghitung pembagian tagihan antar beberapa orang. Produk ini harus cepat, rapi, mobile-friendly, dan mudah dibagikan ke chat/grup.

Target utama:

- Mahasiswa.
- Teman nongkrong.
- Kelompok acara.
- Keluarga/rekan kerja.

Arah desain:

- Putih.
- Hijau daun.
- Elegan.
- Clean.
- Mobile-first.

---

## 3. Dokumen yang Wajib Dibaca

Sebelum coding, agent wajib membaca:

1. `PRD.md`
2. `DESIGN.md`
3. `CLAUDE.md`
4. `TODO.md`
5. `README.md`

Jangan mulai membuat fitur tanpa memahami dokumen tersebut.

---

## 4. Prioritas Pengerjaan

Urutan prioritas:

1. Project bisa berjalan tanpa error.
2. Struktur folder rapi.
3. Design system dasar siap.
4. Landing page selesai.
5. Logic kalkulasi split bill selesai.
6. Form peserta dan item selesai.
7. Summary dan settlement selesai.
8. Share/copy selesai.
9. Persistence local storage/database.
10. Polish UI dan responsive.

---

## 5. Aturan Struktur Folder

Gunakan struktur berikut:

```text
src/
├── app/              # Routing Next.js App Router
├── components/       # Komponen UI reusable
│   ├── layout/       # Navbar, Footer, Shell
│   ├── ui/           # Button, Input, Card, Badge
│   └── splitbill/    # Komponen khusus split bill
├── hooks/            # Custom hooks
├── lib/              # Utility, kalkulasi, format, storage
├── types/            # TypeScript types
└── data/             # Dummy data/static config
```

Aturan:

- Jangan taruh semua kode di `page.tsx`.
- Jangan campur logic kalkulasi dengan tampilan.
- Komponen besar harus dipecah.
- File utilitas harus reusable.

---

## 6. Aturan Penamaan

Gunakan penamaan yang konsisten:

- React component: `PascalCase.tsx`
- Utility file: `kebab-case.ts`
- Type file: `splitbill.ts`
- Route folder: lowercase/kebab-case
- Variable/function: camelCase
- Type/interface: PascalCase

Contoh:

```text
components/splitbill/SummaryCard.tsx
components/splitbill/ParticipantChip.tsx
lib/split-calculator.ts
lib/format.ts
types/splitbill.ts
```

---

## 7. Aturan TypeScript

- Wajib memakai TypeScript.
- Hindari `any`.
- Buat type untuk struktur data utama.
- Gunakan union type untuk status dan enum sederhana.
- Validasi data eksternal sebelum dipakai.

Contoh type:

```ts
export type DiscountType = 'fixed' | 'percent';

export interface Participant {
  id: string;
  name: string;
}
```

---

## 8. Aturan UI dan UX

Agent harus mengikuti `DESIGN.md`.

Wajib:

- Mobile-first.
- Warna putih dan hijau daun.
- CTA jelas.
- Input mudah diisi.
- Card rapi.
- Ringkasan uang mudah dibaca.

Dilarang:

- Layout desktop-only.
- Tabel lebar di mobile.
- Warna terlalu ramai.
- Font terlalu kecil.
- Kontras rendah.

---

## 9. Aturan Kalkulasi

Kalkulasi adalah bagian inti produk. Jangan asal membuat pembagian rata semua item. Setiap item harus dapat dipilih siapa saja yang menanggungnya.

Wajib mendukung:

- Item dibagi ke peserta tertentu.
- Pembayar item berbeda-beda.
- Pajak/service proporsional.
- Diskon proporsional.
- Settlement transfer.

Pastikan:

- Total per peserta masuk akal.
- Total semua peserta sama dengan total bill.
- Pembulatan tidak membuat hasil kacau.
- Settlement tidak menghasilkan nominal negatif.

---

## 10. Aturan Format Rupiah

Gunakan satu fungsi utilitas:

```ts
formatCurrency(amount: number): string
```

Format output:

```text
Rp25.000
Rp1.250.000
```

Jangan menulis format rupiah manual berulang-ulang di komponen.

---

## 11. Aturan State Management

Untuk MVP:

- Gunakan React state atau reducer.
- Jika state kompleks, buat custom hook `useSplitBill`.
- Hindari global state jika belum perlu.

Direkomendasikan:

```text
hooks/use-split-bill.ts
```

---

## 12. Aturan Local Storage

Jika menyimpan draft:

- Simpan hanya data yang perlu.
- Gunakan try/catch.
- Jangan membuat aplikasi crash jika data local storage rusak.

Key:

```text
splitbill:draft
splitbill:bills
```

---

## 13. Aturan Prisma

Jika mengaktifkan database:

- Gunakan Prisma schema yang tersedia.
- Jalankan migration setelah schema stabil.
- Jangan commit `.env` asli.
- Gunakan `.env.example` untuk contoh konfigurasi.

---

## 14. Aturan Testing Manual

Agent harus menguji minimal skenario berikut:

### Skenario 1

- 2 peserta.
- 1 item Rp100.000.
- Dibagi rata.
- Hasil masing-masing Rp50.000.

### Skenario 2

- 3 peserta.
- Item A hanya untuk 2 orang.
- Item B untuk semua orang.
- Pastikan peserta yang tidak ikut Item A tidak terkena biaya Item A.

### Skenario 3

- Ada pajak 10%.
- Pajak dibagi proporsional.

### Skenario 4

- Satu peserta membayar semua.
- Settlement harus mengarahkan peserta lain transfer ke pembayar.

---

## 15. Aturan Respons Agent

Saat memberi laporan pekerjaan:

- Jelaskan file yang diubah.
- Jelaskan fitur yang selesai.
- Jelaskan cara menjalankan.
- Jelaskan sisa TODO jika ada.
- Jangan mengklaim sudah berhasil build jika belum menjalankan build.

---

## 16. Larangan

Agent tidak boleh:

- Menghapus dokumen PRD/DESIGN tanpa diminta.
- Mengubah stack utama tanpa alasan.
- Menaruh API key di repo.
- Menggunakan package yang tidak perlu.
- Membuat UI yang tidak responsive.
- Membuat kalkulasi uang tanpa validasi.

---

## 17. Definition of Done untuk Agent

Sebuah task dianggap selesai jika:

- Implementasi sesuai PRD.
- Tampilan sesuai DESIGN.
- Tidak ada error TypeScript.
- Tidak ada error lint utama.
- Mobile layout sudah diperiksa.
- Kalkulasi utama benar.
- Kode mudah dilanjutkan oleh agent lain.
