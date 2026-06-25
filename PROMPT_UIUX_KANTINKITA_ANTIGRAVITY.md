# Prompt UI/UX KantinKita untuk Antigravity IDE

## 1. Peran dan Tujuan

Anda adalah **UI/UX implementation agent** di Antigravity IDE. Tugas Anda adalah mempercantik dan menyeragamkan tampilan website yang sudah ada agar mengikuti gaya visual contoh HTML KantinKita, tetapi **jangan merusak atau mengubah source code penting**.

Target utama:

1. Membuat UI website terlihat modern, rapi, konsisten, responsif, dan profesional.
2. Mengadaptasi gaya visual dari referensi:
   - `kk-part1-customer.html` untuk tampilan **Customer / pembeli / mobile-first**.
   - `kk-part2-kasir.html` untuk tampilan **Kasir / POS / transaksi**.
   - `kk-part3-merchant.html` untuk tampilan **Merchant / dashboard / manajemen toko**.
3. Menyesuaikan desain dengan struktur halaman yang sudah ada di project.
4. Mempertahankan semua fungsi, alur, data, route, form, controller, model, API, validasi, dan logika bisnis yang sudah berjalan.

---

## 2. Aturan Mutlak: Source Code Penting Tidak Boleh Rusak

Saat mengubah UI/UX, **jangan mengubah bagian inti aplikasi** berikut kecuali benar-benar diperlukan untuk styling dan tetap aman:

### Jangan diubah

- Route aplikasi.
- Controller.
- Model.
- Migration.
- Seeder.
- Service class.
- Middleware.
- API endpoint.
- Query database.
- Struktur autentikasi.
- Nama field form.
- `name`, `id`, `value`, `method`, `action` pada form yang sudah dipakai backend.
- `@csrf`, `@method`, validasi error, session alert, dan logic Blade/PHP.
- Event handler penting seperti `onclick`, `onchange`, `wire:click`, `wire:model`, `x-data`, `x-on`, `v-model`, `@submit`, `data-*`, dan handler JavaScript lain yang sudah aktif.
- Logic JavaScript untuk cart, checkout, pembayaran, login, upload, filter, search, CRUD, dan submit data.
- Integrasi asset, storage, URL gambar, dan fallback gambar yang sudah berjalan.

### Boleh diubah

- Struktur wrapper HTML untuk kebutuhan layout, selama tidak memutus form dan event.
- Class CSS.
- File CSS atau SCSS.
- Komponen Blade/view/template yang bersifat presentasional.
- Penambahan wrapper seperti `div`, `section`, `main`, `aside`, `header`.
- Penambahan icon, badge, card, empty state, toast, modal tampilan, dan responsive container.
- Penambahan CSS variables/design tokens.
- Penambahan file CSS baru agar styling lebih aman dan tidak mengganggu logic lama.

### Prinsip aman

Jika ragu, **jangan hapus kode lama**. Lebih baik bungkus elemen lama dengan class baru dan beri styling tambahan.

---

## 3. Gaya Visual Utama yang Harus Diikuti

Gunakan karakter visual KantinKita:

- Modern, bersih, semi-premium.
- Dominan hijau gelap, hijau emerald, putih, abu muda.
- Rounded corner konsisten.
- Card-based layout.
- Shadow halus.
- Typography tegas dengan hierarki jelas.
- Dashboard desktop menggunakan sidebar gelap.
- Customer-facing page menggunakan nuansa mobile app yang ramah.
- POS/kasir menggunakan layout cepat, padat, dan operasional.
- Merchant dashboard menggunakan panel analitik, tabel, filter, dan kartu statistik.

---

## 4. Design Tokens yang Harus Dipakai

Tambahkan design token berikut ke file CSS utama, misalnya:

- `resources/css/app.css`
- `public/css/app.css`
- `src/index.css`
- atau file baru: `resources/css/kantinkita-ui.css`

Pilih lokasi yang sesuai struktur project.

