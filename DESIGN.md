# DESIGN.md — SplitBill UI Design System

## 1. Arah Visual

Website SplitBill menggunakan gaya desain **clean, elegan, ringan, dan mobile-first** dengan warna utama **putih** dan aksen **hijau daun**. Kesan yang ingin dibangun adalah aplikasi yang segar, jujur, mudah dipercaya, dan nyaman dipakai saat pengguna sedang menghitung patungan bersama teman.

Desain tidak boleh terlihat terlalu ramai. Gunakan banyak ruang kosong, kartu yang lembut, border tipis, radius besar, dan shadow halus. Fokus utama adalah keterbacaan angka, alur input yang cepat, serta hasil split yang mudah dipahami dalam sekali lihat.

---

## 2. Prinsip Desain

### 2.1 Mobile First

Prioritas utama adalah tampilan HP. Semua komponen harus nyaman digunakan pada layar 360px sampai 430px.

Aturan mobile:

- Tombol utama minimal tinggi 48px.
- Input minimal tinggi 44px.
- Jarak antar elemen tidak terlalu rapat.
- Gunakan layout satu kolom.
- CTA utama berada di area yang mudah dijangkau ibu jari.
- Hindari tabel lebar di mobile; gunakan card/list.

### 2.2 Simple But Useful

Jangan menampilkan terlalu banyak informasi sekaligus. Pecah proses menjadi bagian:

1. Detail bill.
2. Peserta.
3. Item.
4. Biaya tambahan.
5. Hasil.

### 2.3 Trustworthy Calculation

Karena aplikasi berkaitan dengan uang, desain harus membuat pengguna percaya dengan hasilnya.

Gunakan:

- Angka besar untuk total.
- Label yang jelas.
- Badge status seperti “Kurang bayar”, “Lebih bayar”, “Lunas”.
- Rincian transparan yang bisa dibuka/tutup.

---

## 3. Palet Warna

### Primary Colors

```css
--leaf-50:  #f0fdf4;
--leaf-100: #dcfce7;
--leaf-200: #bbf7d0;
--leaf-300: #86efac;
--leaf-400: #4ade80;
--leaf-500: #22c55e;
--leaf-600: #16a34a;
--leaf-700: #15803d;
--leaf-800: #166534;
--leaf-900: #14532d;
```

### Neutral Colors

```css
--white:    #ffffff;
--stone-50: #fafaf9;
--stone-100:#f5f5f4;
--stone-200:#e7e5e4;
--stone-300:#d6d3d1;
--stone-500:#78716c;
--stone-700:#44403c;
--stone-900:#1c1917;
```

### Semantic Colors

```css
--success: #16a34a;
--warning: #f59e0b;
--danger:  #ef4444;
--info:    #0ea5e9;
```

---

## 4. Penggunaan Warna

### Background

- Body utama: `#ffffff` atau `#fafaf9`.
- Section soft: `#f0fdf4`.
- Card: `#ffffff`.
- Border: `#e7e5e4`.

### Tombol Utama

- Background: `#16a34a`.
- Hover: `#15803d`.
- Text: `#ffffff`.

### Tombol Sekunder

- Background: `#f0fdf4`.
- Border: `#bbf7d0`.
- Text: `#166534`.

### Highlight Total

Gunakan gradient halus:

```css
background: linear-gradient(135deg, #16a34a, #22c55e);
color: white;
```

---

## 5. Tipografi

Gunakan font sans-serif modern dan mudah dibaca.

Rekomendasi:

- Primary: `Inter`, `Geist`, atau system sans-serif.
- Fallback: `Arial`, `Helvetica`, `sans-serif`.

Skala font:

```css
--text-xs:  0.75rem;
--text-sm:  0.875rem;
--text-base:1rem;
--text-lg:  1.125rem;
--text-xl:  1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
```

Panduan:

- Heading landing: 36px desktop, 30px mobile.
- Heading section: 24px desktop, 22px mobile.
- Body: 16px.
- Helper text: 14px.
- Nominal total: 28–36px.

---

## 6. Radius dan Shadow

```css
--radius-sm:  10px;
--radius-md:  14px;
--radius-lg:  18px;
--radius-xl:  24px;
--radius-2xl: 32px;
```

Shadow:

```css
--shadow-card: 0 14px 40px rgba(22, 101, 52, 0.08);
--shadow-soft: 0 8px 24px rgba(28, 25, 23, 0.06);
```

Gunakan shadow secukupnya. Jangan membuat card terlihat terlalu berat.

