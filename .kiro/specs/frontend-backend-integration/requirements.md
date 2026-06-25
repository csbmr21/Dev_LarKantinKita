# Requirements Document

## Introduction

Dokumen ini mendefinisikan requirements fungsional untuk memperbaiki integrasi antara frontend React (Vite) dan backend Laravel di proyek KantinKita. Requirements diturunkan dari design document yang telah disetujui, mencakup 14 correctness properties yang dikelompokkan ke dalam 6 domain: Cart API integration, Auth API integration, Response parsing, Admin/Owner API completeness, Backend middleware, dan Miscellaneous fixes.

Fokus perbaikan adalah pada mismatch URL path, method yang hilang di frontend, response parsing yang salah, dan middleware backend yang belum diapply — bukan pada perubahan logika bisnis.

---

## Glossary

- **Cart_API**: Modul `src/api/cart.js` di frontend yang mengelola semua request ke endpoint cart.
- **Auth_API**: Modul `src/api/auth.js` di frontend yang mengelola request autentikasi.
- **Admin_API**: Modul `src/api/admin.js` di frontend untuk endpoint admin.
- **Report_API**: Modul `src/api/report.js` di frontend untuk endpoint laporan.
- **Tenant_API**: Modul `src/api/tenant.js` di frontend untuk operasi tenant/staff.
- **useAuth**: Custom hook `src/hooks/useAuth.js` yang menyediakan `hasRole()` dan `getDashboardPath()`.
- **useAuthStore**: Zustand store `src/store/authStore.js` yang menyimpan state autentikasi.
- **useCustomerOrders**: Hook di `src/hooks/useOrders.js` yang mengelola daftar order customer.
- **Subscription_Middleware**: `CheckSubscriptionStatus` middleware di backend Laravel.
- **Method_Spoofing**: Teknik mengirim field `_method` di FormData agar backend Laravel memproses request POST sebagai PUT/PATCH.
- **Impersonation**: Fitur admin untuk login sebagai user lain menggunakan token sementara.
- **Role_Object**: Object `{ slug: string, name: string }` yang merepresentasikan role user.
- **Paginated_Response**: Format standar response backend untuk data terhalaman dengan properti `data`, `current_page`, `total`, `last_page`, `per_page`.
- **SUBSCRIPTION_REQUIRED**: Kode error `403` khusus yang dikembalikan backend ketika tenant tidak memiliki langganan aktif.

---

## Requirements

### Requirement 1: Cart API URL Path Correctness

**User Story:** Sebagai customer, saya ingin bisa melihat dan mengelola keranjang belanja saya, sehingga saya dapat menambah, mengubah, dan menghapus item sebelum checkout.

#### Acceptance Criteria

1. WHEN `cartApi.getCart()` dipanggil, THE Cart_API SHALL mengirim GET request ke `/api/v1/customer/cart`.
2. WHEN `cartApi.addItem(menuId, quantity)` dipanggil, THE Cart_API SHALL mengirim POST request ke `/api/v1/customer/cart/add` dengan body `{ menu_id: menuId, quantity }`.
3. WHEN `cartApi.clearCart()` dipanggil, THE Cart_API SHALL mengirim DELETE request ke `/api/v1/customer/cart/clear`.
4. WHEN `cartApi.updateItem(cartItemId, quantity)` dipanggil, THE Cart_API SHALL mengirim PUT request ke `/api/v1/customer/cart/{cartItemId}` dengan body `{ quantity }`.
5. WHEN `cartApi.removeItem(cartItemId)` dipanggil, THE Cart_API SHALL mengirim DELETE request ke `/api/v1/customer/cart/{cartItemId}`.
6. THE Cart_API SHALL memastikan semua endpoint cart mengandung prefix path `/customer/` sebagai bagian dari URL.

---

### Requirement 2: Auth API — Setup Profile Method

**User Story:** Sebagai user yang mendaftar via Google OAuth, saya ingin melengkapi profil saya setelah verifikasi OTP, sehingga saya bisa menggunakan aplikasi dengan role yang sesuai.

