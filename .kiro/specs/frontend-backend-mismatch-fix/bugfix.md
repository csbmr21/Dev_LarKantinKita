# Bugfix Requirements Document

## Introduction

Terdapat 10 mismatch antara frontend (React/Zustand) dan backend (Laravel API) pada aplikasi KantinKita yang menyebabkan data tidak tampil dengan benar atau alur kerja gagal. Bug-bug ini mencakup perbedaan nama field, relasi objek yang tidak ditangani, field yang tidak ada di database, serta perbedaan fundamental pada alur cart dan status order kanban.

---

## Bug Analysis

### Current Behavior (Defect)

**Bug 1 – tenant.name vs tenant.tenant_name**

1.1 WHEN frontend mengakses `tenant.name` untuk menampilkan nama kantin THEN sistem menampilkan `undefined` karena field di DB/API adalah `tenant_name`, bukan `name`

**Bug 2 – m.emoji tidak ada di DB**

1.2 WHEN frontend mengakses `m.emoji` untuk menampilkan ikon menu THEN sistem menampilkan `undefined` karena field `emoji` tidak ada di schema database maupun response API

**Bug 3 – m.image_url vs m.photo_url**

1.3 WHEN frontend mengakses `m.image_url` untuk menampilkan gambar menu THEN sistem menampilkan gambar kosong/broken karena field di DB/API adalah `photo_url`, bukan `image_url`

**Bug 4 – m.category sebagai string vs objek relasi**

1.4 WHEN frontend memperlakukan `m.category` secara langsung sebagai string nama kategori THEN sistem menampilkan `[object Object]` atau `undefined` karena `m.category` adalah objek relasi dan nama kategori ada di `m.category.name`

**Bug 5 – m.stock tidak ada di DB**

1.5 WHEN frontend mengakses `m.stock` untuk menampilkan jumlah stok menu THEN sistem menampilkan `undefined` karena field `stock` tidak ada di schema database; ketersediaan menu direpresentasikan oleh field `is_available`

**Bug 6 – order_code vs order_number**

1.6 WHEN frontend mengakses `order.order_code` untuk menampilkan kode pesanan THEN sistem menampilkan `undefined` karena field di DB/API adalah `order_number`, bukan `order_code`

**Bug 7 – o.customer?.name vs o.user?.full_name**

1.7 WHEN frontend mengakses `o.customer?.name` untuk menampilkan nama pelanggan pada order THEN sistem menampilkan `undefined` karena relasi di backend adalah `user` (bukan `customer`) dan field nama adalah `full_name` (bukan `name`)

**Bug 8 – Cart flow mismatch**

1.8 WHEN frontend menyimpan cart secara lokal via Zustand dan mengirim `items` array langsung ke endpoint checkout (`POST /api/checkout`) THEN backend mengembalikan error atau membuat order duplikat karena backend mengelola cart sebagai DB records (`status='cart'`); endpoint checkout membaca cart dari database dan tidak menerima `items` di request body

**Bug 9 – KasirView kanban status mismatch**

1.9 WHEN KasirView menampilkan kolom kanban dengan status `accepted`, `cooking`, dan `ready` THEN sistem tidak menampilkan order apapun di kolom tersebut karena DB hanya mengenal status `paid`, `processing`, dan `completed`

**Bug 10 – o.total vs grand_total**

1.10 WHEN frontend mengakses `o.total` untuk menampilkan total harga order pelanggan THEN sistem menampilkan `undefined` karena field di DB/API adalah `grand_total`, bukan `total`

---

### Expected Behavior (Correct)

**Bug 1 – tenant.name vs tenant.tenant_name**

2.1 WHEN frontend perlu menampilkan nama kantin THEN sistem SHALL mengakses `tenant.tenant_name` sesuai field yang ada di response API

**Bug 2 – m.emoji tidak ada di DB**

2.2 WHEN frontend perlu menampilkan ikon menu THEN sistem SHALL menggunakan `m.photo_url` sebagai gambar utama dan menampilkan emoji fallback berbasis kategori/nama menu bila `photo_url` kosong (logika derivasi sudah ada di `getMenuEmoji()`)

**Bug 3 – m.image_url vs m.photo_url**

2.3 WHEN frontend perlu menampilkan gambar menu THEN sistem SHALL mengakses `m.photo_url` sesuai field yang ada di response API dan schema database

**Bug 4 – m.category sebagai string vs objek relasi**