---

## 7. Layout Global

### Mobile

```text
body
└── main.container
    ├── top navigation
    ├── content card
    └── bottom action area
```

Aturan:

- Padding horizontal: 16px.
- Gap antar section: 24px.
- Card padding: 16px.
- Max width konten utama: 430px untuk flow input.

### Desktop

```text
body
└── main.container max-w-6xl
    ├── nav
    ├── hero grid 2 kolom
    ├── feature grid 3 kolom
    └── footer
```

Aturan:

- Padding horizontal: 24–48px.
- Max width: 1120px.
- Form dan preview dapat dibuat dua kolom.

---

## 8. Komponen Utama

### 8.1 Navbar

Desktop:

- Logo kiri.
- Menu kanan: Fitur, Cara Pakai, Riwayat, Mulai.
- CTA kecil “Mulai”.

Mobile:

- Logo kiri.
- Tombol hamburger kanan.
- Menu muncul sebagai sheet/dropdown.

Style:

- Background putih semi-transparan.
- Sticky top.
- Border bottom tipis.
- Backdrop blur.

### 8.2 Hero Section

Elemen:

- Badge kecil: “Split bill cepat & transparan”.
- Headline kuat.
- Subheadline singkat.
- CTA utama.
- CTA sekunder.
- Preview card simulasi split bill.

Copy contoh:

```text
Hitung patungan tanpa drama.
Buat tagihan, pilih siapa makan apa, lalu lihat siapa harus transfer ke siapa.
```

### 8.3 Bill Card

Digunakan untuk daftar riwayat atau preview.

Isi:

- Nama bill.
- Tanggal.
- Jumlah peserta.
- Total tagihan.
- Status.

Style:

- Background putih.
- Border stone-200.
- Radius 24px.
- Shadow lembut.

### 8.4 Participant Chip

Untuk menampilkan peserta.

State:

- Default.
- Selected.
- Paid by.

Style selected:

- Background leaf-100.
- Border leaf-300.
- Text leaf-800.

### 8.5 Item Input Card

Isi:

- Nama item.
- Harga.
- Quantity.
- Dibayar oleh.
- Ditanggung oleh.

Mobile:

- Semua field stacked.
- Peserta ditampilkan sebagai chip wrap.

Desktop:

- Field bisa dibuat grid 2 kolom.

### 8.6 Summary Card

Komponen paling penting.

Isi:

- Total bill besar.
- Breakdown subtotal, tax, service, discount.
- Total per peserta.
- Instruksi transfer.

Visual:

- Bagian total menggunakan gradient hijau daun.
- Instruksi transfer menggunakan list card putih.
- Badge status diberi warna semantic.

### 8.7 Settlement Row

Format:

```text
[Diki] → [Anton]
Rp32.000
```

Style:

- Arrow kecil di tengah.
- Nominal bold.
- Card background leaf-50.
- Border leaf-200.

### 8.8 Empty State

Ketika belum ada item atau peserta:

- Ilustrasi sederhana berbentuk receipt/card.
- Teks pendek.
- Tombol aksi.

Contoh:

```text
Belum ada item.
Tambahkan item pertama untuk mulai menghitung split bill.
```

---

## 9. Form Design

Input harus jelas dan nyaman.

```css
.input {
  height: 44px;
  border: 1px solid #e7e5e4;
  border-radius: 14px;
  padding: 0 14px;
  background: #ffffff;
}

.input:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.14);
}
```

Validasi:

- Error text kecil warna merah.
- Jangan hanya mengandalkan warna; gunakan teks error.

---

## 10. Button Design

### Primary Button

```css
.btn-primary {
  min-height: 48px;
  border-radius: 16px;
  background: #16a34a;
  color: #ffffff;
  font-weight: 700;
}
```

### Secondary Button

```css
.btn-secondary {
  min-height: 48px;
  border-radius: 16px;
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  font-weight: 700;
}
```

### Ghost Button

```css
.btn-ghost {
  min-height: 44px;
  border-radius: 14px;
  background: transparent;
  color: #44403c;
}
```

---

## 11. Responsive Rules

### Breakpoints

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

### Mobile Rules

- Jangan gunakan table horizontal untuk rincian peserta.
- Gunakan card list.
- Sticky bottom CTA boleh digunakan di halaman input.
- Hindari modal besar; gunakan bottom sheet.

### Desktop Rules

- Gunakan dua kolom untuk editor dan preview.
- Preview summary boleh sticky di kanan.
- Gunakan grid untuk fitur landing page.

