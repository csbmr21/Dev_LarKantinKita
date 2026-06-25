# Implementation Plan

## Overview

Task list ini mengikuti bugfix workflow untuk memperbaiki 3 bug aktif yang ditemukan dari audit grep 10 mismatch frontend-backend. Urutan: eksplorasi test → preservation test → implementasi fix → verifikasi.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"], "description": "Bug condition exploration test (before fix)" },
    { "wave": 2, "tasks": ["2"], "description": "Preservation property tests (before fix)" },
    { "wave": 3, "tasks": ["3.1"], "description": "Grep audit konfirmasi" },
    { "wave": 4, "tasks": ["3.2", "3.3", "3.4"], "description": "Fix Bug 1, 7, dan Bug 8 part A (paralel)" },
    { "wave": 5, "tasks": ["3.5"], "description": "Fix Bug 8 part B — cartStore update" },
    { "wave": 6, "tasks": ["3.6"], "description": "Fix Bug 8 part C — Checkout.jsx payload" },
    { "wave": 7, "tasks": ["4"], "description": "Verify exploration test passes" },
    { "wave": 8, "tasks": ["5"], "description": "Verify preservation tests still pass" },
    { "wave": 9, "tasks": ["6"], "description": "Checkpoint — all tests pass" }
  ]
}
```

## Tasks

> **Konteks Audit:** Sebelum membuat task ini, dilakukan grep audit menyeluruh di seluruh `src/`. Hasilnya:
> - Bug 1 (tenant.name): **DITEMUKAN** di `MerchantView.jsx:413` → `user?.tenant?.name` → perlu `user?.tenant?.tenant_name`
> - Bug 2 (emoji): Tidak ada render aktif `.emoji` di JSX — hanya komentar di KasirView. **CLEAN**
> - Bug 3 (image_url): Tidak ditemukan di seluruh codebase. **CLEAN**
> - Bug 4 (category object): Semua sudah pakai `category?.name`. **CLEAN**
> - Bug 5 (stock): Tidak ditemukan. **CLEAN**
> - Bug 6 (order_code): Tidak ditemukan. **CLEAN**
> - Bug 7 (customer.name): **DITEMUKAN** di `Dashboard.jsx:42` → `order.customer` di toast realtime → perlu `order.user?.full_name`
> - Bug 8 (cart flow): **DITEMUKAN** di `Checkout.jsx:29-33` (masih kirim `items`+`tenant_id`) dan `MenuCard.jsx` (addItem hanya Zustand, tidak panggil `cartApi.addItem`)
> - Bug 9 (kanban status): Tidak ditemukan status salah. **CLEAN**
> - Bug 10 (order.total): Tidak ditemukan. **CLEAN**
>
> **File yang perlu difix: 3 file** — `MerchantView.jsx`, `pages/staff/Dashboard.jsx`, `pages/customer/Checkout.jsx`, `components/shared/MenuCard.jsx`

---

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Frontend Field Access & Cart Flow Mismatch
  - **CRITICAL**: Test ini HARUS GAGAL pada kode yang belum difix — kegagalan mengkonfirmasi bug ada
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: Test ini mengkodekan expected behavior — akan memvalidasi fix saat lulus setelah implementasi
  - **GOAL**: Munculkan counterexample yang membuktikan ketiga bug aktif masih ada
  - **Scoped PBT Approach**: Scope ke concrete failing case yang deterministic untuk reproducibility
  - **Test 1 — Bug 1 (MerchantView tenant name):**
    - Render `MerchantView` dengan mock `useAuthStore` yang mengembalikan `{ user: { tenant: { tenant_name: "Kantin Bu Siti" } } }`
    - Assert teks "Kantin Bu Siti" muncul di sidebar (bukan kosong/"Toko Saya")
    - Akan FAIL karena kode masih baca `user?.tenant?.name` (undefined)
  - **Test 2 — Bug 7 (Staff Dashboard realtime toast):**
    - Mock Pusher `NewOrderReceived` event dengan payload `{ user: { full_name: "Budi Santoso" }, order_number: "ORD-001" }`
    - Assert toast berisi "Budi Santoso" (bukan kosong/"undefined")
    - Akan FAIL karena kode masih baca `order.customer` (undefined di payload realtime)
  - **Test 3 — Bug 8 (Checkout payload dengan items):**
    - Render `Checkout` dengan cart Zustand berisi 2 item, mock `orderApi.checkout`
    - Trigger proses checkout, assert `orderApi.checkout` dipanggil HANYA dengan `{ notes: "..." }` (tanpa `items` atau `tenant_id`)
    - Akan FAIL karena kode masih mengirim `{ tenant_id, items: [...], notes }`
  - **Test 4 — Bug 8 (MenuCard tidak panggil cartApi):**
    - Render `MenuCard` dengan menu valid dan mock `cartApi.addItem`
    - Klik tombol tambah (+), assert `cartApi.addItem(menu.id, 1)` dipanggil
    - Akan FAIL karena `handleAdd` hanya memanggil Zustand `addItem`, tidak `cartApi.addItem`
  - Run semua test pada kode unfixed
  - **EXPECTED OUTCOME**: Semua test GAGAL (membuktikan bug ada)
  - Document counterexamples: e.g. "MerchantView renders 'Toko Saya' instead of tenant name", "checkout payload contains items array"
  - Mark task complete saat test ditulis, dijalankan, dan kegagalan didokumentasikan
  - _Requirements: 1.1, 1.7, 1.8_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Komponen Yang Sudah Benar Tidak Berubah
  - **IMPORTANT**: Ikuti observation-first methodology — jalankan kode unfixed dulu, observasi output, baru tulis test
  - **Observation step — jalankan pada kode unfixed dan catat output:**
    - `TenantCard` dengan `{ tenant_name: "Kantin A", photo_url: "http://...", is_open: true }` → tampilkan nama + badge "Buka"
    - `MenuCard` dengan `{ name: "Ayam Goreng", photo_url: "http://...", is_available: false, price: 15000 }` → tampilkan overlay "Habis"
    - `MenuCard` dengan `{ is_available: true }` → tampilkan tombol tambah aktif
    - `OrderCard` dengan `{ order_number: "ORD-001", grand_total: 15300 }` → tampilkan "#ORD-001" dan "Rp 15.300"
    - `CustomerView` addToCartQuick → `cartApi.addItem` dipanggil (sudah benar)
    - `CustomerView` checkout `{ notes }` only → `orderApi.checkout({ notes })` (sudah benar)
    - `KasirView` cart lokal → tidak memanggil cartApi (Zustand only, ini benar untuk POS)
    - `StaffDashboard` filter tab `paid/processing/completed` → order muncul di kolom yang benar
  - **Write property-based tests capturing observed behaviors:**
    - For all tenant objects dengan `tenant_name` field: `TenantCard` SHALL render `tenant.tenant_name`
    - For all menu objects dengan `is_available: false`: `MenuCard` SHALL tampilkan overlay "Habis"
    - For all order objects dengan `order_number` dan `grand_total`: `OrderCard` SHALL render kedua field tersebut
    - For all non-zero price order items di KasirView: cart lokal Zustand SHALL bekerja tanpa API call
    - For all staff dashboard renders: filter status `paid/processing/completed` SHALL menampilkan order dengan benar
  - **Run tests pada kode unfixed** untuk konfirmasi baseline
  - **EXPECTED OUTCOME**: Semua preservation test LULUS pada kode unfixed
  - Mark task complete saat test ditulis, dijalankan, dan passing pada unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 3. Fix frontend-backend field mismatches dan cart flow

  - [x] 3.1 Audit grep konfirmasi — verifikasi temuan sebelum fix
    - Jalankan grep patterns berikut untuk konfirmasi final sebelum menyentuh kode:
      - `grep -r "tenant\.name\b" src/` → harus temukan `MerchantView.jsx:413`
      - `grep -r "order\.customer\b" src/` → harus temukan `Dashboard.jsx:42`
      - `grep -r "items\.map.*menu_id" src/pages/customer/Checkout.jsx` → harus temukan payload bug
      - `grep -r "cartApi\.addItem" src/components/shared/MenuCard.jsx` → harus kosong (belum ada)
    - Konfirmasi tidak ada file lain yang terlewat
    - _Requirements: 1.1, 1.7, 1.8_

  - [x] 3.2 Fix Bug 1 — `MerchantView.jsx`: `user?.tenant?.name` → `user?.tenant?.tenant_name`
    - File: `src/components/layout/shell/MerchantView.jsx` baris ~413
    - Ubah: `const tenantName = user?.tenant?.name ?? 'Toko Saya';`
    - Menjadi: `const tenantName = user?.tenant?.tenant_name ?? 'Toko Saya';`
    - Verifikasi komponen lain di file yang sama tidak terpengaruh (scope lokal)
    - _Bug_Condition: accessPattern.field == 'tenant.name' (user?.tenant?.name)_
    - _Expected_Behavior: tenant.tenant_name → "Kantin Bu Siti" (bukan undefined)_
    - _Preservation: sidebar owner/merchant tetap menampilkan nama kantin dengan benar_
    - _Requirements: 2.1_

  - [x] 3.3 Fix Bug 7 — `Dashboard.jsx`: `order.customer` → `order.user?.full_name` di toast realtime
    - File: `src/pages/staff/Dashboard.jsx` baris ~42
    - Ubah: `` toast.success(`Pesanan baru dari ${order.customer}! #${order.order_number}`, ...) ``
    - Menjadi: `` toast.success(`Pesanan baru dari ${order.user?.full_name ?? 'Pelanggan'}! #${order.order_number}`, ...) ``
    - Tambahkan fallback `'Pelanggan'` untuk graceful degradation jika relasi user tidak di-load di event payload
    - _Bug_Condition: accessPattern.field == 'o.customer?.name' → menampilkan undefined di toast_
    - _Expected_Behavior: order.user?.full_name → "Budi Santoso" (atau fallback 'Pelanggan')_
    - _Preservation: Semua fungsi dashboard lainnya (filter kanban, update status) tidak berubah_
    - _Requirements: 2.7_

  - [x] 3.4 Fix Bug 8 (part A) — `MenuCard.jsx`: Tambahkan `cartApi.addItem` call sebelum update Zustand
    - File: `src/components/shared/MenuCard.jsx`
    - Import `cartApi` dari `../../api/cart`
    - Ubah `handleAdd` menjadi async function yang:
      1. Panggil `cartApi.addItem(menu.id, 1)` — sync ke server
      2. Jika berhasil, panggil Zustand `addItem(...)` — update UI state
      3. Jika gagal, tampilkan `toast.error(err.response?.data?.message ?? 'Gagal menambah ke keranjang')`
    - Tambahkan `cartItemId` ke payload `addItem(...)` dari response API: `response.data.data?.id`
    - Import `toast` dari `react-hot-toast` jika belum ada
    - **Catatan Penting**: `MenuCard` digunakan oleh `TenantDetail.jsx` (customer flow). Jangan ubah props atau interface publik komponen
    - _Bug_Condition: accessPattern.flow == 'localCart+directCheckout' — addItem hanya update Zustand_
    - _Expected_Behavior: cartApi.addItem dipanggil sebelum Zustand update, cartItemId disimpan untuk sync delete/update_
    - _Preservation: KasirView POS menggunakan cartStore.addItem langsung (bukan MenuCard), tidak terpengaruh_
    - _Requirements: 2.8_

  - [x] 3.5 Fix Bug 8 (part B) — Update `cartStore.js`: Tambahkan `cartItemId` ke item structure
    - File: `src/store/cartStore.js`
    - Tambahkan `cartItemId` ke item object di `addItem` action (nullable, default null)
    - Struktur item baru: `{ menuId, cartItemId, name, price, photo, tenantId, tenantName, quantity }`
    - `cartItemId` diisi dari response `cartApi.addItem` di `MenuCard.jsx` (task 3.4)
    - Pastikan `updateQuantity` dan `removeItem` masih bekerja by `menuId` (untuk KasirView compatibility)
    - _Bug_Condition: Frontend tidak bisa sync updateQuantity/removeItem ke server karena tidak punya cartItemId_
    - _Expected_Behavior: cartItemId tersimpan di Zustand untuk digunakan oleh Cart.jsx saat update/delete_
    - _Preservation: KasirView POS menggunakan cart lokal — field cartItemId null tidak mengganggu alur POS_
    - _Requirements: 2.8, 2.9_

  - [x] 3.6 Fix Bug 8 (part C) — `Checkout.jsx`: Hapus `items` dan `tenant_id` dari checkout payload
    - File: `src/pages/customer/Checkout.jsx`
    - Ubah `processCheckout()`:
      - **Hapus**: `items: items.map((i) => ({ menu_id: i.menuId, quantity: i.quantity }))` dari payload
      - **Hapus**: `tenant_id: tenantId,` dari payload
      - **Pertahankan**: `const res = await orderApi.checkout({ notes });` — backend baca cart dari DB
    - Verifikasi `clearCart()` masih dipanggil setelah checkout sukses (sudah ada, jangan dihapus)
    - Verifikasi Midtrans flow tetap bekerja — hanya payload ke `orderApi.checkout` yang berubah
    - _Bug_Condition: checkout payload berisi `{ tenant_id, items: [...], notes }` — backend tolak items_
    - _Expected_Behavior: orderApi.checkout({ notes }) only — backend baca cart dari status='cart' order_
    - _Preservation: Midtrans snap.pay flow, modal pembayaran, clearCart setelah sukses — semua tetap utuh_
    - _Requirements: 2.9, 2.10_