```css
:root {
  --kk-primary-900: #081C0F;
  --kk-primary-800: #1B4332;
  --kk-primary-700: #2D6A4F;
  --kk-primary-600: #40916C;
  --kk-primary-500: #52B788;
  --kk-primary-400: #74C69D;
  --kk-primary-200: #B7E4C7;
  --kk-primary-100: #D8F3DC;
  --kk-primary-50: #F0FBF3;

  --kk-amber-600: #D97706;
  --kk-amber-500: #F59E0B;
  --kk-amber-400: #FBBF24;
  --kk-amber-100: #FEF3C7;

  --kk-red-600: #DC2626;
  --kk-red-500: #EF4444;
  --kk-red-100: #FEE2E2;

  --kk-emerald-600: #059669;
  --kk-emerald-500: #10B981;
  --kk-emerald-100: #D1FAE5;

  --kk-blue-600: #2563EB;
  --kk-blue-500: #3B82F6;
  --kk-blue-100: #DBEAFE;

  --kk-violet-500: #8B5CF6;
  --kk-violet-100: #EDE9FE;

  --kk-neutral-950: #030712;
  --kk-neutral-900: #0F1117;
  --kk-neutral-800: #1C2333;
  --kk-neutral-700: #252E3F;
  --kk-neutral-600: #374151;
  --kk-neutral-500: #6B7280;
  --kk-neutral-400: #9CA3AF;
  --kk-neutral-300: #D1D5DB;
  --kk-neutral-200: #E5E7EB;
  --kk-neutral-100: #F3F4F6;
  --kk-neutral-50: #F9FAFB;

  --kk-bg: var(--kk-neutral-50);
  --kk-surface: #FFFFFF;
  --kk-border: var(--kk-neutral-200);
  --kk-border-light: var(--kk-neutral-100);

  --kk-text-primary: #111827;
  --kk-text-secondary: var(--kk-neutral-500);
  --kk-text-muted: var(--kk-neutral-400);

  --kk-font-sans: "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --kk-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  --kk-radius-sm: 6px;
  --kk-radius-md: 10px;
  --kk-radius-lg: 14px;
  --kk-radius-xl: 20px;
  --kk-radius-2xl: 28px;
  --kk-radius-full: 9999px;

  --kk-shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --kk-shadow-sm: 0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --kk-shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --kk-shadow-lg: 0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06);

  --kk-sidebar-width: 228px;
  --kk-topbar-height: 56px;
}
```

Tambahkan font jika project mengizinkan external font:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Jika project tidak boleh memakai Google Fonts, gunakan fallback system font.

---

## 5. Komponen Global yang Harus Dibuat

Buat class global berikut. Gunakan nama class baru agar tidak bentrok dengan logic lama.

### Button

```css
.kk-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 20px;
  border-radius: var(--kk-radius-md);
  border: 1.5px solid transparent;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: all .18s ease;
}

.kk-btn-primary {
  background: var(--kk-primary-700);
  color: #fff;
  border-color: var(--kk-primary-700);
}

.kk-btn-primary:hover {
  background: var(--kk-primary-800);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(45,106,79,.35);
}

.kk-btn-secondary {
  background: transparent;
  color: var(--kk-primary-600);
  border-color: var(--kk-primary-600);
}

.kk-btn-secondary:hover {
  background: var(--kk-primary-100);
}

.kk-btn-danger {
  background: var(--kk-red-500);
  color: #fff;
  border-color: var(--kk-red-500);
}

.kk-btn-sm {
  min-height: 32px;
  padding: 0 12px;
  font-size: 11px;
  border-radius: var(--kk-radius-sm);
}

.kk-btn-lg {
  min-height: 48px;
  font-size: 15px;
}

.kk-btn-block {
  width: 100%;
}
```

### Card dan Panel

```css
.kk-card,
.kk-panel {
  background: var(--kk-surface);
  border: 1px solid var(--kk-border);
  border-radius: var(--kk-radius-lg);
  box-shadow: var(--kk-shadow-xs);
}

.kk-panel {
  overflow: hidden;
  margin-bottom: 16px;
}

.kk-panel-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--kk-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.kk-panel-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--kk-text-primary);
}

.kk-panel-body {
  padding: 20px;
}
```

### Form