#### Acceptance Criteria

1. THE Auth_API SHALL menyediakan method `setupProfile(data)` yang dapat dipanggil.
2. WHEN `authApi.setupProfile(data)` dipanggil, THE Auth_API SHALL mengirim PUT request ke `/api/v1/auth/setup-profile` dengan `data` sebagai request body.
3. THE Auth_API SHALL meneruskan field `username`, `full_name`, `email`, `role`, `password`, dan `password_confirmation` dalam request body ke `setupProfile`.
4. IF `data.role === "owner"`, THEN THE Auth_API SHALL meneruskan field `tenant_name` dalam request body.
5. WHEN backend merespons dengan `profile_completed: true`, THE Auth_API SHALL mengembalikan response tersebut ke caller tanpa modifikasi.

---

### Requirement 3: Auth Hook — hasRole dan Role Normalization Consistency

**User Story:** Sebagai developer, saya ingin fungsi pengecekan role bekerja dengan benar untuk semua format data role dari backend, sehingga tidak ada akses yang ditolak secara salah.

#### Acceptance Criteria

1. WHEN `useAuth().hasRole('owner')` dipanggil dan `user.role` bernilai string `"owner"`, THE useAuth SHALL mengembalikan `true`.
2. WHEN `useAuth().hasRole('owner')` dipanggil dan `user.role` bernilai object `{ slug: "owner", name: "Owner" }`, THE useAuth SHALL mengembalikan `true`.
3. WHEN `useAuth().hasRole('owner')` dipanggil dan `user.role` bukan `"owner"` dalam format apapun, THE useAuth SHALL mengembalikan `false`.
4. THE useAuth SHALL menormalisasi nilai role dengan menggunakan `user.role.slug` jika role berupa object, atau `user.role` jika berupa string.
5. WHEN `useAuthStore.getRole()`, `useAuthStore.isRole()`, dan `useAuth().hasRole()` dipanggil untuk user yang sama, THE System SHALL menghasilkan hasil yang konsisten satu sama lain.
6. WHEN `useAuth().getDashboardPath()` dipanggil, THE useAuth SHALL menggunakan normalisasi role yang sama untuk menentukan path dashboard.

---

### Requirement 4: Response Parsing — useCustomerOrders

**User Story:** Sebagai customer, saya ingin melihat daftar pesanan saya dengan pagination, sehingga saya dapat menelusuri riwayat transaksi.

#### Acceptance Criteria

1. WHEN `useCustomerOrders()` berhasil memuat data, THE useCustomerOrders SHALL mengembalikan objek Paginated_Response dengan properti `data` (array), `current_page`, `total`, `last_page`, dan `per_page`.
2. THE useCustomerOrders SHALL mengakses `r.data.data` dari response axios (bukan `r.data`) untuk mendapatkan struktur paginated yang benar.
3. IF backend mengembalikan response dengan nested `data.data`, THEN THE useCustomerOrders SHALL mengekstrak layer `data` dalam sehingga caller menerima objek pagination langsung.
4. THE useCustomerOrders SHALL memastikan properti `data` dalam response yang dikembalikan adalah Array.

---

### Requirement 5: Admin/Owner API Completeness

**User Story:** Sebagai admin dan owner, saya ingin semua endpoint backend tersedia di layer API frontend, sehingga saya dapat mengakses semua fitur yang disediakan backend.

#### Acceptance Criteria

1. WHEN `reportApi.getAdminReport(params)` dipanggil, THE Report_API SHALL mengirim GET request ke `/api/v1/admin/reports/aggregate` (bukan `/api/v1/admin/reports`).
2. THE Report_API SHALL menyediakan method `getSubscriptionInvoices()` yang dapat dipanggil.
3. WHEN `reportApi.getSubscriptionInvoices()` dipanggil, THE Report_API SHALL mengirim GET request ke `/api/v1/owner/subscription/invoices`.
4. THE Admin_API SHALL menyediakan method `exportAuditLogs(params)` yang dapat dipanggil.
5. WHEN `adminApi.exportAuditLogs(params)` dipanggil, THE Admin_API SHALL mengirim GET request ke `/api/v1/admin/audit-logs/export` dengan `responseType: 'blob'`.
6. THE Admin_API SHALL menyediakan method `getAdminReportAggregate(params)` yang dapat dipanggil.
7. WHEN `adminApi.getAdminReportAggregate(params)` dipanggil, THE Admin_API SHALL mengirim GET request ke `/api/v1/admin/reports/aggregate`.