- [x] 4. Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Field Access & Cart Flow Mismatch Fixed
  - **IMPORTANT**: Re-run test yang SAMA dari task 1 — JANGAN tulis test baru
  - Test dari task 1 mengkodekan expected behavior — passing mengkonfirmasi bug sudah fix
  - Re-run keempat test dari task 1:
    - Test 1 (Bug 1): `MerchantView` sidebar menampilkan `tenant_name` "Kantin Bu Siti" ✓
    - Test 2 (Bug 7): Toast realtime berisi nama dari `order.user?.full_name` ✓
    - Test 3 (Bug 8): `orderApi.checkout` dipanggil hanya dengan `{ notes }` ✓
    - Test 4 (Bug 8): `cartApi.addItem(menu.id, 1)` dipanggil saat klik tambah di `MenuCard` ✓
  - **EXPECTED OUTCOME**: Semua test LULUS (mengkonfirmasi bug sudah diperbaiki)
  - _Requirements: 2.1, 2.7, 2.8, 2.9_

- [x] 5. Verify preservation tests still pass
  - **Property 2: Preservation** - Non-Buggy Behavior Unchanged
  - **IMPORTANT**: Re-run test yang SAMA dari task 2 — JANGAN tulis test baru
  - Run semua preservation property tests dari task 2
  - **EXPECTED OUTCOME**: Semua preservation test masih LULUS (tidak ada regresi)
  - Konfirmasi secara khusus:
    - `TenantCard` masih render `tenant.tenant_name` dengan benar ✓
    - `MenuCard` masih tampilkan overlay "Habis" untuk `is_available: false` ✓
    - `OrderCard` masih render `order_number` dan `grand_total` ✓
    - `KasirView` POS cart lokal masih berjalan tanpa API call ✓
    - `CustomerView` addToCartQuick masih panggil `cartApi.addItem` (tidak berubah) ✓
    - `StaffDashboard` filter tab `paid/processing/completed` masih bekerja ✓
    - Alur auth (login/logout/token) tidak berubah ✓
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 6. Checkpoint — Ensure all tests pass
  - Jalankan seluruh test suite: `npm run test -- --run` atau `vitest --run`
  - Pastikan semua unit test, property-based test, dan integration test lulus
  - Verifikasi tidak ada TypeScript/ESLint error yang diperkenalkan oleh perubahan
  - Lakukan smoke test manual untuk memastikan alur utama berjalan:
    - Customer: Browse kantin → Tambah menu ke cart (cek API call) → Checkout (cek payload `{ notes }` only) → Riwayat pesanan tampil benar
    - Owner/Merchant: Login → Sidebar menampilkan nama kantin yang benar (bukan "Toko Saya")
    - Staff: Terima pesanan baru → Toast menampilkan nama pelanggan dari `user.full_name`
    - Staff: Dashboard kanban menampilkan order di kolom yang benar (`paid/processing/completed`)
  - Jika ada test yang gagal atau pertanyaan muncul, tanya user sebelum lanjut
  - Mark complete hanya jika semua test hijau dan smoke test manual berhasil

## Notes

- Semua fix dilakukan **hanya di sisi frontend** (`src/`) — tidak ada perubahan backend, schema DB, atau API endpoint
- Bug 2, 3, 4, 5, 6, 9, 10 sudah clean di seluruh codebase berdasarkan audit grep — tidak perlu fix
- Bug 1 tersisa hanya di `MerchantView.jsx` (sidebar owner); admin panel sudah pakai fallback `tenant_name ?? name`
- Bug 7 tersisa hanya di toast realtime `Dashboard.jsx` — komponen render utama sudah benar
- Bug 8 adalah yang paling kompleks: `Checkout.jsx` dan `MenuCard.jsx` perlu diubah; `CustomerView.jsx` sudah benar
- `KasirView` POS menggunakan cart Zustand lokal (bukan `MenuCard` shared component) — tidak terpengaruh oleh fix Bug 8
- Pastikan test framework sudah tersedia sebelum menulis test (cek `package.json` untuk vitest/jest)