```css
.kk-input,
.kk-select,
.kk-textarea {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  background: #fff;
  border: 1.5px solid var(--kk-border);
  border-radius: var(--kk-radius-md);
  font-size: 13px;
  color: var(--kk-text-primary);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}

.kk-textarea {
  min-height: 96px;
  padding: 12px;
  resize: vertical;
}

.kk-input:focus,
.kk-select:focus,
.kk-textarea:focus {
  border-color: var(--kk-primary-600);
  box-shadow: 0 0 0 3px rgba(64,145,108,.15);
}

.kk-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--kk-text-secondary);
}

.kk-form-group {
  margin-bottom: 14px;
}
```

### Badge

```css
.kk-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: var(--kk-radius-full);
  font-size: 11px;
  font-weight: 700;
}

.kk-badge-success {
  background: var(--kk-emerald-100);
  color: #065F46;
}

.kk-badge-warning {
  background: var(--kk-amber-100);
  color: #92400E;
}

.kk-badge-error {
  background: var(--kk-red-100);
  color: #991B1B;
}

.kk-badge-info {
  background: var(--kk-blue-100);
  color: #1E40AF;
}

.kk-badge-neutral {
  background: var(--kk-neutral-100);
  color: var(--kk-neutral-600);
}
```

### Table

```css
.kk-table {
  width: 100%;
  border-collapse: collapse;
}

.kk-table th {
  text-align: left;
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 700;
  color: var(--kk-text-muted);
  text-transform: uppercase;
  letter-spacing: .8px;
  background: var(--kk-neutral-50);
  border-bottom: 1px solid var(--kk-border);
  white-space: nowrap;
}

.kk-table td {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--kk-text-primary);
  border-bottom: 1px solid var(--kk-border-light);
  vertical-align: middle;
}

.kk-table tbody tr:hover td {
  background: var(--kk-neutral-50);
}
```

---

## 6. Layout untuk Halaman Customer

Gunakan gaya dari `kk-part1-customer.html`.

Cocok untuk halaman:

- Home produk.
- Detail produk.
- Keranjang.
- Checkout.
- Riwayat pesanan.
- Tracking pesanan.
- Notifikasi.
- Profil customer.
- Top up wallet.
- Rating/review.

### Arahan desain

1. Buat tampilan customer terasa seperti aplikasi mobile.
2. Gunakan header putih, bottom navigation, search bar, kategori pill, product card, cart bar, dan empty state.
3. Untuk desktop, pusatkan konten dengan max-width seperti mobile app.
4. Untuk mobile asli, jangan pakai phone frame terlalu tebal. Gunakan frame hanya jika halaman demo/preview.
5. Jika website customer sudah desktop, tetap ambil gaya card, spacing, warna, dan navigasinya.

### Struktur rekomendasi

```html
<main class="kk-customer-shell">
  <header class="kk-mobile-header">
    <!-- logo, nama app, lokasi/user, tombol notif -->
  </header>

  <section class="kk-search-section">
    <!-- search input dan filter -->
  </section>

  <nav class="kk-pill-tabs">
    <!-- kategori menu -->
  </nav>

  <section class="kk-product-grid">
    <!-- product cards -->
  </section>

  <nav class="kk-bottom-nav">
    <!-- beranda, pesanan, cari, notif, profil -->
  </nav>
</main>
```

### CSS customer

```css
.kk-customer-shell {
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  background: var(--kk-neutral-50);
  font-family: var(--kk-font-sans);
  color: var(--kk-text-primary);
  position: relative;
  overflow-x: hidden;
}

.kk-mobile-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid var(--kk-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.kk-search-section {
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid var(--kk-border-light);
}

.kk-pill-tabs {
  display: flex;
  gap: 6px;
  padding: 10px 16px;
  overflow-x: auto;
  background: #fff;
}

.kk-pill-tabs::-webkit-scrollbar {
  display: none;
}

.kk-pill {
  padding: 6px 14px;
  border-radius: var(--kk-radius-full);
  border: 1.5px solid var(--kk-border);
  background: #fff;
  color: var(--kk-text-secondary);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.kk-pill.active {
  background: var(--kk-primary-700);
  border-color: var(--kk-primary-700);
  color: #fff;
}

.kk-product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
  padding-bottom: 88px;
}

.kk-product-card {
  background: #fff;
  border: 1px solid var(--kk-border);
  border-radius: var(--kk-radius-lg);
  box-shadow: var(--kk-shadow-xs);
  overflow: hidden;
}

.kk-product-image {
  aspect-ratio: 1 / .72;
  background: var(--kk-primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
}

.kk-product-body {
  padding: 12px;
}

.kk-product-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--kk-text-primary);
  line-height: 1.35;
}

.kk-product-meta {
  margin-top: 4px;
  font-size: 11px;
  color: var(--kk-text-muted);
}

.kk-product-price {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 800;
  color: var(--kk-primary-700);
}

.kk-bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 0;
  width: min(430px, 100%);
  transform: translateX(-50%);
  height: 64px;
  background: #fff;
  border-top: 1px solid var(--kk-border-light);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  z-index: 30;
}
```

