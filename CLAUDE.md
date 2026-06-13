# CLAUDE.md — Instruksi untuk Claude Code / Coding Agent

## 1. Peran Agent

Kamu adalah coding agent yang bertugas membangun website **SplitBill** berdasarkan dokumen berikut:

- `PRD.md` sebagai acuan produk.
- `DESIGN.md` sebagai acuan tampilan.
- `AGENTS.md` sebagai aturan kerja umum agent.
- `TODO.md` sebagai urutan pengerjaan.

Jangan mengubah arah produk tanpa alasan kuat. Jika menemukan konflik antar dokumen, prioritaskan urutan berikut:

1. PRD.md
2. DESIGN.md
3. AGENTS.md
4. TODO.md
5. README.md

---

## 2. Stack yang Digunakan

Gunakan stack berikut:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Prisma ORM.
- PostgreSQL untuk production atau SQLite untuk development lokal.
- Zod untuk validasi data.
- React Hook Form untuk form kompleks.
- Lucide React untuk icon.

Jika dependency belum tersedia, tambahkan dengan hati-hati ke `package.json`.

---

## 3. Prinsip Pengerjaan

### 3.1 Jangan Langsung Membuat Semuanya Sekaligus

Kerjakan bertahap:

1. Pastikan project bisa berjalan.
2. Bangun layout global dan design token.
3. Bangun landing page.
4. Bangun logic kalkulasi split bill.
5. Bangun form peserta dan item.
6. Bangun halaman summary.
7. Tambahkan local storage/database.
8. Tambahkan fitur share/copy.

### 3.2 Mobile First

Semua halaman harus diuji dengan mindset mobile terlebih dahulu. Gunakan layout desktop hanya sebagai peningkatan.

### 3.3 Kalkulasi Harus Dipisah dari UI

Jangan menulis logic split bill langsung di komponen UI. Letakkan logic di:

```text
src/lib/split-calculator.ts
```

atau folder serupa.

Wajib ada unit test sederhana untuk logic kalkulasi jika test framework digunakan.

### 3.4 Komponen Harus Kecil

Pisahkan komponen besar menjadi:

- `BillForm`
- `ParticipantForm`
- `ItemForm`
- `ParticipantChip`
- `SummaryCard`
- `SettlementList`
- `CurrencyInput`

---

## 4. Struktur Folder yang Diikuti

Gunakan struktur berikut sebagai acuan utama:

```text
SPLITBILL/
├── hp/
├── prisma/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── new/
│   │   │   └── page.tsx
│   │   ├── bill/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── share/
│   │   │   └── [shareId]/
│   │   │       └── page.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   └── splitbill/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── data/
├── .env.example
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── DESIGN.md
├── PRD.md
├── README.md
└── TODO.md
```

Folder `.next` dan `node_modules` tidak perlu dibuat manual karena keduanya hasil generate.

---

## 5. Aturan UI

Ikuti `DESIGN.md`.

Wajib:

- Warna utama putih dan hijau daun.
- Button utama hijau daun.
- Card putih dengan border halus.
- Mobile layout satu kolom.
- Summary total harus paling menonjol.
- Gunakan bahasa Indonesia pada UI.

Dilarang:

- Membuat desain gelap sebagai default.
- Membuat tabel lebar di mobile.
- Menggunakan warna terlalu ramai.
- Menggunakan animasi berlebihan.

---

## 6. Aturan Kalkulasi

Implementasikan fungsi utama:

```ts
calculateSplitBill(input: SplitBillInput): SplitBillResult
```

Input minimal:

```ts
participants: Participant[]
items: BillItem[]
taxRate: number
serviceRate: number
discountType: 'fixed' | 'percent'
discountValue: number
extraFee: number
```

Output minimal:

```ts
subtotal: number
tax: number
service: number
discount: number
total: number
participants: ParticipantSummary[]
settlements: Settlement[]
```

Settlement rule:

- Peserta dengan balance negatif harus transfer.
- Peserta dengan balance positif harus menerima.
- Buat jumlah transfer seminimal mungkin.
- Pembulatan Rupiah harus konsisten.

---

## 7. Aturan Validasi

Gunakan Zod untuk schema:

- Bill title wajib.
- Minimal 2 peserta.
- Item name wajib.
- Item price > 0.
- Quantity minimal 1.
- Setiap item harus punya minimal 1 participant split.
- paidBy harus salah satu participant.

---

## 8. Aturan Data Persistence

Tahap MVP boleh menggunakan local storage dengan key:

```text
splitbill:bills
splitbill:draft
```

Jika menggunakan Prisma:

- Gunakan schema dari `prisma/schema.prisma`.
- Jangan menyimpan data contoh production di migration.
- Seed data boleh diletakkan di `prisma/seed.ts`.

---

## 9. Aturan Code Quality

- Gunakan TypeScript strict.
- Hindari `any` kecuali sangat terpaksa.
- Komponen UI harus readable.
- Nama file gunakan kebab-case atau PascalCase secara konsisten.
- Jangan menyimpan business logic di page component.
- Hindari duplikasi fungsi format rupiah.

Fungsi utilitas yang wajib ada:

```text
src/lib/format.ts
src/lib/split-calculator.ts
src/lib/storage.ts
src/lib/validation.ts
```

---

## 10. Format Commit yang Disarankan

Gunakan pesan commit seperti:

```text
feat: add split bill calculator
feat: build mobile bill editor
feat: add settlement summary card
fix: correct proportional discount calculation
style: refine leaf green design tokens
```

---

## 11. Checklist Sebelum Menjawab Selesai

Sebelum menyatakan pekerjaan selesai, pastikan:

- `npm run lint` tidak error.
- `npm run build` berhasil.
- Halaman `/` tampil rapi.
- Halaman `/new` bisa digunakan di mobile.
- Kalkulasi dasar split bill benar.
- Hasil bisa disalin.
- Tidak ada secret di repo.

---

## 12. Prompt Kerja Singkat untuk Agent

Gunakan prompt berikut saat mulai coding:

```text
Baca PRD.md, DESIGN.md, AGENTS.md, CLAUDE.md, dan TODO.md terlebih dahulu. Bangun website SplitBill menggunakan Next.js, TypeScript, Tailwind, dan Prisma. Prioritaskan mobile-first, warna putih dan hijau daun, form split bill yang mudah dipakai, kalkulasi akurat, serta summary yang bisa disalin. Kerjakan bertahap mulai dari struktur project, landing page, kalkulator split bill, form input, summary, lalu persistence.
```
