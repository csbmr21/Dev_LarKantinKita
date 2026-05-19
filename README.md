# 🍽️ KantinKita — Frontend

Platform Kantin Digital untuk Kampus & Sekolah.

## Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| React | 19 | UI Framework |
| Vite | 6 | Build Tool |
| TailwindCSS | 4 | Styling |
| Zustand | 5 | State Management |
| TanStack Query | 5 | Server State / Cache |
| React Router | 7 | Routing |
| Axios | 1.x | HTTP Client |
| Recharts | 2.x | Charts |
| React Hot Toast | 2.x | Notifications |
| Heroicons | 2.x | Icons |
| date-fns | 3.x | Date Formatting |
| Laravel Echo + Pusher | latest | Real-time WebSocket |

## Struktur Project

```
src/
├── api/              # HTTP client & endpoint functions
│   ├── axios.js      # Axios instance + interceptors
│   ├── auth.js       # Auth endpoints
│   ├── cart.js       # Cart endpoints
│   ├── order.js      # Order endpoints
│   ├── tenant.js     # Tenant & menu endpoints
│   └── report.js     # Report, admin, backup endpoints
├── components/
│   ├── layout/       # CustomerLayout, StaffLayout, OwnerLayout, AdminLayout
│   ├── ui/           # Button, Input, Modal, Badge, Skeleton, Toggle, Pagination, EmptyState, LoadingSpinner
│   └── shared/       # OrderCard, MenuCard, TenantCard, StatCard
├── hooks/
│   ├── useAuth.js    # Auth state & redirect helpers
│   ├── useRealtime.js # Laravel Echo + Pusher
│   └── useOrders.js  # Order queries & mutations
├── pages/
│   ├── auth/         # Login, Register
│   ├── customer/     # Home, TenantDetail, Cart, Checkout, OrderHistory, Profile
│   ├── staff/        # Dashboard, MenuManagement
│   ├── owner/        # Dashboard, Report, Refund, StaffManagement, Subscription
│   ├── admin/        # Dashboard, TenantManagement, UserManagement, Settings, AuditLog, ErrorMonitoring, BackupRestore
│   ├── Unauthorized.jsx
│   └── NotFound.jsx
├── router/
│   ├── index.jsx     # All routes dengan lazy loading
│   └── ProtectedRoute.jsx
├── store/
│   ├── authStore.js  # Zustand + persist (user, token)
│   └── cartStore.js  # Zustand + persist (cart items)
├── utils/
│   ├── formatCurrency.js
│   ├── formatDate.js
│   └── orderStatus.js
├── App.jsx
├── main.jsx
└── index.css         # TailwindCSS v4 + design tokens
```

## Instalasi & Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Isi variabel di .env
#    VITE_API_URL, VITE_PUSHER_APP_KEY, VITE_MIDTRANS_CLIENT_KEY

# 4. Jalankan development server
npm run dev
```

## Akun Default (sesuai seeder backend)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kantinkita.com | password123 |
| Owner | owner@kantinkita.com | password123 |
| Staff | staff@kantinkita.com | password123 |
| Customer | customer@kantinkita.com | password123 |

## Role & Routing

| Role | Base Path | Layout |
|------|-----------|--------|
| customer | `/` | Mobile bottom nav |
| staff | `/staff` | Desktop sidebar |
| owner | `/owner` | Desktop sidebar |
| admin | `/admin` | Desktop sidebar |

## Design System

- **Primary:** `#2D6A4F` (Hijau tua)
- **Secondary:** `#F4845F` (Oranye)
- **Font:** Inter (Google Fonts)
- **Border Radius:** Card `rounded-xl`, Input `rounded-lg`, Badge `rounded-full`

## Real-time

Staff Dashboard menggunakan **Laravel Echo + Pusher** untuk:
- `NewOrderReceived` → notifikasi bunyi + toast + update list
- `OrderStatusChanged` → update status otomatis

Fallback: polling setiap **30 detik** jika WebSocket tidak tersedia.

## Catatan Penting

> ⚠️ `VITE_*` variables ter-embed ke bundle JS dan bisa dibaca user.
> Jangan letakkan Server Key Midtrans di environment frontend.

> ⚠️ Ganti password akun default sebelum deploy ke production.