---

## 7. Layout untuk Halaman Kasir / POS

Gunakan gaya dari `kk-part2-kasir.html`.

Cocok untuk halaman:

- Point of Sale.
- Daftar order masuk.
- Kelola menu.
- Data staff.
- Laporan harian.
- Laporan mingguan.
- Pengaturan kasir.

### Arahan desain

1. Gunakan sidebar kiri gelap.
2. Gunakan topbar putih untuk judul halaman, waktu, tombol aksi.
3. POS memakai dua kolom:
   - kiri: daftar produk/menu.
   - kanan: ringkasan order/checkout.
4. Produk POS harus mudah diklik, padat, dan cepat terbaca.
5. Jangan ubah fungsi add-to-cart, update qty, hapus item, atau checkout. Hanya ubah tampilannya.

### Struktur rekomendasi

```html
<div class="kk-admin-shell">
  <aside class="kk-sidebar">
    <!-- brand, menu navigasi, user kasir -->
  </aside>

  <div class="kk-main-area">
    <header class="kk-topbar">
      <!-- title, subtitle, clock, action -->
    </header>

    <main class="kk-content">
      <!-- existing page content -->
    </main>
  </div>
</div>
```

### CSS kasir/admin shell

```css
.kk-admin-shell {
  display: flex;
  min-height: 100vh;
  background: var(--kk-neutral-50);
  font-family: var(--kk-font-sans);
  color: var(--kk-text-primary);
}

.kk-sidebar {
  width: var(--kk-sidebar-width);
  background: var(--kk-primary-900);
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.kk-sidebar-header {
  min-height: var(--kk-topbar-height);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255,255,255,.07);
}

.kk-sidebar-logo {
  width: 30px;
  height: 30px;
  border-radius: var(--kk-radius-sm);
  background: var(--kk-primary-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12px;
  color: #fff;
}

.kk-sidebar-brand {
  font-size: 15px;
  font-weight: 800;
}

.kk-sidebar-sub {
  font-size: 11px;
  color: rgba(255,255,255,.35);
}

.kk-sidebar-nav {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.kk-sidebar-section {
  padding: 10px 8px 3px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,.2);
}

.kk-sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--kk-radius-md);
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,.45);
  text-decoration: none;
  transition: all .15s ease;
}

.kk-sidebar-item:hover {
  background: rgba(255,255,255,.07);
  color: rgba(255,255,255,.85);
}

.kk-sidebar-item.active {
  background: rgba(82,183,136,.15);
  color: var(--kk-primary-400);
}

.kk-main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.kk-topbar {
  height: var(--kk-topbar-height);
  background: #fff;
  border-bottom: 1px solid var(--kk-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.kk-topbar-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -.3px;
}

.kk-topbar-subtitle {
  font-size: 11px;
  color: var(--kk-text-muted);
}

.kk-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
```

### CSS POS

