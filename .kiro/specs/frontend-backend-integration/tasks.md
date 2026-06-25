# Implementation Plan: Frontend-Backend Integration Fix — KantinKita

## Overview

Perbaikan integrasi frontend React dengan backend Laravel. Fokus pada 9 file yang memiliki mismatch URL path, method yang hilang, response parsing yang salah, dan middleware yang belum diterapkan. Urutan kerja: tulis exploration tests (harus fail sebelum fix) → tulis preservation tests → jalankan critical fixes → high fixes → medium fixes → verifikasi semua tests pass.

## Tasks

- [ ] 1. Setup test infrastructure dan tulis exploration tests (harus FAIL sebelum fix)
  - [x] 1.1 Setup Vitest test environment dan mock axios
    - Install fast-check jika belum ada: `npm install --save-dev fast-check`
    - Buat file `src/api/__tests__/setup.js` dengan mock axios global
    - Verifikasi vitest dapat menjalankan test: `npx vitest --run`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1_

  - [-] 1.2 Tulis exploration tests untuk cart.js (harus FAIL)
    - Buat `src/api/__tests__/cart.exploration.test.js`
    - Test: `getCart` mengirim ke `/api/v1/customer/cart` — saat ini path salah, harus FAIL
    - Test: `addItem` mengirim POST ke `/api/v1/customer/cart/add` — harus FAIL
    - Test: `clearCart` mengirim DELETE ke `/api/v1/customer/cart/clear` — harus FAIL
    - Test: `updateItem` mengirim PUT ke `/api/v1/customer/cart/{id}` — harus FAIL
    - Test: `removeItem` mengirim DELETE ke `/api/v1/customer/cart/{id}` — harus FAIL
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [-] 1.3 Tulis exploration tests untuk auth.js, useAuth.js, useOrders.js (harus FAIL)
    - Buat `src/api/__tests__/auth.exploration.test.js`
    - Test: `authApi.setupProfile` ada sebagai method — harus FAIL (method belum ada)
    - Buat `src/hooks/__tests__/useAuth.exploration.test.js`
    - Test: `hasRole('owner')` dengan `user.role = { slug: 'owner' }` → true — harus FAIL
    - Test: `getDashboardPath()` dengan `user.role = { slug: 'owner' }` → `/owner` — harus FAIL
    - Buat `src/hooks/__tests__/useOrders.exploration.test.js`
    - Test: `useCustomerOrders` query fn mengembalikan `r.data.data` bukan `r.data` — harus FAIL
    - _Requirements: 2.1, 3.1, 3.2, 3.6, 4.2_

  - [-] 1.4 Tulis exploration tests untuk report.js dan admin.js (harus FAIL)
    - Buat `src/api/__tests__/report.exploration.test.js`
    - Test: `getAdminReport` mengirim ke `/api/v1/admin/reports/aggregate` — harus FAIL
    - Test: `reportApi.getSubscriptionInvoices` ada sebagai method — harus FAIL
    - Buat `src/api/__tests__/admin.exploration.test.js`
    - Test: `adminApi.exportAuditLogs` ada sebagai method — harus FAIL
    - Test: `adminApi.getAdminReportAggregate` ada sebagai method — harus FAIL
    - _Requirements: 5.1, 5.2, 5.4, 5.6_

  - [ ] 1.5 Tulis exploration tests untuk tenant.js dan useImpersonation.js (harus FAIL)
    - Buat `src/api/__tests__/tenant.exploration.test.js`
    - Test: `updateMenu` dengan FormData menyertakan field `_method = 'PUT'` — harus FAIL
    - Test: `updateMenu` dengan FormData mengirim via POST — harus FAIL (method spoofing belum ada)
    - Buat `src/hooks/__tests__/useImpersonation.exploration.test.js`
    - Test: `useImpersonation` dapat diimport dari `src/hooks/useImpersonation.js` — harus FAIL (file belum ada)
    - _Requirements: 7.1, 7.2, 8.3_

- [ ] 2. Tulis preservation tests (harus PASS sebelum dan sesudah fix)
  - [~] 2.1 Preservation tests untuk auth.js existing methods
    - Buat `src/api/__tests__/auth.preservation.test.js`
    - Test: `authApi.login` mengirim POST ke `/api/v1/auth/login`
    - Test: `authApi.logout` mengirim POST ke `/api/v1/auth/logout`
    - Test: `authApi.me` mengirim GET ke `/api/v1/auth/me`
    - Test: `authApi.updateProfile` mengirim POST ke `/api/v1/auth/profile`
    - _Requirements: 2.5_

  - [~] 2.2 Preservation tests untuk useAuth.js existing behavior
    - Buat `src/hooks/__tests__/useAuth.preservation.test.js`
    - Test: `hasRole('owner')` dengan `user.role = 'owner'` (string) → true
    - Test: `hasRole('staff')` dengan `user.role = 'owner'` → false
    - Test: `getDashboardPath()` dengan string role → path yang benar
    - _Requirements: 3.1, 3.3, 3.6_

  - [~] 2.3 Preservation tests untuk tenant.js existing methods
    - Buat `src/api/__tests__/tenant.preservation.test.js`
    - Test: `updateMenu` dengan plain object mengirim PUT (bukan POST)
    - Test: `createMenu` mengirim POST ke `/api/v1/staff/menus`
    - Test: `deleteMenu` mengirim DELETE ke `/api/v1/staff/menus/{id}`
    - _Requirements: 7.3_

