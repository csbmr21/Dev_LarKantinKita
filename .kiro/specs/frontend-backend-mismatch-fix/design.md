# Frontend-Backend Mismatch Fix — Bugfix Design

## Overview

Terdapat **10 mismatch** antara frontend React/Zustand dan backend Laravel pada aplikasi KantinKita. Bug-bug ini bersifat ringan (typo nama field) hingga fundamental (arsitektur cart yang berbeda). Seluruh perbaikan dilakukan **hanya di sisi frontend** — tidak ada perubahan schema database atau backend API — kecuali Bug 8 yang memerlukan refaktor cara frontend berinteraksi dengan cart API.

Strategi perbaikan mengikuti prinsip minimal-diff: ubah hanya ekspresi akses field dan alur yang salah, tanpa mengubah logika bisnis, tampilan UI, atau komponen yang sudah benar.

---

## Glossary

- **Bug_Condition (C)**: Kondisi yang menyebabkan mismatch — ketika frontend mengakses field/alur yang tidak ada atau berbeda di backend
- **Property (P)**: Perilaku yang diharapkan setelah perbaikan — data tampil benar dan alur kerja berfungsi
- **Preservation**: Semua behavior UI yang sudah benar dan tidak boleh berubah setelah fix
- **`tenant_name`**: Field nama kantin di tabel `tenants` dan response API (bukan `name`)
- **`photo_url`**: Appended accessor di model `Menu` dan `Tenant` yang mengembalikan URL lengkap gambar (bukan `image_url`)
- **`is_available`**: Field boolean di tabel `menus` sebagai indikator ketersediaan (bukan `stock`)
- **`category.name`**: Nama kategori menu diakses via relasi objek eager-loaded (bukan string langsung)
- **`order_number`**: Field nomor pesanan di tabel `orders` (bukan `order_code`)
- **`user.full_name`**: Nama pelanggan diakses via relasi `user` dengan field `full_name` (bukan `customer.name`)
- **`grand_total`**: Field total pembayaran final di tabel `orders` (bukan `total`)
- **Cart API flow**: Backend mengelola cart sebagai Order record dengan `status='cart'`; frontend harus memanggil API cart secara bertahap
- **DB status enum**: `paid | processing | completed` — bukan `accepted | cooking | ready`

---

## Bug Details

### Bug Condition (Gabungan 10 Bug)

Semua bug memiliki kondisi yang sama: frontend mengakses field atau menggunakan alur yang tidak sesuai dengan schema database dan API response backend.

**Formal Specification:**
```
FUNCTION isBugCondition(accessPattern)
  INPUT: accessPattern — ekspresi akses field atau alur API call di frontend
  OUTPUT: boolean

  RETURN (
    accessPattern.field == 'tenant.name'          OR   -- Bug 1
    accessPattern.field == 'm.emoji'              OR   -- Bug 2
    accessPattern.field == 'm.image_url'          OR   -- Bug 3
    accessPattern.field == 'm.category' (as string)   OR   -- Bug 4
    accessPattern.field == 'm.stock'              OR   -- Bug 5
    accessPattern.field == 'order.order_code'     OR   -- Bug 6
    accessPattern.field == 'o.customer?.name'     OR   -- Bug 7
    accessPattern.flow  == 'localCart+directCheckout' OR -- Bug 8
    accessPattern.status IN ['accepted','cooking','ready'] OR -- Bug 9
    accessPattern.field == 'o.total'                   -- Bug 10
  )
END FUNCTION
```

### Contoh Manifestasi Per Bug

**Bug 1** — `TenantCard.jsx` dan `TenantDetail.jsx`:
- Sebelum fix: `tenant.name` → `undefined` (field tidak ada)
- Sesudah fix: `tenant.tenant_name` → `"Kantin Bu Siti"`

**Bug 2** — `MenuCard.jsx` dan halaman lain yang menampilkan ikon menu:
- Sebelum fix: `m.emoji` → `undefined` ditampilkan
- Sesudah fix: gunakan `getMenuEmoji(m)` dari `utils/orderStatus.js` sebagai fallback