```css
.kk-pos-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 0;
  min-height: calc(100vh - var(--kk-topbar-height));
}

.kk-pos-left {
  min-width: 0;
  border-right: 1px solid var(--kk-border);
  background: var(--kk-neutral-50);
}

.kk-pos-toolbar {
  padding: 10px 12px;
  background: #fff;
  border-bottom: 1px solid var(--kk-border);
  display: flex;
  gap: 8px;
}

.kk-pos-grid {
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.kk-pos-item {
  background: #fff;
  border: 1.5px solid var(--kk-border);
  border-radius: var(--kk-radius-lg);
  padding: 10px;
  cursor: pointer;
  text-align: center;
  transition: all .2s ease;
  position: relative;
}

.kk-pos-item:hover {
  border-color: var(--kk-primary-400);
  background: var(--kk-primary-50);
  transform: translateY(-1px);
  box-shadow: var(--kk-shadow-sm);
}

.kk-pos-item.out,
.kk-pos-item.disabled {
  opacity: .35;
  cursor: not-allowed;
  pointer-events: none;
}

.kk-pos-item-emoji {
  font-size: 28px;
  display: block;
  margin-bottom: 6px;
}

.kk-pos-item-name {
  font-size: 11px;
  font-weight: 700;
  color: var(--kk-text-primary);
  line-height: 1.3;
}

.kk-pos-item-price {
  margin-top: 3px;
  font-size: 12px;
  font-weight: 800;
  color: var(--kk-primary-700);
}

.kk-pos-order-panel {
  background: #fff;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-left: 1px solid var(--kk-border);
}
```

---

## 8. Layout untuk Halaman Merchant / Dashboard

Gunakan gaya dari `kk-part3-merchant.html`.

Cocok untuk halaman:

- Overview dashboard.
- Pesanan realtime.
- Manajemen menu.
- Promo.
- Stok.
- Analytics.
- Riwayat pesanan.
- Review pelanggan.
- Finance.
- Subscription.
- Settings.

### Arahan desain

1. Gunakan sidebar hijau gelap dan topbar putih.
2. Gunakan grid statistik 2/3/4 kolom.
3. Gunakan panel untuk tabel, grafik, review, promo, finance.
4. Dashboard harus ringkas: angka penting terlihat dulu, detail di bawah.
5. Status penting gunakan badge berwarna.
6. Semua tabel harus konsisten spacing, border, hover, dan typography.

### CSS statistik

```css
.kk-stat-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.kk-stat-grid-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.kk-stat-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.kk-stat-card {
  background: #fff;
  border: 1px solid var(--kk-border);
  border-radius: var(--kk-radius-lg);
  padding: 16px;
  box-shadow: var(--kk-shadow-xs);
}

.kk-stat-card-gradient {
  background: linear-gradient(135deg, var(--kk-primary-700), var(--kk-primary-500));
  border: none;
  color: #fff;
}

.kk-stat-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--kk-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  margin-bottom: 12px;
}

.kk-stat-value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -.5px;
  line-height: 1;
  margin-bottom: 4px;
}

.kk-stat-label {
  font-size: 11px;
  color: var(--kk-text-secondary);
  font-weight: 500;
}

.kk-stat-card-gradient .kk-stat-label {
  color: rgba(255,255,255,.72);
}
```

---

## 9. Responsive Rules

Pastikan semua halaman nyaman di desktop, tablet, dan mobile.

### Desktop

- Sidebar tampil permanen untuk kasir/merchant/admin.
- Content padding 20px.
- Grid statistik 4 kolom jika cukup.
- POS dua kolom.

### Tablet

- Sidebar boleh mengecil atau tetap 228px jika layar cukup.
- POS order panel bisa mengecil ke 300px.
- Grid statistik turun menjadi 2 kolom.

### Mobile

- Sidebar menjadi drawer atau horizontal top navigation.
- Content padding 12px.
- Grid statistik 1 kolom.
- POS order panel turun ke bawah.
- Customer shell full width.
- Bottom nav hanya dipakai untuk customer-facing page.

Tambahkan CSS berikut:

```css
@media (max-width: 1024px) {
  .kk-stat-grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kk-pos-layout {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}

@media (max-width: 768px) {
  .kk-admin-shell {
    flex-direction: column;
  }

  .kk-sidebar {
    width: 100%;
    min-height: auto;
  }

  .kk-sidebar-nav {
    display: flex;
    overflow-x: auto;
    gap: 6px;
  }

  .kk-sidebar-section {
    display: none;
  }

  .kk-sidebar-item {
    white-space: nowrap;
  }

  .kk-content {
    padding: 12px;
  }

  .kk-stat-grid,
  .kk-stat-grid-4,
  .kk-stat-grid-3 {
    grid-template-columns: 1fr;
  }

  .kk-pos-layout {
    grid-template-columns: 1fr;
  }

  .kk-pos-order-panel {
    border-left: none;
    border-top: 1px solid var(--kk-border);
  }
}
```