- [ ] 3. Critical fixes: cart.js dan auth.js
  - [~] 3.1 Fix semua 5 URL path di src/api/cart.js
    - Ubah `getCart`: `/api/v1/cart` → `/api/v1/customer/cart`
    - Ubah `addItem`: POST `/api/v1/cart` → POST `/api/v1/customer/cart/add`
    - Ubah `updateItem`: PUT `/api/v1/cart/${id}` → PUT `/api/v1/customer/cart/${id}`
    - Ubah `removeItem`: DELETE `/api/v1/cart/${id}` → DELETE `/api/v1/customer/cart/${id}`
    - Ubah `clearCart`: DELETE `/api/v1/cart` → DELETE `/api/v1/customer/cart/clear`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [~] 3.2 Tulis property tests untuk cart.js URL correctness
    - **Property 1: Cart URL Correctness** — untuk semua method cartApi, URL selalu mengandung `/customer/`
    - **Property 2: Cart Add Path** — addItem(menuId, qty) selalu POST ke `/api/v1/customer/cart/add`
    - **Property 3: Cart Clear Path** — clearCart() selalu DELETE ke `/api/v1/customer/cart/clear`
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
    - Buat `src/api/__tests__/cart.property.test.js` menggunakan fast-check

  - [~] 3.3 Tambah method setupProfile di src/api/auth.js
    - Tambahkan `setupProfile: (data) => api.put('/api/v1/auth/setup-profile', data)`
    - Pastikan method ditempatkan setelah `changePassword` dan sebelum penutup object
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [~] 3.4 Tulis property tests untuk auth.js setupProfile
    - **Property 4: setupProfile Request Contract** — setupProfile(data) selalu PUT ke `/api/v1/auth/setup-profile` tanpa modifikasi data
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5**
    - Buat `src/api/__tests__/auth.property.test.js` menggunakan fast-check