---

### Requirement 6: Backend Middleware — Subscription Check

**User Story:** Sebagai pemilik platform, saya ingin operasi write milik owner dan staff diblokir ketika masa trial habis dan tidak ada langganan aktif, sehingga fitur premium terlindungi.

#### Acceptance Criteria

1. WHEN request POST, PUT, DELETE, atau PATCH dikirim ke `/api/v1/owner/*` oleh tenant dengan trial expired dan tanpa subscription aktif, THE Subscription_Middleware SHALL mengembalikan HTTP 403 dengan body `{ code: "SUBSCRIPTION_REQUIRED" }`.
2. WHEN request POST, PUT, DELETE, atau PATCH dikirim ke `/api/v1/staff/*` oleh tenant dengan trial expired dan tanpa subscription aktif, THE Subscription_Middleware SHALL mengembalikan HTTP 403 dengan body `{ code: "SUBSCRIPTION_REQUIRED" }`.
3. WHEN request GET atau HEAD dikirim ke `/api/v1/owner/*` atau `/api/v1/staff/*`, THE Subscription_Middleware SHALL mengizinkan request untuk diproses tanpa mengecek status subscription.
4. WHILE tenant memiliki `trial_ends_at` yang belum lewat, THE Subscription_Middleware SHALL mengizinkan semua request untuk diproses.
5. THE routes/api.php SHALL menerapkan middleware `subscription.check` pada group route `owner` dan group route `staff`.

---

### Requirement 7: Method Spoofing untuk FormData Update

**User Story:** Sebagai staff, saya ingin bisa mengupdate data menu termasuk gambar melalui upload FormData, sehingga perubahan menu tersimpan dengan benar di backend.

#### Acceptance Criteria

1. WHEN `tenantApi.updateMenu(id, data)` dipanggil dengan `data` berupa instance `FormData`, THE Tenant_API SHALL menambahkan field `_method` dengan nilai `'PUT'` ke FormData tersebut.
2. WHEN `tenantApi.updateMenu(id, formData)` dipanggil dengan FormData, THE Tenant_API SHALL mengirim request menggunakan method POST ke `/api/v1/staff/menus/{id}`.
3. WHEN `tenantApi.updateMenu(id, data)` dipanggil dengan `data` bukan FormData, THE Tenant_API SHALL mengirim request menggunakan method PUT ke `/api/v1/staff/menus/{id}`.
4. THE Tenant_API SHALL memastikan field `_method = 'PUT'` ditambahkan sebelum request dikirim sehingga backend Laravel dapat memproses method spoofing dengan benar.

---

### Requirement 8: Impersonation Token Revocation

**User Story:** Sebagai admin, saya ingin token impersonation di-revoke ketika sesi impersonasi dihentikan, sehingga tidak ada token orphan yang dapat disalahgunakan.

#### Acceptance Criteria

1. WHEN admin menghentikan sesi impersonasi, THE System SHALL memanggil `authApi.logout()` untuk me-revoke token impersonated user di backend sebelum mengembalikan state ke admin.
2. IF panggilan `authApi.logout()` gagal saat stop impersonating, THEN THE System SHALL tetap melanjutkan proses `stopImpersonating()` tanpa menampilkan error ke user.
3. THE System SHALL menyediakan hook `useImpersonation` sebagai abstraksi untuk operasi impersonasi yang menangani revocation token.
4. WHEN `useImpersonation().stopImpersonating()` dipanggil, THE System SHALL mengembalikan state autentikasi ke state admin semula setelah revocation token selesai.