---

## 10. Strategi Implementasi di Project

Kerjakan secara bertahap dan aman.

### Tahap 1 — Audit

1. Baca struktur project.
2. Identifikasi framework:
   - Laravel Blade
   - React
   - Vue
   - HTML biasa
   - PHP native
   - lainnya
3. Temukan layout utama:
   - `app.blade.php`
   - `layouts/*.blade.php`
   - `resources/views/*`
   - `src/components/*`
   - `src/pages/*`
   - `public/css/*`
4. Catat halaman:
   - Customer/public pages.
   - Admin/merchant dashboard.
   - Kasir/POS.
   - Login/register.
   - CRUD produk/menu.
   - Checkout/order/payment.

### Tahap 2 — Tambahkan CSS Aman

1. Buat file CSS baru jika memungkinkan:
   - `resources/css/kantinkita-ui.css`
   - atau `public/css/kantinkita-ui.css`
2. Import file CSS di layout utama.
3. Jangan langsung menghapus CSS lama.
4. CSS baru harus menggunakan prefix `kk-` agar aman.

### Tahap 3 — Refactor View

1. Ubah struktur visual halaman satu per satu.
2. Pertahankan semua logic lama.
3. Jangan hapus form.
4. Jangan mengganti `name`, `id`, `route`, `action`, `method`.
5. Jika elemen lama sudah dipakai JavaScript, pertahankan selector-nya.
6. Tambahkan class baru di samping class lama.

Contoh aman:

```html
<!-- Sebelum -->
<button id="checkoutBtn" onclick="checkout()" class="btn-old">Checkout</button>

<!-- Sesudah: aman karena id dan onclick tetap ada -->
<button id="checkoutBtn" onclick="checkout()" class="btn-old kk-btn kk-btn-primary kk-btn-block">
  Checkout
</button>
```

Contoh tidak aman:

```html
<!-- Jangan lakukan ini jika JS/backend memakai id lama -->
<button class="kk-btn kk-btn-primary">Checkout</button>
```

### Tahap 4 — Validasi Fungsi

Setelah styling selesai, cek semua fungsi:

- Login.
- Register.
- Logout.
- CRUD menu/produk.
- Upload gambar.
- Search/filter.
- Add to cart.
- Update qty.
- Checkout.
- Pembayaran.
- Status order.
- Cetak/unduh laporan.
- Pagination.
- Modal.
- Toast.
- Validasi error.
- Responsif mobile.

### Tahap 5 — Cleanup

1. Rapikan CSS duplikat.
2. Hapus class yang benar-benar tidak dipakai hanya jika yakin.
3. Jangan menghapus script lama yang berkaitan dengan fungsi.
4. Pastikan tidak ada error di console browser.

---

## 11. Mapping Halaman ke Gaya UI

Gunakan mapping ini saat mengubah tampilan.

| Jenis Halaman | Gaya yang Dipakai | Referensi |
|---|---|---|
| Landing page | Clean marketing + card produk | Customer |
| Daftar produk/menu | Mobile card grid / catalog | Customer |
| Detail produk | Mobile detail page + CTA sticky | Customer |
| Cart/checkout | Cart summary + payment option card | Customer |
| Profil user | Profile hero + menu list | Customer |
| POS kasir | Sidebar + product grid + order panel | Kasir |
| Daftar order kasir | Kanban/table status | Kasir |
| Kelola menu | Panel form + table | Kasir/Merchant |
| Laporan | Stat card + table + chart sederhana | Kasir/Merchant |
| Merchant overview | KPI cards + chart + recent orders | Merchant |
| Review pelanggan | Review card + reply box | Merchant |
| Finance | Finance hero + withdraw card + table | Merchant |
| Settings | Settings section + settings row | Kasir/Merchant |
| Admin | Sidebar dashboard + panel + table | Merchant style |

---

## 12. Detail UI yang Harus Konsisten

### Warna

- Primary action: `--kk-primary-700`.
- Hover primary: `--kk-primary-800`.
- Background umum: `--kk-neutral-50`.
- Surface/card: putih.
- Border: `--kk-neutral-200`.
- Success: emerald.
- Warning: amber.
- Error: red.
- Info: blue.

