# PRD.md — SplitBill Web App

## 1. Ringkasan Produk

**SplitBill** adalah website untuk membantu pengguna menghitung patungan secara cepat, rapi, dan transparan. Aplikasi ini dibuat untuk kondisi sehari-hari seperti makan bersama, nongkrong, liburan, belanja kelompok, iuran acara, atau pembayaran yang ditanggung lebih dari satu orang.

Tujuan utama produk ini adalah membuat proses pembagian tagihan menjadi mudah dipahami, mobile-friendly, dan bisa langsung dibagikan kepada semua peserta tanpa perhitungan manual yang membingungkan.

---

## 2. Masalah yang Ingin Diselesaikan

Banyak orang masih menghitung patungan dengan cara manual melalui kalkulator, chat, atau spreadsheet sederhana. Cara tersebut sering menimbulkan masalah seperti:

- Perhitungan tidak transparan.
- Sulit membedakan siapa membayar apa.
- Sulit membagi item tertentu hanya ke beberapa orang.
- Pajak, service charge, diskon, dan biaya tambahan sering terlewat.
- Sulit mengetahui siapa harus transfer ke siapa.
- Bukti hasil split sulit dibaca di layar HP.

---

## 3. Tujuan Produk

Produk harus mampu:

1. Membuat sesi split bill baru dengan cepat.
2. Menambahkan peserta secara fleksibel.
3. Menambahkan item tagihan dengan harga, jumlah, dan peserta yang ikut menanggung item tersebut.
4. Menghitung pajak, service charge, diskon, dan biaya tambahan.
5. Menentukan siapa yang membayar terlebih dahulu.
6. Menghasilkan rekomendasi penyelesaian pembayaran, misalnya “A transfer Rp25.000 ke B”.
7. Menampilkan ringkasan yang mudah dipahami di mobile.
8. Menyediakan hasil yang bisa dibagikan melalui link atau teks salinan.

---

## 4. Target Pengguna

### Pengguna Utama

- Mahasiswa.
- Teman nongkrong.
- Panitia acara kecil.
- Kelompok perjalanan/liburan.
- Keluarga atau rekan kerja yang sering patungan.

### Karakteristik Pengguna

- Sering menggunakan HP.
- Ingin proses cepat tanpa login yang ribet.
- Membutuhkan hasil perhitungan yang jelas dan mudah dibagikan.
- Tidak ingin membuka spreadsheet untuk hal sederhana.

---

## 5. Platform

- Web responsive.
- Prioritas utama: tampilan mobile.
- Desktop tetap rapi untuk dashboard dan histori.
- Framework utama: **Next.js + TypeScript**.
- Database: **Prisma ORM** dengan PostgreSQL atau SQLite untuk development.

---

## 6. Scope MVP

### Fitur Wajib MVP

#### 6.1 Landing Page

Landing page harus menjelaskan fungsi aplikasi secara singkat dengan CTA utama:

- “Mulai Split Bill”
- “Buat Tagihan Baru”

Konten landing page:

- Hero section.
- Penjelasan singkat fitur.
- Contoh alur penggunaan.
- Keunggulan aplikasi.
- Footer sederhana.

#### 6.2 Buat Split Bill Baru

Pengguna dapat membuat bill baru dengan data:

- Nama bill/kegiatan.
- Tanggal.
- Mata uang default: IDR.
- Catatan opsional.

#### 6.3 Manajemen Peserta

Pengguna dapat:

- Menambahkan peserta.
- Mengubah nama peserta.
- Menghapus peserta.
- Menandai peserta sebagai pembayar awal.

Validasi:

- Minimal 2 peserta.
- Nama peserta tidak boleh kosong.

#### 6.4 Input Item Tagihan

Setiap item memiliki:

- Nama item.
- Harga satuan.
- Jumlah.
- Peserta yang ikut menanggung item.
- Pembayar item.

Contoh:

- Nasi Goreng Rp25.000 ditanggung Anton dan Diki.
- Minuman Rp10.000 hanya ditanggung Anton.

#### 6.5 Biaya Tambahan