**Bug 3** — `MenuCard.jsx` (image display):
- Sebelum fix: `menu.image_url` → `undefined`, gambar broken
- Sesudah fix: `menu.photo_url` → `"http://api/storage/menus/1/xxx.jpg"`
- **Catatan**: `MenuCard.jsx` sudah pakai `menu.photo_url` — konfirmasi tidak ada file lain yang masih pakai `image_url`

**Bug 4** — `MenuManagement.jsx` (staff):
- Sebelum fix: `m.category` dirender langsung → `[object Object]`
- Sesudah fix: `m.category?.name || 'Tanpa Kategori'`
- **Catatan**: `MenuManagement.jsx` sudah benar, `TenantDetail.jsx` juga sudah benar. Perlu verifikasi file lain.

**Bug 5** — Komponen yang menampilkan stok:
- Sebelum fix: `m.stock` → `undefined`
- Sesudah fix: tampilkan badge "Tersedia" / "Habis" berdasarkan `m.is_available`

**Bug 6** — `OrderCard.jsx` dan halaman order:
- Sebelum fix: `order.order_code` → `undefined`
- Sesudah fix: `order.order_number` → `"ORD-20241201-001"`
- **Catatan**: `OrderCard.jsx` sudah menggunakan `order.order_number` dengan benar

**Bug 7** — `StaffDashboard.jsx` dan komponen order staff:
- Sebelum fix: `o.customer?.name` → `undefined`
- Sesudah fix: `o.user?.full_name` → `"Budi Santoso"`
- **Catatan**: `StaffDashboard.jsx` sudah benar menggunakan `order.user?.full_name`

**Bug 8** — `Checkout.jsx` mengirim payload yang salah:
- Sebelum fix: `orderApi.checkout({ tenant_id, items: [...], notes })` — backend tidak menerima `items` di body
- Sesudah fix: Sync cart ke server via `POST /api/customer/cart/add` per item, lalu `POST /api/customer/checkout` hanya dengan `{ notes }`

**Bug 9** — `StaffDashboard.jsx` kolom kanban:
- Sebelum fix: filter dengan status `accepted`, `cooking`, `ready` → tidak ada order yang muncul
- Sesudah fix: gunakan `paid`, `processing`, `completed` sesuai `STAFF_FILTER_TABS`
- **Catatan**: `StaffDashboard.jsx` dan `STAFF_FILTER_TABS` sudah benar. Verifikasi apakah ada file lain (KasirView) yang masih salah.

**Bug 10** — `OrderCard.jsx` dan halaman-halaman yang menampilkan total:
- Sebelum fix: `order.total` → `undefined`
- Sesudah fix: `order.grand_total` → `15300`
- **Catatan**: `OrderCard.jsx` sudah benar menggunakan `order.grand_total`

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors — yang sudah benar dan tidak boleh disentuh:**
- `TenantCard.jsx` — sudah menggunakan `tenant.tenant_name` dan `photo_url` ✓
- `TenantDetail.jsx` — sudah menggunakan `tenant?.tenant_name`, `photo_url`, `m.category?.name` ✓
- `MenuCard.jsx` — sudah menggunakan `menu.photo_url` dan `menu.is_available` ✓
- `OrderCard.jsx` — sudah menggunakan `order.order_number` dan `order.grand_total` ✓
- `StaffDashboard.jsx` — sudah menggunakan `order.user?.full_name` dan status `paid/processing/completed` ✓
- `MenuManagement.jsx` — sudah menggunakan `menu.category?.name || 'Tanpa Kategori'` ✓
- `orderStatus.js` — `STAFF_FILTER_TABS` sudah sinkron dengan DB status ✓
- `cartApi` — endpoint sudah benar (`/api/v1/customer/cart/add`, dll) ✓
- `orderApi.checkout` — sudah mengirim hanya `{ notes }` ✓
- Seluruh alur autentikasi (login/logout/token) tidak berubah
- Alur POS KasirView (cart lokal Zustand) tidak berubah

**Scope:**
Semua input yang tidak melibatkan 10 kondisi bug di atas harus sepenuhnya tidak terpengaruh oleh perbaikan ini.

---

## Hypothesized Root Cause

Berdasarkan analisis kode frontend dan backend:

1. **Inkonsistensi penamaan field saat development awal** (Bug 1, 3, 6, 10): Developer frontend mengasumsi nama field yang berbeda dari schema database (`name` vs `tenant_name`, `image_url` vs `photo_url`, `order_code` vs `order_number`, `total` vs `grand_total`). Beberapa sudah diperbaiki di komponen baru tapi mungkin masih ada sisa di tempat lain.