---

## 12. Animasi

Gunakan animasi ringan saja.

- Hover card naik 2px.
- Button scale 0.98 saat active.
- Section fade-in pelan.
- Sheet/menu slide dari atas/bawah.

Durasi:

```css
--duration-fast: 120ms;
--duration-base: 180ms;
--duration-slow: 260ms;
```

Jangan menggunakan animasi berlebihan karena aplikasi fokus pada utilitas.

---

## 13. Icon Style

Gunakan icon garis sederhana.

Rekomendasi:

- Lucide React.

Icon yang cocok:

- Receipt.
- Users.
- Calculator.
- Share2.
- Wallet.
- CheckCircle.
- ArrowRight.
- Plus.
- Trash.

Ukuran:

- Icon kecil: 16px.
- Icon normal: 20px.
- Icon hero: 28–36px.

---

## 14. Copywriting UI

Gunakan bahasa Indonesia yang santai, jelas, dan tidak kaku.

Contoh label:

- “Nama tagihan”
- “Siapa saja yang ikut?”
- “Tambah item”
- “Dibayar oleh”
- “Ditanggung oleh”
- “Hitung sekarang”
- “Salin hasil”
- “Bagikan ke grup”

Contoh microcopy:

```text
Tenang, hasilnya bisa kamu edit lagi sebelum dibagikan.
```

```text
Pilih peserta yang ikut menikmati item ini.
```

---

## 15. Landing Page Wireframe

```text
[Navbar]
Logo SplitBill                 Fitur Cara Pakai Mulai

[Hero]
Badge: Split bill cepat & transparan
Title: Hitung patungan tanpa drama.
Description: Buat tagihan, pilih siapa makan apa, lalu lihat siapa harus transfer ke siapa.
CTA Primary: Mulai Split Bill
CTA Secondary: Lihat Cara Kerja

[Preview Card]
Total Bill: Rp184.000
Anton menerima Rp42.000
Diki transfer Rp22.000 ke Anton
Rani transfer Rp20.000 ke Anton

[Features]
- Item bisa dibagi beda orang
- Pajak dan service otomatis
- Hasil siap dibagikan

[How It Works]
1. Tambah peserta
2. Masukkan item
3. Bagikan hasil

[Footer]
```

---

## 16. Split Bill Editor Wireframe Mobile

```text
[Header]
< Kembali        Makan Sore

[Step Indicator]
Detail → Peserta → Item → Hasil

[Card: Peserta]
Anton   Diki   Rani
+ Tambah peserta

[Card: Item]
Nama item
Harga
Qty
Dibayar oleh
Ditanggung oleh
+ Tambah item

[Card: Biaya Tambahan]
Pajak %
Service %
Diskon

[Sticky Bottom]
Total sementara Rp184.000
Lihat Hasil
```

---

## 17. Summary Page Wireframe Mobile

```text
[Green Total Card]
Total Tagihan
Rp184.000
3 peserta

[Per Peserta]
Anton  Rp62.000  menerima
Diki   Rp58.000  transfer
Rani   Rp64.000  transfer

[Penyelesaian]
Diki → Anton   Rp22.000
Rani → Anton   Rp20.000

[Actions]
Salin Hasil
Bagikan
Edit Tagihan
```

---

## 18. Tailwind Token Direction

Gunakan class Tailwind dengan token warna berikut:

```ts
leaf: {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
}
```

Bila tidak mengubah konfigurasi Tailwind, gunakan warna bawaan `green-*` dan `stone-*`.

---

## 19. Do and Don't

### Do

- Gunakan background putih dan hijau daun secara konsisten.
- Buat angka uang terlihat menonjol.
- Buat form sederhana dan cepat diisi.
- Prioritaskan tampilan HP.
- Gunakan card untuk rincian.

### Don't

- Jangan membuat desain terlalu gelap untuk versi utama.
- Jangan memakai terlalu banyak warna aksen.
- Jangan membuat tabel lebar di mobile.
- Jangan menyembunyikan hasil perhitungan penting.
- Jangan membuat CTA terlalu kecil.

---

## 20. Standar Akhir Desain

Desain dianggap sesuai jika:

- Terlihat bersih, putih, dan segar dengan aksen hijau daun.
- Mobile nyaman digunakan tanpa zoom.
- Alur input mudah diikuti.
- Ringkasan hasil langsung bisa dipahami.
- Semua elemen utama konsisten dari landing sampai summary.