Pengguna dapat mengatur:

- Pajak dalam persen.
- Service charge dalam persen.
- Diskon dalam nominal atau persen.
- Biaya tambahan lain dalam nominal.

Aturan:

- Pajak/service dapat dibagi proporsional berdasarkan subtotal masing-masing peserta.
- Diskon dapat dibagi proporsional atau rata, tetapi MVP menggunakan proporsional.

#### 6.6 Perhitungan Otomatis

Sistem harus menghitung:

- Subtotal tiap peserta.
- Pajak tiap peserta.
- Service tiap peserta.
- Diskon tiap peserta.
- Total yang seharusnya dibayar tiap peserta.
- Total yang sudah dibayarkan tiap peserta.
- Selisih saldo tiap peserta.
- Rekomendasi transfer penyelesaian.

#### 6.7 Ringkasan Hasil

Ringkasan harus menampilkan:

- Total bill.
- Total per peserta.
- Siapa membayar berapa.
- Siapa harus transfer ke siapa.
- Tombol salin hasil.
- Tombol bagikan hasil.

#### 6.8 Riwayat Bill

Untuk MVP sederhana:

- Jika belum login, data dapat disimpan di local storage.
- Jika sudah menggunakan database, bill disimpan berdasarkan user/session.

#### 6.9 Export / Share

MVP minimal menyediakan:

- Copy summary ke clipboard.
- Share via Web Share API jika tersedia.
- Format teks yang enak dibaca di WhatsApp.

---

## 7. Fitur Lanjutan Setelah MVP

Fitur berikut tidak wajib pada versi pertama, tetapi harus disiapkan struktur datanya:

- Login dengan Google.
- Upload foto struk.
- OCR struk otomatis.
- Multi-currency.
- Link publik read-only.
- Edit hasil setelah dishare.
- Template acara rutin.
- Export PDF.
- Dark mode.
- Reminder pembayaran.
- QRIS/payment link manual.

---

## 8. User Flow Utama

```text
Landing Page
  → Klik Mulai Split Bill
  → Buat nama bill
  → Tambah peserta
  → Tambah item tagihan
  → Pilih peserta per item
  → Masukkan pajak/service/diskon
  → Lihat hasil perhitungan
  → Salin/bagikan ringkasan
```

---

## 9. Struktur Halaman

### Public Pages

- `/` — Landing page.
- `/new` — Buat split bill baru.
- `/bill/[id]` — Detail dan hasil bill.
- `/bill/[id]/edit` — Edit bill.
- `/share/[shareId]` — Tampilan read-only untuk dibagikan.

### Optional Auth Pages

- `/login`
- `/dashboard`
- `/dashboard/history`

---

## 10. Kebutuhan Fungsional

### FR-001 — Membuat Bill

Pengguna dapat membuat bill baru dengan nama, tanggal, dan catatan.

Acceptance Criteria:

- Sistem menolak nama bill kosong.
- Setelah bill dibuat, pengguna diarahkan ke halaman pengisian peserta/item.

### FR-002 — Mengelola Peserta

Pengguna dapat menambah, mengubah, dan menghapus peserta.

Acceptance Criteria:

- Minimal 2 peserta untuk melakukan kalkulasi.
- Jika peserta dihapus, item split yang terkait harus diperbarui.

### FR-003 — Mengelola Item

Pengguna dapat menambah item dengan harga, jumlah, pembayar, dan penanggung.

Acceptance Criteria:

- Harga harus lebih dari 0.
- Minimal 1 peserta harus dipilih sebagai penanggung item.

### FR-004 — Menghitung Split

Sistem menghitung pembagian tagihan secara otomatis.

Acceptance Criteria:

- Hasil berubah secara real-time ketika data diubah.
- Selisih pembulatan tidak boleh membuat total akhir berbeda jauh dari total bill.

### FR-005 — Settlement Transfer

Sistem membuat rekomendasi transfer antar peserta.

Acceptance Criteria:

- Peserta yang kurang bayar diarahkan transfer ke peserta yang lebih bayar.
- Jumlah transfer dibuat seminimal mungkin dengan algoritma debtor-creditor matching.

### FR-006 — Share Result

Pengguna dapat menyalin dan membagikan hasil.

Acceptance Criteria:

- Teks hasil rapi ketika ditempel ke WhatsApp.
- Format nominal menggunakan Rupiah.

---

## 11. Kebutuhan Non-Fungsional

### Performance

- First load cepat.
- Komponen form tidak berat.
- Kalkulasi dilakukan client-side untuk pengalaman real-time.

### Responsiveness

- Mobile-first.
- Lebar utama maksimal 430px pada mode mobile form, tetapi desktop dapat menggunakan grid dua kolom.
- Tombol utama mudah dijangkau ibu jari.

### Accessibility

- Kontras warna aman.
- Semua input memiliki label.
- Tombol memiliki state hover, focus, disabled.
- Komponen dapat digunakan dengan keyboard.

### Security

- Validasi input di client dan server.
- Jangan menyimpan rahasia di frontend.
- Link share menggunakan ID acak yang tidak mudah ditebak.

---

## 12. Data Model Konseptual

### User

- id
- name
- email
- image
- createdAt
- updatedAt

### Bill

- id
- title
- note
- currency
- date
- taxRate
- serviceRate
- discountType
- discountValue
- extraFee
- shareId
- ownerId
- createdAt
- updatedAt

### Participant

- id
- billId
- name
- colorKey
- createdAt

### BillItem

- id
- billId
- name
- price
- quantity
- paidByParticipantId
- createdAt

### ItemSplit

- id
- itemId
- participantId
- weight

### Settlement

- id
- billId
- fromParticipantId
- toParticipantId
- amount

---

## 13. Formula Perhitungan

```text
itemTotal = price * quantity
sharePerParticipant = itemTotal / jumlahPenanggungItem
participantSubtotal = total seluruh share item peserta
participantTax = participantSubtotal / billSubtotal * totalTax
participantService = participantSubtotal / billSubtotal * totalService
participantDiscount = participantSubtotal / billSubtotal * totalDiscount
participantFinalTotal = participantSubtotal + participantTax + participantService + extraFeeShare - participantDiscount
balance = paidAmount - participantFinalTotal
```

Interpretasi balance:

- Balance positif: peserta sudah membayar lebih dan harus menerima transfer.
- Balance negatif: peserta kurang bayar dan harus transfer.

---

## 14. Algoritma Settlement

```text
1. Buat daftar debtor dari peserta dengan balance negatif.
2. Buat daftar creditor dari peserta dengan balance positif.
3. Urutkan debtor dan creditor dari nominal terbesar.
4. Cocokkan debtor ke creditor sampai balance mendekati nol.
5. Hasilkan instruksi transfer.
```

Contoh output:

```text
Diki transfer Rp32.000 ke Anton
Rani transfer Rp15.000 ke Anton
```

---

## 15. Format Ringkasan Share

```text
SplitBill: Makan Sore
Total: Rp150.000

Rincian peserta:
- Anton: Rp55.000
- Diki: Rp45.000
- Rani: Rp50.000

Penyelesaian:
- Diki transfer Rp20.000 ke Anton
- Rani transfer Rp15.000 ke Anton
```

---

## 16. Prioritas Pengerjaan

### P0

- Struktur project.
- Landing page.
- Form bill.
- Form peserta.
- Form item.
- Kalkulasi split.
- Ringkasan hasil.

### P1

- Simpan local storage.
- Share/copy result.
- Halaman detail bill.
- Validasi form yang lebih rapi.

### P2

- Database Prisma.
- Auth.
- Public share link.
- Dashboard history.

---

## 17. Definisi Selesai

MVP dianggap selesai jika:

- Pengguna dapat membuat split bill dari awal sampai mendapat hasil transfer.
- Tampilan nyaman digunakan di HP.
- Hasil perhitungan konsisten.
- Ringkasan dapat disalin dan dibagikan.
- Struktur kode siap dikembangkan oleh agent lain.