2. **Field yang tidak ada di schema** (Bug 2, 5): Developer frontend menambahkan field `emoji` dan `stock` ke komponen tanpa mengecek schema database. Backend tidak pernah memiliki kedua field ini; fungsionalitas yang setara sudah ada (`photo_url` + `getMenuEmoji()` utility, dan `is_available` boolean).

3. **Relasi objek vs string primitif** (Bug 4): Developer frontend memperlakukan `category` sebagai string langsung, padahal backend mengirimkan relasi eager-loaded sebagai objek `{ id, name, ... }`.

4. **Arsitektur cart yang berbeda** (Bug 8): Developer frontend mengimplementasikan cart lokal murni (Zustand) dan mengharapkan endpoint checkout menerima array `items`. Backend mendesain cart sebagai server-side state (Order record dengan `status='cart'`) dan endpoint checkout hanya membaca cart dari DB.

5. **Status kanban yang tidak sinkron dengan DB** (Bug 9): Developer frontend membuat kolom kanban dengan nama status yang lebih deskriptif (`accepted`, `cooking`, `ready`) yang tidak pernah ada di enum `orders.status` di backend (`paid`, `processing`, `completed`).

---

## Correctness Properties

Property 1: Bug Condition — Field Access Correction

_For any_ render call dimana frontend mengakses field dari objek API response, setelah fix sistem SHALL mengembalikan nilai yang benar (bukan `undefined`) untuk semua 10 field/alur yang salah: `tenant_name`, `photo_url`, `category.name`, `is_available`, `order_number`, `user.full_name`, `grand_total`, cart API flow, status kanban, dan penghapusan referensi `emoji`/`stock`.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13**

Property 2: Preservation — Non-Buggy Behavior Unchanged

_For any_ komponen atau alur yang tidak termasuk dalam 10 bug condition (autentikasi, POS KasirView lokal, komponen yang sudah benar), sistem SHALL menghasilkan behavior yang identik sebelum dan sesudah fix, tanpa regresi pada tampilan atau fungsionalitas yang sudah berjalan.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**

---

## Fix Implementation

### Audit Awal — Konfirmasi Status Per File

Berdasarkan pembacaan kode, beberapa "bug" sudah diperbaiki di komponen utama. Fix harus dimulai dengan **audit grep** untuk menemukan sisa penggunaan field yang salah di seluruh codebase.

```
GREP PATTERNS TO FIND REMAINING BUGS:
  Bug 1: /tenant\.name[^_]/        → should be: tenant.tenant_name
  Bug 2: /m\.emoji|menu\.emoji/    → should be: getMenuEmoji(m)
  Bug 3: /\.image_url/             → should be: .photo_url
  Bug 4: /\bm\.category\b[^?.]|menu\.category[^?.]/ → should be: category?.name
  Bug 5: /m\.stock|menu\.stock/    → should be: is_available
  Bug 6: /order_code/              → should be: order_number
  Bug 7: /customer\?\.name|customer\.name/ → should be: user?.full_name
  Bug 8: checkout payload dengan items array
  Bug 9: status 'accepted'|'cooking'|'ready'
  Bug 10: /order\.total\b|o\.total\b/ → should be: grand_total
```

### Changes Required

---

#### Bug 1 — `tenant.name` → `tenant.tenant_name`

**File yang perlu dicek:** Seluruh `src/` — terutama halaman admin yang mungkin masih mix

**Fix:** Ganti semua `tenant.name` (tanpa suffix `_name`) menjadi `tenant.tenant_name`

**Pengecualian:** Admin TenantController sudah ada fallback `tenant_name ?? name` — komponen admin tidak perlu diubah

---

#### Bug 2 — `m.emoji` → `getMenuEmoji(m)` (fallback utility)

**File yang perlu dicek:** Semua komponen yang merender ikon/emoji menu

**Fix:**
```javascript
// Sebelum (SALAH):
<span>{m.emoji}</span>

// Sesudah (BENAR):
import { getMenuEmoji } from '../../utils/orderStatus';
<span>{getMenuEmoji(m)}</span>
```

