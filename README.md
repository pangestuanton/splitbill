# SplitBill

SplitBill adalah website mobile-first untuk menghitung pembagian tagihan (split bill) antar beberapa orang secara mudah, cepat, dan transparan. Project ini menggunakan **Next.js App Router**, **TypeScript**, **Tailwind CSS**, dan **Supabase** sebagai database utama.

---

## Fitur Utama

1. **Landing Page**: Pengenalan visual aplikasi dan CTA instan.
2. **Buat Grup / Sesi Baru**: Mengisi nama acara, deskripsi, serta pengaturan opsional pajak, service charge, diskon, dan biaya tambahan.
3. **Manajemen Anggota**: Menambahkan teman dan menghapus anggota (dengan proteksi jika anggota sudah terkait dengan transaksi).
4. **Input Tagihan Manual**: Mengisi nama item, harga, memilih siapa pembayar, dan siapa saja penanggung item tersebut.
5. **Receipt Scanner (AI Vision)**: Unggah foto struk belanja, AI secara otomatis mengekstrak merchant, subtotal, dan daftar item.
6. **Review Hasil Scan**: Modifikasi hasil scan AI sebelum dikonfirmasi masuk sebagai tagihan (bisa dipecah per item atau digabungkan).
7. **Hasil Kalkulasi & Settlement**: Total tagihan real-time, breakdown beban tiap anggota, saldo balance, serta rekomendasi siapa harus transfer ke siapa.
8. **Asisten Ringkasan & Share (AI / Lokal)**:
   - **AI Summary**: Ringkasan naratif ramah mengenai hasil split.
   - **WhatsApp Generator**: Membuat teks rapi siap salin untuk dikirim langsung ke grup WA.
   - *Berjalan otomatis secara lokal (fallback) jika API key AI tidak tersedia.*

---

## Tech Stack

- **Framework**: Next.js App Router (React)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS
- **Database**: Supabase JS Client
- **AI Integration**: OpenRouter API (Model: `amazon/nova-2-lite-v1`)
- **Icon**: Lucide React

---

## Instalasi

1. Install seluruh dependency:
   ```bash
   npm install
   ```

2. Buat file konfigurasi `.env.local` di root direktori dengan menyalin `.env.example` atau menulis manual:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   OPENROUTER_API_KEY=your-openrouter-key
   OPENROUTER_MODEL=amazon/nova-2-lite-v1
   ```

---

## Setup Database Supabase

Untuk menjalankan aplikasi ini, jalankan perintah SQL berikut di **Supabase SQL Editor** Anda untuk membuat tabel dan indeks yang diperlukan:

Silakan lihat file lengkapnya di [supabase-schema.sql](file:///d:/Project/SplitBill/docs/supabase-schema.sql).

### Keamanan RLS
Untuk keperluan MVP, Row Level Security (RLS) diatur dengan policy publik sederhana (`using(true) with check(true)`). Pada lingkungan production, sangat disarankan untuk memperketat policy akses ini.

---

## Menjalankan Aplikasi Secara Lokal

1. Jalankan development server:
   ```bash
   npm run dev
   ```
2. Akses aplikasi melalui browser di `http://localhost:3000`.

---

## Build untuk Produksi

Untuk memverifikasi kebersihan kode dan melakukan kompilasi bundel produksi:
```bash
npm run build
```
Proses ini akan menjalankan pengecekan TypeScript strict dan ES lint sebelum menghasilkan bundel statis Next.js.