2.4 WHEN frontend perlu menampilkan nama kategori menu THEN sistem SHALL mengakses `m.category?.name` karena `category` adalah objek relasi yang di-load via eager loading di backend

**Bug 5 – m.stock tidak ada di DB**

2.5 WHEN frontend perlu menampilkan ketersediaan menu THEN sistem SHALL menggunakan field `m.is_available` (boolean) sebagai indikator ketersediaan, dan SHALL NOT menampilkan angka stok karena field tersebut tidak ada di schema

**Bug 6 – order_code vs order_number**

2.6 WHEN frontend perlu menampilkan kode/nomor pesanan THEN sistem SHALL mengakses `order.order_number` sesuai field yang ada di DB dan response API

**Bug 7 – o.customer?.name vs o.user?.full_name**

2.7 WHEN frontend perlu menampilkan nama pelanggan pada order THEN sistem SHALL mengakses `o.user?.full_name` karena relasi di backend adalah `user` dan field nama lengkap adalah `full_name`

**Bug 8 – Cart flow mismatch**

2.8 WHEN pelanggan menambah item ke keranjang THEN sistem SHALL memanggil API `POST /api/cart/add` dengan `{ menu_id, quantity }` untuk menyimpan item ke DB

2.9 WHEN pelanggan melanjutkan ke checkout THEN sistem SHALL memanggil API `POST /api/checkout` dengan hanya `{ notes }` (tanpa `items`), karena backend membaca cart dari DB berdasarkan user yang sedang login

2.10 WHEN checkout selesai THEN sistem SHALL menghapus state cart lokal (Zustand) agar sinkron dengan state DB

**Bug 9 – KasirView kanban status mismatch**

2.11 WHEN KasirView menampilkan kanban order THEN sistem SHALL menggunakan kolom `paid`, `processing`, dan `completed` yang sesuai dengan nilai status di DB

2.12 WHEN staff mengubah status order di kanban THEN sistem SHALL mengirim transisi status yang valid sesuai aturan backend: `paid → processing → completed`

**Bug 10 – o.total vs grand_total**

2.13 WHEN frontend perlu menampilkan total harga yang harus dibayar pelanggan THEN sistem SHALL mengakses `order.grand_total` sesuai field yang ada di DB dan response API

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN tenant yang aktif dan terbuka ditampilkan di halaman Home THEN sistem SHALL CONTINUE TO menampilkan daftar kantin dengan foto, badge status buka/tutup, alamat, dan minimum order dengan benar

3.2 WHEN pelanggan membuka halaman detail tenant THEN sistem SHALL CONTINUE TO menampilkan informasi kantin (nama, foto, alamat, jam buka, min. order) dan daftar menu dengan filter kategori yang berfungsi

3.3 WHEN menu dengan `is_available = false` ditampilkan THEN sistem SHALL CONTINUE TO menampilkan overlay "Habis" dan menonaktifkan tombol tambah ke keranjang

3.4 WHEN staff melakukan update status order melalui kanban THEN sistem SHALL CONTINUE TO memanggil endpoint `PATCH /api/staff/orders/{id}/status` dengan payload `{ status }` yang valid

3.5 WHEN order berhasil dibuat THEN sistem SHALL CONTINUE TO mengirim notifikasi ke tenant dan menyimpan order dengan `order_number` yang di-generate oleh backend

3.6 WHEN pelanggan melihat riwayat pesanan THEN sistem SHALL CONTINUE TO menampilkan daftar order dengan status yang benar dan pagination yang berfungsi

3.7 WHEN staff POS (KasirView) memproses transaksi langsung THEN sistem SHALL CONTINUE TO menampilkan grid menu, keranjang lokal, dan tombol proses pembayaran dengan benar

3.8 WHEN admin melihat daftar tenant di panel admin THEN sistem SHALL CONTINUE TO menampilkan `tenant_name` (yang sudah menggunakan fallback `tenant_name ?? name`) tanpa perubahan pada komponen admin

3.9 WHEN autentikasi user dilakukan THEN sistem SHALL CONTINUE TO menyimpan token dan data user di Zustand auth store tanpa perubahan alur login/logout

3.10 WHEN cart lokal (Zustand) digunakan oleh KasirView POS THEN sistem SHALL CONTINUE TO beroperasi dengan state lokal karena POS staff tidak menggunakan cart API pelanggan