**Catatan:** `getMenuEmoji()` sudah ada di `src/utils/orderStatus.js` dan berfungsi dengan benar — hanya perlu dipanggil di tempat yang masih pakai `m.emoji`.

---

#### Bug 3 — `m.image_url` → `m.photo_url`

**File yang perlu dicek:** Seluruh `src/` — cari `.image_url`

**Fix:** Ganti semua `.image_url` menjadi `.photo_url`

**Catatan:** `MenuCard.jsx` sudah benar. Mungkin ada di komponen lama atau form edit.

---

#### Bug 4 — `m.category` (string) → `m.category?.name`

**File yang perlu dicek:** Komponen yang menampilkan kategori sebagai string

**Fix:**
```javascript
// Sebelum (SALAH):
<span>{m.category}</span>

// Sesudah (BENAR):
<span>{m.category?.name || 'Tanpa Kategori'}</span>
```

---

#### Bug 5 — `m.stock` → `m.is_available`

**File yang perlu dicek:** Komponen yang menampilkan stok atau ketersediaan menu

**Fix:**
```javascript
// Sebelum (SALAH):
<span>Stok: {m.stock}</span>

// Sesudah (BENAR):
<span>{m.is_available ? 'Tersedia' : 'Habis'}</span>
```

---

#### Bug 6 — `order.order_code` → `order.order_number`

**File yang perlu dicek:** Halaman detail order, receipt, dan komponen order customer

**Fix:** Ganti semua `order_code` menjadi `order_number`

---

#### Bug 7 — `o.customer?.name` → `o.user?.full_name`

**File yang perlu dicek:** Komponen order staff, owner reports, dan halaman riwayat

**Fix:**
```javascript
// Sebelum (SALAH):
order.customer?.name

// Sesudah (BENAR):
order.user?.full_name
```

---

#### Bug 8 — Cart Flow Refactor (PERUBAHAN PALING SIGNIFIKAN)

**File:** `src/pages/customer/Checkout.jsx` dan `src/pages/customer/TenantDetail.jsx`

**Masalah:** `Checkout.jsx` memanggil `orderApi.checkout({ tenant_id, items: [...], notes })`. Backend hanya menerima `{ notes }` dan membaca cart dari DB.

**Root Cause Confirmation:** `cartApi.js` sudah benar dengan endpoint `/api/v1/customer/cart/add`. `orderApi.checkout` sudah benar hanya mengirim `{ notes }`. **Yang salah adalah `Checkout.jsx` masih mengirim `items` array dan tidak menggunakan `cartApi` untuk sync ke server.**

**Fix di `Checkout.jsx`:**
```javascript
// SEBELUM (SALAH) — processCheckout():
const res = await orderApi.checkout({
  tenant_id: tenantId,
  items: items.map((i) => ({ menu_id: i.menuId, quantity: i.quantity })),
  notes,
});

// SESUDAH (BENAR) — processCheckout():
// Step 1: Sync cart lokal ke server (jika belum tersync)
// Step 2: Checkout hanya dengan notes
const res = await orderApi.checkout({ notes });
```

**Fix di `MenuCard.jsx` / `TenantDetail.jsx` — addItem handler:**

Saat ini `addItem` di `MenuCard.jsx` hanya menyimpan ke Zustand lokal. Untuk sinkronisasi dengan backend, perlu memanggil `cartApi.addItem()` sebelum update state lokal.

```javascript
// SEBELUM (SALAH) — hanya update Zustand:
const handleAdd = () => {
  addItem({ menuId: menu.id, name: menu.name, ... });
};

// SESUDAH (BENAR) — panggil API dulu, lalu update Zustand:
const handleAdd = async () => {
  try {
    await cartApi.addItem(menu.id, 1);
    addItem({ menuId: menu.id, name: menu.name, ... });
  } catch (err) {
    toast.error(err.response?.data?.message ?? 'Gagal menambah ke keranjang');
  }
};
```

**Fix di Cart.jsx — updateQuantity dan removeItem:**

```javascript
// Update quantity harus sync ke server via cartApi.updateItem(cartItemId, quantity)
// Remove harus sync ke server via cartApi.removeItem(cartItemId)
// Clear harus sync ke server via cartApi.clearCart()
```

