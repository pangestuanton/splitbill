# TODO.md — Roadmap Pengerjaan SplitBill (Hasil Implementasi)

## Phase 0 — Persiapan Project

- [x] Jalankan `npm install`.
- [x] Pastikan `npm run dev` berhasil.
- [x] Salin `.env.example` menjadi `.env.local`.
- [x] Hapus Prisma ORM dan ganti dengan Supabase client (`@supabase/supabase-js`).
- [x] Buat skema SQL Supabase manual di `docs/supabase-schema.sql`.
- [x] Baca ulang `PRD.md`, `DESIGN.md`, `CLAUDE.md`, dan `AGENTS.md`.

---

## Phase 1 — Foundation UI

- [x] Rapikan `src/app/globals.css` sesuai design token (Leaf green, card shadows, dsb.).
- [x] Buat komponen `Button`.
- [x] Buat komponen `Input`.
- [x] Buat komponen `Card`.
- [x] Buat komponen `Container`.
- [x] Buat `Header` responsive global di `RootLayout`.
- [x] Buat `Footer` sederhana global di `RootLayout`.

---

## Phase 2 — Landing Page

- [x] Bersihkan landing page `/` dari navbar duplikat.
- [x] Tambahkan hero section bertema putih/hijau daun yang clean.
- [x] Tambahkan preview split bill card interaktif.
- [x] Tambahkan section fitur utama (Peserta, kalkulator, share).
- [x] Tambahkan section alur cara kerja.
- [x] Pastikan mobile-friendly & responsive.

---

## Phase 3 — Split Calculator Logic

- [x] Buat type model di `src/types/index.ts`.
- [x] Buat `formatCurrency` Rupiah di `src/lib/formatCurrency.ts` (format `Rp25.000` tanpa spasi).
- [x] Gunakan core logic `calculateSplitBill` di `src/lib/split-calculator.ts`.
- [x] Hubungkan model database ke kalkulator melalui adapter `src/lib/splitBill.ts`.
- [x] Implementasi debtor-creditor matching yang efisien.

---

## Phase 4 — Bill Editor & Dashboard

- [x] Buat halaman `/new` untuk inisiasi grup baru.
- [x] Buat komponen form kelompok `GroupForm.tsx`.
- [x] Buat form tambah peserta `MemberForm.tsx` & daftar peserta `MemberList.tsx`.
- [x] Buat form tambah tagihan `ExpenseForm.tsx` & daftar tagihan `ExpenseList.tsx`.
- [x] Tambahkan pilihan pembayar (paid by) dan penanggung item (split checkboxes) dengan opsi "Pilih Semua" & "Hapus Pilihan".
- [x] Tambahkan input pajak %, service %, diskon (rupiah/persen), dan ongkir/biaya lainnya pada group level.

---

## Phase 5 — Summary Result & AI Integration

- [x] Buat `SummaryCard` terintegrasi dengan kalkulator.
- [x] Tampilkan ringkasan total tagihan bersih (termasuk pajak/ongkir/diskon).
- [x] Tampilkan beban patungan dan saldo per anggota kelompok (Lunas, Bayar X, Terima Y).
- [x] Tampilkan instruksi transfer rekomendasi `SettlementList.tsx`.
- [x] Tambahkan asisten share `AiSummaryCard.tsx` dengan AI model `amazon/nova-2-lite-v1` via OpenRouter (atau generator lokal sebagai fallback jika API key kosong).
- [x] Hubungkan dengan tombol salin teks ringkasan & pesan siap kirim ke WhatsApp.

---

## Phase 6 — Receipt Scanner (AI Vision)

- [x] Buat API Route `/api/receipt-scan` yang menerima base64 gambar struk dan mengirimkannya ke OpenRouter Vision model.
- [x] Buat komponen `ReceiptScanner.tsx` untuk unggah gambar dan menampilkan loader visual yang elegan.
- [x] Buat komponen `ReceiptReview.tsx` untuk memvalidasi daftar item, subtotal struk, mengubah harga item, memilih pembayar, serta memilih penanggung sebelum tagihan disimpan ke database.

---

## Phase 7 — Database Persistence & Share Page

- [x] Inisialisasi Supabase JS Client di `src/lib/supabase.ts` (aman dari static prerendering crash).
- [x] Implementasi queries helper di `src/lib/supabaseQueries.ts`.
- [x] Proteksi penghapusan anggota jika namanya sudah dipakai dalam tagihan/pembayaran.
- [x] Buat halaman `/bill/[id]` sebagai dashboard pengelola bill utama.
- [x] Buat halaman `/bill/[id]/edit` untuk mengubah konfigurasi pajak/diskon grup.
- [x] Buat halaman `/share/[shareId]` sebagai dashboard read-only (aman tanpa tombol edit/delete) untuk dibagikan ke teman-teman.
- [x] Buat halaman `/dashboard` untuk melihat riwayat grup patungan yang pernah dibuat di Supabase.

---

## Phase 8 — Polish & Verification

- [x] Implementasi loading state spinner `LoadingState.tsx`.
- [x] Implementasi empty state `EmptyState.tsx`.
- [x] Implementasi alert error `ErrorState.tsx`.
- [x] Jalankan `npm run lint` & perbaiki seluruh error.
- [x] Jalankan `npm run build` dan pastikan compile Next.js 100% sukses.

---

## Sisa Pengembangan Lanjutan (Ide & Masukan)

1. **Authentication**: Menambahkan Google Auth / Supabase Auth jika ingin membatasi akses edit hanya untuk pemilik bill.
2. **Penyimpanan Gambar**: Integrasi dengan Supabase Storage untuk meng-upload dan menyimpan foto struk asli secara permanen.
3. **Multi-currency**: Dukungan mata uang asing selain IDR.
