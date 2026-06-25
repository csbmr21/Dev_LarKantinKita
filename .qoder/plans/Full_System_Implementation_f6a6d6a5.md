
# Full System Implementation Plan

## Phase 0: Critical Bug Fixes (Foundation)

These block real functionality and must be fixed first.

### Task 0.1: Fix tenant_name field mismatch
**Files:** `src/components/layout/shell/MerchantView.jsx`, `src/components/layout/shell/KasirView.jsx`

Both `SettingsPage` components send `name` but `TenantController.updateMyTenant` validates `tenant_name`. Both also read `tenant.name` instead of `tenant.tenant_name`.

- **MerchantView.jsx** (line 491): Change `form` state from `{ name, address, description, phone }` to `{ tenant_name, address, description, phone }`. Update `useEffect` to read `tenant.tenant_name`. Update input bindings and the `update(form)` call.
- **KasirView.jsx** (line 1028-1040): Same fix — `name` to `tenant_name` in state, `useEffect`, and input.

### Task 0.2: Set Sanctum token expiration
**File:** `kantinkita-api/config/sanctum.php`

Change `'expiration' => null` to `'expiration' => 2880` (48 hours).

### Task 0.3: Add rate limiting to payment webhook
**File:** `kantinkita-api/routes/api.php` (line 47)

Wrap payment notification route with `throttle:10,1` to prevent webhook flooding.

---

## Phase 1: API Layer Hardening (Backend)

### Task 1.1: Fix ReportController to return structured chart data
**File:** `kantinkita-api/app/Http/Controllers/Api/Owner/ReportController.php`

The `index()` method must return `daily_chart` array with `{ date, revenue, orders }` objects (from `ReportService::getSalesReport()`). Verify the response shape matches what the frontend `ReportsSubpage` expects: `summary.total_revenue`, `summary.total_orders`, `summary.avg_order_value`, plus `daily_chart[]` and `top_menus[]`.

### Task 1.2: Add staff-level report endpoint with chart granularity
**File:** `kantinkita-api/routes/api.php` (line 97), `Staff/ReportController` or reuse `Owner/ReportController`

The staff route `GET /staff/reports` currently maps to `Owner\ReportController::index`. Verify it returns the same `daily_chart` and `top_menus` data that the kasir `ReportsSubpage` needs to replace its hardcoded `[35,65,45,90,55,80,40]` chart and static top menus.

### Task 1.3: Add subscription current-plan endpoint
**File:** `kantinkita-api/app/Http/Controllers/Api/Owner/SubscriptionController.php`

The `SubscriptionPage` in MerchantView needs to display the tenant's current plan. Verify `GET /owner/subscription` returns current plan info (name, status, expiry) plus available plans. If not, add a `current()` method.

### Task 1.4: Add finance summary endpoint
**File:** `kantinkita-api/app/Http/Controllers/Api/Owner/ReportController.php` or new `FinanceController`

Add `GET /owner/finance/summary` returning: total revenue, platform fee, net income, and withdrawal history. The `ReportService::getSalesReport()` already computes revenue; extend it with fee calculations. If withdrawals aren't modeled yet, return computed revenue data and mark withdrawal history as a future feature.

### Task 1.5: Validate order status transitions in Staff OrderController
**File:** `kantinkita-api/app/Http/Controllers/Api/Staff/OrderController.php`

In `updateStatus()` and `bulkUpdateStatus()`, add validation using `Order::isValidTransition($order->status, $newStatus)` before updating. Return 422 if invalid.

---

## Phase 2: CustomerView Decomposition + Responsive Design

### Task 2.1: Create missing ProfileScreen sub-component
**File:** `src/components/layout/shell/customer/ProfileScreen.jsx` (new)

Extract the ProfileScreen inline code (currently around line 950-1200 of `CustomerView.jsx`) into its own file. Import `useAuthStore`, logout handler. Use `kk-profile-*` CSS classes from `kantinkita-ui.css`.

### Task 2.2: Create MenuDetailScreen and TenantMenuScreen sub-components
**Files:** `src/components/layout/shell/customer/MenuDetailScreen.jsx` (new), `src/components/layout/shell/customer/TenantMenuScreen.jsx` (new)