- [ ] 4. High fixes: useAuth.js, useOrders.js, report.js, routes/api.php
  - [~] 4.1 Fix hasRole dan getDashboardPath di src/hooks/useAuth.js
    - Ubah `hasRole`: tambahkan `const roleValue = user?.role?.slug ?? user?.role;` dan gunakan `roleValue` di `roles.includes(...)`
    - Ubah `getDashboardPath`: tambahkan `const roleValue = user?.role?.slug ?? user?.role;` dan gunakan `ROLE_DASHBOARDS[roleValue]`
    - Ubah `handleLogin`: pastikan `const path = ROLE_DASHBOARDS[userData.role?.slug ?? userData.role] ?? '/'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [~] 4.2 Tulis property tests untuk useAuth.js role normalization
    - **Property 5: hasRole Polymorphic Safety** — hasRole bekerja untuk string role maupun object role `{ slug, name }`
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Buat `src/hooks/__tests__/useAuth.property.test.js` menggunakan fast-check

  - [~] 4.3 Fix useCustomerOrders response parsing di src/hooks/useOrders.js
    - Ubah baris `queryFn`: `.then((r) => r.data)` → `.then((r) => r.data.data)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [~] 4.4 Tulis property tests untuk useOrders.js data shape
    - **Property 6: Customer Orders Data Shape** — useCustomerOrders mengembalikan paginated structure dengan `data`, `current_page`, `total`, `last_page`, `per_page`
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    - Buat `src/hooks/__tests__/useOrders.property.test.js` menggunakan fast-check

  - [~] 4.5 Fix getAdminReport path dan tambah getSubscriptionInvoices di src/api/report.js
    - Ubah `getAdminReport`: `/api/v1/admin/reports` → `/api/v1/admin/reports/aggregate`
    - Tambahkan `getSubscriptionInvoices: () => api.get('/api/v1/owner/subscription/invoices')`
    - _Requirements: 5.1, 5.2, 5.3_

  - [~] 4.6 Tulis property tests untuk report.js API contracts
    - **Property 7: Admin Report Path Correctness** — getAdminReport(params) selalu mengirim ke `/api/v1/admin/reports/aggregate`
    - **Property 8: Subscription Invoices API Contract** — getSubscriptionInvoices() selalu GET ke `/api/v1/owner/subscription/invoices`
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Buat `src/api/__tests__/report.property.test.js` menggunakan fast-check

  - [~] 4.7 Tambah subscription.check middleware ke owner dan staff group di kantinkita-api/routes/api.php
    - Ubah owner middleware group: `['role:owner', 'tenant.active']` → `['role:owner', 'tenant.active', 'subscription.check']`
    - Ubah staff middleware group: `['role:staff', 'tenant.active']` → `['role:staff', 'tenant.active', 'subscription.check']`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5. Medium fixes: admin.js, tenant.js, useImpersonation.js
  - [~] 5.1 Tambah exportAuditLogs dan getAdminReportAggregate di src/api/admin.js
    - Tambahkan di bagian "Logs & Monitor":
      ```js
      exportAuditLogs: (params = {}) => api.get('/api/v1/admin/audit-logs/export', { params, responseType: 'blob' }),
      ```
    - Tambahkan di akhir object sebelum penutup:
      ```js
      getAdminReportAggregate: (params = {}) => api.get('/api/v1/admin/reports/aggregate', { params }),
      ```
    - _Requirements: 5.4, 5.5, 5.6, 5.7_

  - [~] 5.2 Tulis property tests untuk admin.js missing endpoints
    - **Property 9: Admin Audit Export API Contract** — exportAuditLogs(params) selalu GET ke `/api/v1/admin/audit-logs/export` dengan `responseType: 'blob'`
    - **Property 10: Admin Report Aggregate API Contract** — getAdminReportAggregate(params) selalu GET ke `/api/v1/admin/reports/aggregate`
    - **Validates: Requirements 5.4, 5.5, 5.6, 5.7**
    - Buat `src/api/__tests__/admin.property.test.js` menggunakan fast-check

  - [~] 5.3 Fix method spoofing FormData di src/api/tenant.js
    - Di dalam blok `if (data instanceof FormData)`, tambahkan `data.append('_method', 'PUT');` sebelum `return api.post(...)`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [~] 5.4 Tulis property tests untuk tenant.js method spoofing
    - **Property 11: Method Spoofing FormData** — updateMenu(id, FormData) selalu append `_method='PUT'` dan POST; updateMenu(id, plainObj) selalu PUT
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
    - Buat `src/api/__tests__/tenant.property.test.js` menggunakan fast-check

  - [~] 5.5 Buat file baru src/hooks/useImpersonation.js
    - Ekspor `useImpersonation()` hook
    - Import `useAuthStore` dari `../store/authStore`
    - Implement `handleStopImpersonating`: panggil `authApi.logout()` (dynamic import), tangkap error secara silent, lalu panggil `stopImpersonating()` dari store di blok `finally`
    - Return `{ isImpersonating, stopImpersonating: handleStopImpersonating }`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [~] 5.6 Tulis unit tests untuk useImpersonation.js
    - Buat `src/hooks/__tests__/useImpersonation.test.js`
    - Test: `stopImpersonating()` memanggil `authApi.logout()` sebelum store `stopImpersonating()`
    - Test: jika `authApi.logout()` throw error, store `stopImpersonating()` tetap dipanggil
    - Test: `isImpersonating` terekspos dari return hook
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [~] 6. Verifikasi exploration tests sekarang PASS
  - Jalankan semua exploration test files: `npx vitest --run src/api/__tests__/*.exploration.test.js src/hooks/__tests__/*.exploration.test.js`
  - Semua 5 file exploration test harus hijau setelah fixes
  - Jika ada yang masih FAIL, periksa kembali implementasi task 3–5

- [~] 7. Verifikasi preservation tests tetap PASS
  - Jalankan semua preservation test files: `npx vitest --run src/api/__tests__/*.preservation.test.js src/hooks/__tests__/*.preservation.test.js`
  - Semua preservation test harus tetap hijau (tidak ada regresi)

- [~] 8. Final checkpoint — Ensure all tests pass
  - Jalankan full test suite: `npx vitest --run`
  - Pastikan tidak ada test yang FAIL
  - Pastikan property tests (fast-check) pass dengan minimal 100 runs
  - Tanyakan ke user jika ada pertanyaan sebelum menutup spec ini

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Exploration tests sengaja ditulis untuk FAIL terlebih dahulu — ini normal dan bukan bug
- Preservation tests harus PASS sepanjang waktu (sebelum dan sesudah fix)
- Property tests menggunakan `fast-check` untuk verifikasi invariant secara generatif
- Setiap task mereferensikan requirement spesifik untuk traceabilitas
- Middleware `subscription.check` di backend sudah bypass GET/HEAD/OPTIONS secara internal — tidak perlu pisahkan route
- `_method = 'PUT'` harus di-append sebelum `api.post()` dipanggil
- `useImpersonation.js` menggunakan dynamic import untuk `authApi` agar tidak ada circular dependency

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 3, "tasks": ["3.1", "3.3", "4.3", "4.5", "4.7", "5.1", "5.3", "5.5"] },
    { "id": 4, "tasks": ["3.2", "3.4", "4.1", "4.6"] },
    { "id": 5, "tasks": ["4.2", "4.4", "5.2", "5.4", "5.6"] }
  ]
}
```