**Catatan Penting untuk Bug 8:**
- Untuk sync `updateQuantity` dan `removeItem`, frontend perlu menyimpan `cartItemId` (ID dari `OrderItem` di server). Saat ini cart Zustand hanya menyimpan `menuId`. Solusi: setelah `cartApi.addItem()`, simpan `cart_item_id` dari response API ke Zustand item.
- State Zustand tetap dipertahankan sebagai UI state untuk responsivitas — API call hanya sebagai side-effect untuk persistence.
- Setelah checkout berhasil: panggil `clearCart()` untuk reset Zustand (sudah ada di `Checkout.jsx`).

**Struktur data Zustand item yang perlu diupdate:**
```javascript
// Sebelum:
{ menuId, name, price, photo, tenantId, tenantName, quantity }

// Sesudah:
{ menuId, cartItemId, name, price, photo, tenantId, tenantName, quantity }
//         ^^^^^^^^^^^ tambahan field untuk sync delete/update ke server
```

---

#### Bug 9 — KasirView Kanban Status

**File yang perlu dicek:** Seluruh `src/pages/staff/` dan komponen kanban manapun

**Berdasarkan audit:** `StaffDashboard.jsx` dan `STAFF_FILTER_TABS` di `orderStatus.js` sudah menggunakan status yang benar (`paid`, `processing`, `completed`). Perlu dicek apakah ada file KasirView terpisah yang belum ada di listing.

**Fix (jika ditemukan):**
```javascript
// Sebelum (SALAH):
const KANBAN_COLUMNS = ['accepted', 'cooking', 'ready'];

// Sesudah (BENAR):
const KANBAN_COLUMNS = ['paid', 'processing', 'completed'];
// Labels: 'Baru Masuk', 'Sedang Diproses', 'Selesai'
```

---

#### Bug 10 — `o.total` → `o.grand_total`

**File yang perlu dicek:** Halaman customer cart, checkout summary, owner reports

**Fix:** Ganti semua `order.total` / `o.total` menjadi `order.grand_total`

**Catatan:** `Cart.jsx` menggunakan `getTotalPrice()` dari Zustand (benar untuk UI lokal). Yang perlu difix adalah komponen yang menampilkan total dari **API response** (seperti order history detail).

---

## Testing Strategy

### Validation Approach

Strategi pengujian menggunakan dua fase: **exploratory** (konfirmasi bug sebelum fix) dan **verification** (membuktikan fix benar dan tidak ada regresi).

---

### Exploratory Bug Condition Checking

**Goal**: Konfirmasi setiap bug condition menghasilkan output yang salah pada kode unfixed.

**Test Plan**: Mount komponen dengan mock API response yang menggunakan field nama yang benar dari backend, lalu assert output yang tampil.

**Test Cases (akan FAIL sebelum fix):**

1. **Bug 1 — Tenant Name Test**: Render `TenantCard` dengan `{ id:1, tenant_name: "Kantin A" }` — assert teks "Kantin A" muncul (akan fail jika komponen masih pakai `tenant.name`)

2. **Bug 2 — Emoji Test**: Render `MenuCard` dengan `{ id:1, name: "Ayam Goreng", photo_url: null }` — assert emoji fallback muncul bukan string kosong/undefined

3. **Bug 3 — Photo URL Test**: Render `MenuCard` dengan `{ photo_url: "http://api/storage/menus/1.jpg" }` — assert `<img src>` bernilai URL tersebut (akan fail jika pakai `image_url`)

4. **Bug 4 — Category Object Test**: Render komponen menu dengan `{ category: { id: 1, name: "Makanan Berat" } }` — assert teks "Makanan Berat" muncul

5. **Bug 5 — Availability Test**: Render komponen menu dengan `{ is_available: false }` — assert badge "Habis" muncul (bukan mencoba baca `stock`)

6. **Bug 6 — Order Number Test**: Render `OrderCard` dengan `{ order_number: "ORD-001" }` — assert "#ORD-001" muncul

7. **Bug 7 — Customer Name Test**: Render order card dengan `{ user: { full_name: "Budi S" } }` — assert "Budi S" muncul

8. **Bug 8 — Checkout Payload Test**: Mock `orderApi.checkout` dan `cartApi.addItem` — assert checkout hanya dipanggil dengan `{ notes }`, bukan dengan `items` array