Extract `MenuDetailScreen` (lines 73-200) and `TenantMenuScreen` (the screen that shows when a tenant is selected) from `CustomerView.jsx`.

### Task 2.3: Rewrite CustomerView.jsx as a thin shell
**File:** `src/components/layout/shell/CustomerView.jsx`

Rewrite to import all sub-components from `./customer/` directory:
```
HomeScreen, TenantMenuScreen, MenuDetailScreen, CartScreen, OrdersScreen, TrackingScreen, ProfileScreen
```
Use `React.lazy()` for non-critical screens (ProfileScreen, TrackingScreen) following the AdminView pattern. The shell manages `screen` state and renders the active screen.

### Task 2.4: Ensure customer responsive design
- Mobile: `kk-customer-shell` max-width 480px with bottom nav (already implemented in CSS)
- Desktop (>=768px): max-width 1200px with sidebar cart + top nav tabs (CSS exists at `kantinkita-ui.css` lines 1102-1174)
- Verify all screens use `kk-*` CSS classes for consistent styling per `kk-part1-customer.html`

---

## Phase 3: KasirView Decomposition + Real Data

### Task 3.1: Create kasir/ directory with extracted sub-components
**Directory:** `src/components/layout/shell/kasir/` (new)

Extract these from the monolithic `KasirView.jsx`:
| Sub-component | Source Lines | New File |
|---|---|---|
| `ErrorBoundary` + `ErrorFallback` | 59-101 | `kasir/ErrorBoundary.jsx` |
| `DailySummaryWidget` | 107-149 | `kasir/DailySummaryWidget.jsx` |
| `OrderDetailModal` | 155-325 | `kasir/OrderDetailModal.jsx` |
| `PosPage` | ~330-550 | `kasir/PosPage.jsx` |
| `OrdersKanban` | ~550-824 | `kasir/OrdersKanban.jsx` |
| `ReportsSubpage` | 830-960 | `kasir/ReportsSubpage.jsx` |
| `StaffPage` | 965-1016 | `kasir/StaffPage.jsx` |
| `SettingsPage` | 1021-1158 | `kasir/SettingsPage.jsx` |

Also create `kasir/constants.js` for `STATUS_COLS`, `NEXT_STATUS`.

### Task 3.2: Wire ReportsSubpage to real chart data
**File:** `src/components/layout/shell/kasir/ReportsSubpage.jsx`

Replace hardcoded `[35, 65, 45, 90, 55, 80, 40]` (line 904) with `report.daily_chart` from the API. Replace hardcoded top menus (lines 921-926) with `report.top_menus`. The query already calls `tenantApi.getReportsForStaff()` — just use its response properly.

### Task 3.3: Rewrite KasirView.jsx as a thin shell
**File:** `src/components/layout/shell/KasirView.jsx`

Rewrite to import all sub-components from `./kasir/`. Use `React.lazy()` for `ReportsSubpage`, `StaffPage`, `SettingsPage`. Shell manages `page` state and the sidebar/topbar.

### Task 3.4: Ensure kasir responsive design
- POS layout: `kk-pos-layout` grid (1fr 340px) collapses to single column on mobile (`kantinkita-ui.css` line 693)
- Kanban: `kk-kanban-grid` 4-col -> 2-col (<=1024px) -> 1-col (<=640px) (CSS lines 971-981)
- Verify all kasir screens match `kk-part2-kasir.html` reference

---

## Phase 4: MerchantView Hardening + Responsive Design

### Task 4.1: Wire FinancePage to real data
**File:** `src/components/layout/shell/MerchantView.jsx` (FinancePage ~line 330)

Replace hardcoded `Rp 12.450.000`, `Rp 12.769.000`, `Rp 319.225` with data from `GET /owner/finance/summary` (or `reportApi.getSalesReport()`). Replace static withdrawal history with API data. Keep the beautiful gradient hero design but make numbers dynamic.

### Task 4.2: Wire SubscriptionPage to real data
**File:** `src/components/layout/shell/MerchantView.jsx` (SubscriptionPage ~line 416)

Replace hardcoded `plans` array with data from `GET /owner/subscription/plans`. Highlight current plan using `GET /owner/subscription` response. Wire the "Upgrade" button to `POST /owner/subscription/subscribe`.