### Typography

- Font utama: Plus Jakarta Sans atau system font.
- Judul halaman: 18–24px, weight 800.
- Judul panel: 14px, weight 800.
- Body: 13–15px.
- Label: 11–12px, weight 700.
- Angka KPI: 22–36px, weight 800.

### Spacing

- Page padding desktop: 20px.
- Page padding mobile: 12px.
- Card padding: 14–20px.
- Gap grid: 12–16px.
- Header height: 56px.

### Radius

- Button/input: 10px.
- Card/panel: 14px.
- Hero/card besar: 20px.
- Pill/badge: full radius.

### Shadow

- Gunakan shadow halus saja.
- Jangan membuat shadow terlalu berat.
- Hover card boleh naik `translateY(-1px)`.

---

## 13. Pola Empty State

Jika halaman kosong, tampilkan empty state yang ramah.

```html
<div class="kk-empty-state">
  <div class="kk-empty-icon">🛒</div>
  <h3>Belum ada data</h3>
  <p>Data akan muncul setelah aktivitas tersedia.</p>
</div>
```

```css
.kk-empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--kk-text-secondary);
}

.kk-empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--kk-primary-50);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 12px;
}

.kk-empty-state h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--kk-text-primary);
  margin-bottom: 4px;
}

.kk-empty-state p {
  font-size: 13px;
  color: var(--kk-text-muted);
}
```

---

## 14. Pola Toast dan Alert

Jika project sudah punya toast/alert, jangan ubah logic-nya. Cukup styling container-nya.

```css
.kk-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid var(--kk-border);
  border-radius: var(--kk-radius-lg);
  box-shadow: var(--kk-shadow-lg);
  font-size: 13px;
}

.kk-alert-success {
  border-left: 3px solid var(--kk-emerald-500);
}

.kk-alert-error {
  border-left: 3px solid var(--kk-red-500);
}

.kk-alert-warning {
  border-left: 3px solid var(--kk-amber-500);
}

.kk-alert-info {
  border-left: 3px solid var(--kk-blue-500);
}
```

---

## 15. Kriteria Selesai

UI/UX dianggap selesai jika:

1. Semua halaman utama terlihat seragam dengan gaya KantinKita.
2. Tidak ada fungsi lama yang rusak.
3. Semua form tetap mengirim data dengan benar.
4. Semua tombol penting tetap bekerja.
5. Layout rapi di desktop, tablet, dan mobile.
6. Tidak ada error JavaScript di console.
7. Tidak ada route/controller/model/migration yang berubah tanpa alasan kuat.
8. Gambar tetap tampil dengan fallback yang aman.
9. Table, card, button, input, badge, dan panel sudah konsisten.
10. Desain customer, kasir, dan merchant memiliki karakter berbeda tetapi tetap satu identitas visual.

---

## 16. Instruksi Eksekusi untuk Antigravity

Lakukan implementasi dengan urutan berikut:

1. **Scan project** dan pahami struktur file.
2. **Jangan langsung edit logic**. Pisahkan perubahan UI dari logic.
3. Buat file CSS baru bernama `kantinkita-ui.css` atau sesuaikan dengan standar project.
4. Tambahkan design tokens dan komponen global.
5. Update layout utama agar memakai font, background, dan shell yang sesuai.
6. Refactor halaman customer/public memakai gaya mobile catalog.
7. Refactor halaman kasir/POS memakai sidebar + POS layout.
8. Refactor halaman merchant/admin memakai dashboard layout.
9. Tambahkan responsive rules.
10. Jalankan pengecekan manual pada semua alur utama.
11. Laporkan file apa saja yang diubah dan alasan perubahannya.

---

## 17. Batasan Final

Jangan melakukan perubahan besar yang tidak diminta seperti:

- Mengganti framework.
- Mengganti database.
- Mengubah flow bisnis.
- Membuat ulang aplikasi dari nol.
- Menghapus fitur.
- Menghapus validasi.
- Mengubah struktur URL.
- Mengubah proses upload gambar.
- Mengubah nama tabel/kolom database.
- Mengubah role/permission.

Fokus hanya pada **UI/UX, layout, visual hierarchy, responsive design, dan konsistensi komponen**.