9. **Bug 9 — Kanban Status Test**: Render kanban/dashboard dengan orders berstatuts `paid`, `processing`, `completed` — assert order muncul di kolom yang benar

10. **Bug 10 — Grand Total Test**: Render `OrderCard` dengan `{ grand_total: 15300 }` — assert "Rp 15.300" muncul

**Expected Counterexamples (sebelum fix):**
- Bug 1: Teks tenant name kosong atau undefined
- Bug 2: Emoji tidak muncul atau error
- Bug 3: Image broken / src undefined
- Bug 8: `cartApi.addItem` tidak dipanggil saat add to cart; checkout payload berisi `items`

---

### Fix Checking

**Goal**: Verify bahwa setelah fix, semua 10 bug condition menghasilkan output yang benar.

**Pseudocode:**
```
FOR ALL bug IN [Bug1..Bug10] DO
  component := renderWithMockAPIData(bug.component, bug.correctAPIResponse)
  result    := getDisplayedValue(component, bug.targetElement)
  ASSERT result == bug.expectedCorrectValue
END FOR
```

---

### Preservation Checking

**Goal**: Verify bahwa behavior yang sudah benar tidak berubah setelah fix.

**Pseudocode:**
```
FOR ALL component IN [alreadyCorrectComponents] DO
  beforeFix := captureOutput(component, sameProps)
  applyFix()
  afterFix  := captureOutput(component, sameProps)
  ASSERT beforeFix === afterFix
END FOR
```

**Testing Approach**: Property-based testing untuk preservation cocok digunakan karena:
- Generate banyak variasi props secara otomatis
- Mendeteksi edge case yang mungkin terlewat di manual test
- Memastikan tidak ada komponen yang "ikut berubah" tanpa sengaja

**Test Cases:**
1. **TenantCard Preservation**: Verifikasi `TenantCard` tetap menampilkan `tenant_name`, badge buka/tutup, dan navigasi ke detail (tidak berubah)
2. **MenuCard Preservation**: Verifikasi overlay "Habis" dan tombol tambah tetap bekerja dengan `is_available`
3. **OrderCard Preservation**: Verifikasi `order_number` dan `grand_total` tetap ditampilkan dengan benar
4. **StaffDashboard Preservation**: Verifikasi filter tab `paid/processing/completed` tetap bekerja

---

### Unit Tests

- Test render `TenantCard` dengan `tenant_name` field — expect nama kantin ditampilkan
- Test render `MenuCard` dengan `photo_url` field — expect `<img src>` menggunakan `photo_url`
- Test render `MenuCard` dengan `is_available: false` — expect overlay "Habis" muncul
- Test render `MenuCard` dengan `is_available: true` — expect tombol tambah aktif
- Test `getMenuEmoji()` dengan berbagai nama dan kategori menu — expect emoji yang relevan
- Test render `OrderCard` dengan `order_number` dan `grand_total` — expect nilai yang benar
- Test `Checkout.jsx` submit — expect `orderApi.checkout` dipanggil dengan `{ notes }` saja (tanpa `items`)
- Test `MenuCard` handleAdd — expect `cartApi.addItem(menuId, 1)` dipanggil

### Property-Based Tests

- Generate random tenant objects dengan `tenant_name` field — for all: `TenantCard` SHALL render `tenant_name`
- Generate random menu objects dengan `photo_url`, `is_available`, `category.name` — for all: `MenuCard` SHALL tidak mengakses `image_url`, `stock`, atau `emoji`
- Generate random order objects dengan `order_number`, `grand_total`, `user.full_name` — for all: order components SHALL tidak mengakses `order_code`, `total`, atau `customer.name`
- Generate random cart items — for all: `addItem` handler SHALL call `cartApi.addItem` sebelum update Zustand

### Integration Tests

- Test full flow: browse tenant → pilih menu → add to cart (sync ke API) → checkout → order muncul di riwayat dengan `order_number` dan `grand_total` yang benar
- Test staff flow: order masuk dengan status `paid` → muncul di tab "Baru Masuk" → update ke `processing` → muncul di tab "Diproses" → update ke `completed`
- Test menu management: tambah menu → muncul di list dengan `category.name` dan `photo_url` yang benar
- Test availability toggle: `is_available` berubah → overlay "Habis" muncul/hilang dengan benar