### Task 4.3: Wire ReviewsPage to real or placeholder data
**File:** `src/components/layout/shell/MerchantView.jsx` (ReviewsPage ~line 230)

No reviews API exists yet. Options:
- **Option A**: Keep as "coming soon" placeholder with the nice UI already there
- **Option B**: Add a simple reviews system (DB migration + API + frontend)

Recommend **Option A** for now — the review card UI is already well-designed. Just add a clear "Fitur ulasan akan segera hadir" message instead of fake reviews.

### Task 4.4: Ensure merchant responsive design
- Sidebar layout should collapse to top-nav on mobile (<=768px)
- Stat grids use `kk-stat-grid-4` / `kk-stat-grid-3` responsive classes
- Match `kk-part3-merchant.html` reference

---

## Phase 5: AdminView Responsive Polish

### Task 5.1: Verify admin responsive design
**Files:** All 12 files in `src/components/layout/shell/admin/`

AdminView is already well-decomposed with `React.lazy()`. Focus on:
- Sidebar collapses on mobile (hamburger menu or drawer)
- Tables scroll horizontally on small screens
- Stat grids responsive
- Match `kk-part4-admin.html` dark theme reference (use `--bg-main`, `--bg-surface` tokens)

---

## Phase 6: Realtime Integration + Cross-Role Data Flow

### Task 6.1: Connect Pusher events to TanStack Query invalidation
**Files:** `src/hooks/useRealtime.js`, relevant view components

Add `useEffect` hooks that subscribe to Pusher channels and invalidate queries on events:
- `NewOrderReceived` -> invalidate `['staff-orders']`, `['owner-live-orders']`
- `OrderStatusChanged` -> invalidate `['customer-orders']`, `['staff-orders']`
- Payment webhook status change -> fire `OrderStatusChanged` event (currently missing in `MidtransService::processNotification()`)

### Task 6.2: Fire OrderStatusChanged event on Midtrans webhook
**File:** `kantinkita-api/app/Services/MidtransService.php` (line 111)

After updating order status, broadcast `OrderStatusChanged` event so customer tracking page updates in real-time instead of relying on 5s polling.

### Task 6.3: Reduce polling intervals where realtime is active
**Files:** `CustomerView.jsx`, `KasirView.jsx`, `MerchantView.jsx`

Where Pusher channels are subscribed, increase `refetchInterval` from 5000 to 60000 (1 minute) as a fallback only. Let Pusher be the primary update mechanism.

---

## Phase 7: Integration Verification

### Task 7.1: Full order lifecycle test
Walk through the complete flow:
1. Customer browses tenants -> selects tenant -> adds items to cart -> checkout -> Midtrans snap token
2. Kasir sees new order in kanban (via realtime) -> updates status paid -> processing -> completed
3. Merchant sees order in live-orders -> revenue updates in overview/reports
4. Admin sees tenant stats update

### Task 7.2: Auth flow verification
1. Register as customer -> login -> verify role routing
2. Register as merchant -> login -> verify tenant creation
3. Merchant adds staff -> staff login -> verify role routing
4. Admin login -> verify admin panel access

### Task 7.3: CRUD verification across roles
- Customer: cart CRUD, order list
- Kasir: menu CRUD, category CRUD, order status updates, bulk operations
- Merchant: staff CRUD, report export, subscription management
- Admin: tenant CRUD, user CRUD, settings, roles/permissions, backups

### Task 7.4: Build verification
Run `npm run build` to verify no compilation errors. Run `php artisan route:list` to verify API routes.

---

## Execution Order

```
Phase 0 (30 min)  -> Phase 1 (2 hours)  -> Phase 2 (3 hours)
                                           -> Phase 3 (3 hours)
                                           -> Phase 4 (2 hours)
                                           -> Phase 5 (1 hour)
                  -> Phase 6 (1 hour)    -> Phase 7 (1 hour)
```

Phases 2-5 can be partially parallelized since they touch different view shells. Phase 6 depends on Phase 1 (API fixes). Phase 7 depends on all prior phases.

Total estimated effort: ~12-15 hours of focused implementation.
