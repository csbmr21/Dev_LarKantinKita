# KantinKita - Dokumen Arsitektur Sistem
**Platform Kantin Digital untuk Kampus & Sekolah**
> Versi: 1.0.0 | April 2026

---

## Daftar Isi
1. [System Overview](#1-system-overview)
2. [Architecture Layers](#2-architecture-layers)
3. [Multi-Tenant Architecture](#3-multi-tenant-architecture)
4. [Role & Permission Matrix](#4-role--permission-matrix)
5. [Database Schema](#5-database-schema)
6. [Flow Diagrams](#6-flow-diagrams)
7. [Security Architecture](#7-security-architecture)
8. [Caching Strategy](#8-caching-strategy)
9. [Queue Architecture](#9-queue-architecture)
10. [Real-Time Architecture](#10-real-time-architecture)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Technology Stack Summary](#12-technology-stack-summary)

---

## 1. System Overview

KantinKita adalah platform **multi-tenant SaaS** untuk digitalisasi kantin kampus/sekolah.

### 1.1 Aktor Sistem

| Aktor | Deskripsi | Akses Utama |
|-------|-----------|-------------|
| **Customer** | Mahasiswa/Siswa | Pesan makanan, lihat riwayat, notifikasi |
| **Staff Kantin** | Karyawan kantin | Proses pesanan, update status |
| **Owner Kantin** | Pemilik/pengelola | Kelola menu, laporan, keuangan |
| **Admin Platform** | Super admin | Kelola semua tenant, sistem, backup |

### 1.2 High-Level Architecture

```
+-------------------------------------------------------------+
|                      CLIENT LAYER                           |
|         React 19 SPA  |  PWA  |  Mobile-first              |
+----------------------------+--------------------------------+
                             | HTTPS / WebSocket
+----------------------------v--------------------------------+
|                   API GATEWAY LAYER                         |
|        Laravel 12 REST API -- /api/v1                       |
|     Rate Limiting | CORS | Auth | Logging | Versioning      |
+----------------------------+--------------------------------+
                             |
+----------------------------v--------------------------------+
|                  APPLICATION LAYER                          |
|    Services | Repositories | Events | Jobs | Observers      |
+--------+------------------------------------+---------------+
         |                                   |
+--------v---------+             +-----------v-----------+
|   DATA LAYER     |             |   EXTERNAL SERVICES   |
| MySQL 8.0        |             | Midtrans (Payment)    |
| Redis 7.0        |             | Pusher (WebSocket)    |
| File Storage     |             | Fonnte (WhatsApp)     |
| (Local / S3)     |             | SMTP (Email)          |
+------------------+             +-----------------------+
```

---

## 2. Architecture Layers

### 2.1 Client Layer — React 19 SPA

| Fitur | Implementasi |
|-------|-------------|
| Routing | React Router v6 |
| State Management | Zustand / React Query |
| Real-time | Laravel Echo + Pusher JS |
| HTTP Client | Axios dengan interceptor |
| PWA | Service Worker + Web App Manifest |
| Auth Token | localStorage -> Authorization: Bearer |

### 2.2 API Gateway Layer — Laravel 12

```
Base URL: https://api.kantinkita.id/api/v1
```

| Komponen | Detail |
|----------|--------|
| Versioning | /api/v1/... |
| Auth | Laravel Sanctum (Bearer Token) |
| Rate Limiting | Per-endpoint |
| CORS | Hanya izinkan domain frontend |
| Middleware Stack | Auth -> Role -> Tenant -> Throttle -> Log |

**Endpoint Groups:**
```
/api/v1/auth/          -> AuthController
/api/v1/tenants/       -> TenantController
/api/v1/menus/         -> MenuController
/api/v1/categories/    -> CategoryController
/api/v1/orders/        -> OrderController
/api/v1/payments/      -> PaymentController
/api/v1/subscriptions/ -> SubscriptionController
/api/v1/reports/       -> ReportController
/api/v1/settings/      -> SettingController
/api/v1/logs/          -> LogController
/api/v1/users/         -> UserController
```

### 2.3 Application Layer

**Pattern:** Service + Repository + Event-Driven

```
app/
├── Http/
│   ├── Controllers/        # Thin controllers
│   ├── Requests/           # Form Request validation
│   ├── Middleware/         # Auth, Role, Tenant, Throttle
│   └── Resources/          # API Resource transformers
├── Services/               # Business logic
│   ├── OrderService.php
│   ├── PaymentService.php
│   ├── MidtransService.php
│   ├── NotificationService.php
│   └── ReportService.php
├── Repositories/           # Data access abstraction
│   ├── OrderRepository.php
│   ├── MenuRepository.php
│   └── TenantRepository.php
├── Events/
│   ├── OrderCreated.php
│   ├── OrderStatusChanged.php
│   └── PaymentReceived.php
├── Jobs/
│   ├── SendEmailNotification.php
│   └── SendWhatsAppNotification.php
└── Observers/
    └── OrderObserver.php
```

**Request Lifecycle:**
```
Request -> Middleware Chain -> Controller
        -> FormRequest (validate)
        -> Service (business logic)
        -> Repository (data access)
        -> Eloquent (ORM)
        -> Response Resource
        -> JSON Response
```

### 2.4 Data Layer

| Komponen | Teknologi | Kegunaan |
|----------|-----------|----------|
| Primary DB | MySQL 8.0 | Data utama aplikasi |
| Cache | Redis 7.0 | Cache & session |
| Queue | Redis 7.0 | Job queue async |
| File Storage | Local / AWS S3 | Foto menu, foto tenant |

### 2.5 External Services

| Service | Provider | Kegunaan |
|---------|----------|----------|
| Payment Gateway | Midtrans | Snap, Refund, Webhook |
| Real-time | Pusher | WebSocket broadcast |
| WhatsApp | Fonnte | Notifikasi WA |
| Email | Mailtrap/SMTP | Notifikasi email |

---

## 3. Multi-Tenant Architecture

### 3.1 Strategi
> **Shared Database, Shared Schema** — Semua tenant dalam 1 database, isolasi data via `company_code` & `tenant_id`.

### 3.2 Tenant Hierarchy

```
Platform (Admin)
└── Company (company_code: "UNIV")
    └── Tenant (kantin A, B, C ...)
        ├── Owner (1)
        ├── Staff (many) <- via tenant_user pivot
        └── Customer (many)
```

### 3.3 Data Isolation

| Level Isolasi | Mekanisme |
|---------------|-----------|
| Company Level | `company_code` di semua tabel |
| Tenant Level  | `tenant_id` di menu, order, dll |
| User Level    | Ownership check di service layer |

```php
// Global Scope pada semua Model
static::addGlobalScope('company', function (Builder $builder) {
    $builder->where('company_code', auth()->user()->company_code);
});
```

---

## 4. Role & Permission Matrix

| Permission | Admin | Owner | Staff | Customer |
|------------|:-----:|:-----:|:-----:|:--------:|
| Manage Platform | YES | NO | NO | NO |
| Manage Tenant | YES | YES | NO | NO |
| Manage Menu | YES | YES | YES | NO |
| Manage Staff | YES | YES | NO | NO |
| View All Orders | YES | YES | YES | NO |
| View Own Orders | YES | YES | YES | YES |
| Process Order | NO | NO | YES | NO |
| Create Order | NO | NO | NO | YES |
| View Reports | YES | YES | NO | NO |
| System Settings | YES | NO | NO | NO |
| Backup / Restore | YES | NO | NO | NO |
| Audit Logs | YES | NO | NO | NO |

```php
// Implementasi RoleMiddleware
Route::middleware(['auth:sanctum', 'role:admin,owner'])->group(...);

Gate::define('manage-menu', fn($user) =>
    in_array($user->role, ['admin', 'owner', 'staff'])
);
```

---

## 5. Database Schema

### 5.1 Standard Fields (Semua Tabel)

```sql
company_code  VARCHAR(20)  DEFAULT 'UNIV'
status        TINYINT(1)   DEFAULT 1
is_deleted    TINYINT(1)   DEFAULT 0   -- Soft delete flag
created_by    VARCHAR(100) DEFAULT 'system'
updated_by    VARCHAR(100) DEFAULT 'system'
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### 5.2 DDL Semua Tabel

#### Tabel 1: `users`
```sql
CREATE TABLE users (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username          VARCHAR(100) UNIQUE NOT NULL,
    full_name         VARCHAR(200) NOT NULL,
    email             VARCHAR(200) UNIQUE NOT NULL,
    password          VARCHAR(255) NOT NULL,
    phone             VARCHAR(20),
    role              ENUM('admin','owner','staff','customer'),
    email_notif       TINYINT(1) DEFAULT 1,
    wa_notif          TINYINT(1) DEFAULT 1,
    email_verified_at TIMESTAMP NULL,
    -- + STANDARD FIELDS
);
```

#### Tabel 2: `tenants`
```sql
CREATE TABLE tenants (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED,         -- FK: users.id (owner)
    tenant_name VARCHAR(200) NOT NULL,
    description TEXT,
    address     TEXT,
    phone       VARCHAR(20),
    photo       VARCHAR(500),
    is_open     TINYINT(1)    DEFAULT 1,
    min_order   DECIMAL(10,2) DEFAULT 0,
    open_hours  JSON,
    -- + STANDARD FIELDS
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Tabel 3: `categories`
```sql
CREATE TABLE categories (
    id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT UNSIGNED,           -- FK: tenants.id
    name      VARCHAR(100) NOT NULL,
    -- + STANDARD FIELDS
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

#### Tabel 4: `menus`
```sql
CREATE TABLE menus (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id    BIGINT UNSIGNED,         -- FK: tenants.id
    category_id  BIGINT UNSIGNED,         -- FK: categories.id
    name         VARCHAR(200)  NOT NULL,
    description  TEXT,
    price        DECIMAL(10,2) NOT NULL,
    photo        VARCHAR(500),
    is_available TINYINT(1)    DEFAULT 1,
    -- + STANDARD FIELDS
    FOREIGN KEY (tenant_id)   REFERENCES tenants(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### Tabel 5: `orders`
```sql
CREATE TABLE orders (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number  VARCHAR(50)   UNIQUE NOT NULL,
    user_id       BIGINT UNSIGNED,
    tenant_id     BIGINT UNSIGNED,
    total_amount  DECIMAL(10,2) NOT NULL,
    service_fee   DECIMAL(10,2) DEFAULT 0,
    grand_total   DECIMAL(10,2) NOT NULL,
    status        ENUM('pending_payment','paid','processing',
                       'completed','expired','cancelled','refunded'),
    notes         TEXT,
    expires_at    TIMESTAMP,
    refund_reason TEXT,
    refunded_at   TIMESTAMP NULL,
    -- + STANDARD FIELDS
    FOREIGN KEY (user_id)   REFERENCES users(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

#### Tabel 6: `order_items`
```sql
CREATE TABLE order_items (
    id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id  BIGINT UNSIGNED,
    menu_id   BIGINT UNSIGNED,
    menu_name VARCHAR(200),   -- snapshot saat order dibuat
    price     DECIMAL(10,2),  -- snapshot saat order dibuat
    quantity  INT,
    subtotal  DECIMAL(10,2),
    -- + STANDARD FIELDS
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_id)  REFERENCES menus(id)
);
-- Catatan: menu_name & price adalah snapshot untuk immutability histori
```

#### Tabel 7: `payments`
```sql
CREATE TABLE payments (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id          BIGINT UNSIGNED,
    transaction_id    VARCHAR(200) UNIQUE,
    payment_type      VARCHAR(100),
    status            VARCHAR(50),
    gross_amount      DECIMAL(10,2),
    snap_token        TEXT,
    payment_url       TEXT,
    midtrans_response JSON,
    paid_at           TIMESTAMP NULL,
    -- + STANDARD FIELDS
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### Tabel 8: `subscriptions`
```sql
CREATE TABLE subscriptions (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id      BIGINT UNSIGNED,
    plan           ENUM('starter','professional','enterprise'),
    billing_start  DATE,
    billing_end    DATE,
    billing_status VARCHAR(50),
    amount         DECIMAL(10,2),
    invoice_number VARCHAR(100),
    -- + STANDARD FIELDS
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

#### Tabel 9: `activity_logs`
```sql
CREATE TABLE activity_logs (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT UNSIGNED NULL,
    action       VARCHAR(100),
    description  TEXT,
    ip_address   VARCHAR(50),
    user_agent   TEXT,
    company_code VARCHAR(20),
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Tabel 10: `system_settings`
```sql
CREATE TABLE system_settings (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `key`       VARCHAR(100) UNIQUE,
    value       TEXT,
    type        ENUM('string','integer','float','boolean',
                     'json','select','textarea'),
    `group`     VARCHAR(50),
    label       VARCHAR(200),
    description TEXT,
    options     JSON NULL,
    -- + STANDARD FIELDS
);
```

#### Tabel 11: `config_versions`
```sql
CREATE TABLE config_versions (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    version      INT,
    changed_key  VARCHAR(100),
    old_value    TEXT,
    new_value    TEXT,
    changed_by   VARCHAR(100),
    company_code VARCHAR(20),
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP
);
```

#### Tabel 12: `error_logs`
```sql
CREATE TABLE error_logs (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NULL,
    level           ENUM('error','warning','info'),
    message         TEXT,
    stack_trace     LONGTEXT,
    endpoint        VARCHAR(500),
    ip_address      VARCHAR(50),
    resolved_status ENUM('open','resolved'),
    resolved_by     VARCHAR(100),
    resolved_at     TIMESTAMP NULL,
    company_code    VARCHAR(20),
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Pivot: `tenant_user`
```sql
CREATE TABLE tenant_user (
    tenant_id BIGINT UNSIGNED,
    user_id   BIGINT UNSIGNED,
    PRIMARY KEY (tenant_id, user_id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id)   REFERENCES users(id)
    -- Relasi many-to-many: Staff <-> Tenant
);
```

### 5.3 Entity Relationship

```
users (1) ------- (N) activity_logs
users (1) ------- (N) error_logs
users (1) ------- (1) tenants  [owner]
users (N) ------- (N) tenants  [staff via tenant_user]
users (1) ------- (N) orders

tenants (1) ----- (N) categories
tenants (1) ----- (N) menus
tenants (1) ----- (N) orders
tenants (1) ----- (N) subscriptions

categories (1) -- (N) menus
orders (1) ------ (N) order_items
orders (1) ------ (1) payments
menus (1) ------- (N) order_items
```

---

## 6. Flow Diagrams

### 6.1 Order Flow

```
[Customer]
    |
    v
Pilih Menu & Tambah ke Cart
    |
    v
Checkout -> POST /api/v1/orders
    |         OrderService::create()
    |         status: pending_payment
    |
    v
MidtransService::createSnapToken()
    |
    v
Frontend tampilkan Midtrans Snap Popup
    |
    v
Customer bayar (transfer/QRIS/kartu)
    |
    v
Midtrans Webhook -> POST /api/v1/payments/notification
    |   verify signature
    |   update payments.status
    |   update orders.status -> 'paid'
    |
    v
Event: PaymentReceived::dispatch($order)
    |
    +---> Pusher broadcast ke channel tenant.{id}
    |     [NewOrderReceived] -> Staff dashboard update realtime
    |
    +---> Queue Jobs:
              ├── SendEmailNotification (staff + customer)
              └── SendWhatsAppNotification (staff + customer)
    |
    v
[Staff] terima notifikasi -> klik "Proses"
    |    PATCH /api/v1/orders/{id}/status
    |    status: 'processing'
    |    Pusher -> OrderStatusChanged -> Customer notified
    |
    v
[Staff] selesai -> klik "Selesai"
         status: 'completed'
         Notifikasi WA + Email -> Customer & Staff
```

### 6.2 Payment Flow

```
POST /api/v1/orders
    |
    v
MidtransService::createSnapToken()
    |   params: order_number, grand_total, user info
    v
Midtrans API -> return snap_token
    |
    v
Simpan payments record (status: pending)
    |
    v
Return snap_token ke frontend
    |
    v
Frontend: window.snap.pay(token)
    |
    v
Customer bayar ---[Berhasil]---> Midtrans Webhook
         |                           |
         +--- [Gagal/Tutup]          v
              order expires    POST /payment/notification
                                    |
                                    v
                               Verify SHA512 signature
                                    |
                                    v
                               Update payments.status
                               Update orders.status
                                    |
                                    v
                               Trigger Events & Notifications
```

### 6.3 Refund Flow

```
[Owner] Request Refund
    |   POST /api/v1/orders/{id}/refund
    |   Body: { "reason": "..." }
    |
    v
OrderService::requestRefund()
    |
    +-- Validasi: status IN ['paid', 'processing']
    +-- Validasi: ownership (tenant_id match)
    |
    v
MidtransService::refund(transaction_id, amount)
    |
    v
Update orders:
    |   status        -> 'refunded'
    |   refund_reason  = reason
    |   refunded_at   = NOW()
    |
    v
Queue: SendWhatsAppNotification -> Customer
Queue: SendEmailNotification    -> Customer
```

---

## 7. Security Architecture

### 7.1 Authentication

| Aspek | Detail |
|-------|--------|
| Library | Laravel Sanctum |
| Token Type | Personal Access Token (opaque) |
| Storage (FE) | localStorage |
| HTTP Header | Authorization: Bearer {token} |
| Expiry | 7 hari |
| Logout | $user->currentAccessToken()->delete() |

### 7.2 Authorization Middleware Stack

```php
Route::middleware([
    'auth:sanctum',      // 1. Validasi token
    'role:staff,owner',  // 2. Validasi role
    'tenant.access',     // 3. Validasi kepemilikan tenant
])->group(function () { ... });
```

### 7.3 Rate Limiting

| Endpoint Group | Limit |
|----------------|-------|
| Auth (login/register) | 10 req / menit |
| Checkout (create order) | 5 req / menit |
| General API | 60 req / menit |

### 7.4 Threat Mitigation

| Ancaman | Mitigasi |
|---------|----------|
| SQL Injection | Eloquent ORM + prepared statements |
| XSS | Response escaping + CSP header |
| Password Leak | bcrypt hashing |
| Sensitive Data | Laravel encrypt() |
| Webhook Forgery | SHA512 signature verification |
| Unauthorized Webhook | Midtrans IP whitelist |
| Brute Force | Rate limiting |

### 7.5 Security Headers

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 8. Caching Strategy

**Driver:** Redis 7.0

### 8.1 Cache Keys & TTL

| Data | Cache Key | TTL |
|------|-----------|-----|
| Tenant list | tenants:company:{code} | 5 menit |
| Menu per tenant | menus:tenant:{id} | 5 menit |
| System settings | settings:company:{code} | 60 menit |
| User session | session:{token} | 7 hari |

### 8.2 Implementation

```php
// MenuRepository.php
public function getByTenant(int $tenantId): Collection
{
    return Cache::remember(
        "menus:tenant:{$tenantId}",
        now()->addMinutes(5),
        fn() => Menu::where('tenant_id', $tenantId)
                    ->where('is_available', 1)
                    ->where('is_deleted', 0)
                    ->get()
    );
}
```

### 8.3 Cache Invalidation

| Trigger | Cache Dihapus |
|---------|--------------|
| Menu updated/created/deleted | menus:tenant:{id} |
| Settings updated | settings:company:{code} |
| Tenant updated | tenants:company:{code} |

```php
// MenuObserver.php
public function saved(Menu $menu): void
{
    Cache::forget("menus:tenant:{$menu->tenant_id}");
}
```

---

## 9. Queue Architecture

### 9.1 Konfigurasi

| Aspek | Detail |
|-------|--------|
| Driver | Redis |
| Worker Manager | Supervisor |
| Workers | 2 (paralel) |
| Queue Name | notifications |
| Max Retry | 3x |
| Retry Delay | 60 detik |
| Failed Jobs | failed_jobs table |

### 9.2 Job Classes

```php
// SendEmailNotification.php
class SendEmailNotification implements ShouldQueue
{
    public int $tries   = 3;
    public int $backoff = 60;

    public function handle(): void
    {
        Mail::to($this->user->email)
            ->send(new OrderStatusMail($this->order, $this->type));
    }
}

// SendWhatsAppNotification.php (via Fonnte API)
class SendWhatsAppNotification implements ShouldQueue
{
    public int $tries   = 3;
    public int $backoff = 60;

    public function handle(): void
    {
        Http::withToken(config('fonnte.token'))
            ->post('https://api.fonnte.com/send', [
                'target'  => $this->user->phone,
                'message' => $this->buildMessage(),
            ]);
    }
}
```

### 9.3 Supervisor Config

```ini
[program:kantinkita-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/kantinkita/artisan queue:work redis
    --sleep=3 --tries=3 --queue=notifications --max-time=3600
autostart=true
autorestart=true
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/supervisor/kantinkita-worker.log
```

---

## 10. Real-Time Architecture

### 10.1 Konfigurasi Pusher

| Komponen | Detail |
|----------|--------|
| Provider | Pusher |
| Channel Type | Private Channel (requires auth) |
| Channel Pattern | tenant.{tenant_id} |
| Auth Endpoint | POST /broadcasting/auth |

### 10.2 Events

| Event | Channel | Consumer |
|-------|---------|----------|
| NewOrderReceived | tenant.{id} | Staff Dashboard |
| OrderStatusChanged | tenant.{id} | Customer Order Page |

### 10.3 Backend — Broadcast Event

```php
class NewOrderReceived implements ShouldBroadcast
{
    public function broadcastOn(): array
    {
        return [new PrivateChannel("tenant.{$this->order->tenant_id}")];
    }

    public function broadcastWith(): array
    {
        return [
            'order_number' => $this->order->order_number,
            'grand_total'  => $this->order->grand_total,
            'customer'     => $this->order->user->full_name,
            'status'       => $this->order->status,
        ];
    }
}
```

### 10.4 Frontend — React Hook

```javascript
// hooks/useOrderRealtime.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_KEY,
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    forceTLS: true,
    authEndpoint: '/api/broadcasting/auth',
    auth: { headers: { Authorization: `Bearer ${token}` } },
});

export function useOrderRealtime(tenantId, onNewOrder, onStatusChange) {
    useEffect(() => {
        const channel = echo.private(`tenant.${tenantId}`)
            .listen('NewOrderReceived', (e) => {
                toast.success(`Pesanan baru: #${e.order_number}`);
                onNewOrder(e);
            })
            .listen('OrderStatusChanged', (e) => {
                onStatusChange(e);
            });

        // Cleanup on unmount
        return () => {
            channel.stopListening('NewOrderReceived');
            channel.stopListening('OrderStatusChanged');
            echo.leave(`tenant.${tenantId}`);
        };
    }, [tenantId]);
}
```

---

## 11. Deployment Architecture

### 11.1 Production Stack

```
Internet
    |
    v
Cloudflare (CDN + DDoS Protection)
    |
    v
Nginx (Port 443 HTTPS / Let's Encrypt SSL)
    |
    +---> /       -> React SPA (static dist/)
    +---> /api    -> PHP-FPM 8.3 (Laravel)
                       |
             +---------+---------+
             |                   |
          MySQL 8.0          Redis 7.0
                                  |
                             Supervisor
                           (2 queue workers)
```

### 11.2 Server Requirements

| Resource | Minimum Produksi |
|----------|-----------------|
| OS | Ubuntu 22.04 LTS |
| CPU | 4 vCPU |
| RAM | 8 GB |
| Storage | 50 GB SSD |
| Web Server | Nginx 1.24+ |
| PHP | 8.3 FPM |
| MySQL | 8.0 |
| Redis | 7.0 |

### 11.3 Nginx Config

```nginx
server {
    listen 443 ssl http2;
    server_name api.kantinkita.id;
    root /var/www/kantinkita/public;
    index index.php;

    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";

    ssl_certificate /etc/letsencrypt/live/api.kantinkita.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.kantinkita.id/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
}
```

### 11.4 CI/CD Pipeline (GitHub Actions)

```
git push origin main
        |
        v
GitHub Actions triggered
        |
        +---> Run PHPUnit Tests
        +---> npm run build (React)
        |
        v (tests pass + build success)
        |
SSH into production server
        |
        +---> git pull origin main
        +---> composer install --no-dev --optimize-autoloader
        +---> php artisan migrate --force
        +---> php artisan config:cache
        +---> php artisan route:cache
        +---> php artisan view:cache
        +---> php artisan queue:restart
        +---> sudo systemctl reload nginx
```

### 11.5 Backup Strategy

| Aspek | Detail |
|-------|--------|
| Jadwal | Setiap hari pukul 02:00 WIB |
| Retensi | 30 hari terakhir |
| Storage | Local + AWS S3 (opsional) |
| Target | DB dump + storage/ files |

```bash
# /etc/cron.d/kantinkita
0 2 * * * www-data php /var/www/kantinkita/artisan backup:run --only-db
30 2 * * * www-data php /var/www/kantinkita/artisan backup:run --only-files
```

---

## 12. Technology Stack Summary

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Frontend Framework | React | 19 |
| Build Tool | Vite | 5+ |
| Real-time (FE) | Laravel Echo + Pusher JS | Latest |
| HTTP Client | Axios | 1.x |
| Backend Framework | Laravel | 12 |
| PHP | PHP-FPM | 8.3 |
| Authentication | Laravel Sanctum | 4.x |
| Database | MySQL | 8.0 |
| Cache / Queue / Session | Redis | 7.0 |
| Queue Worker Manager | Supervisor | - |
| Web Server | Nginx | 1.24+ |
| Operating System | Ubuntu | 22.04 LTS |
| SSL | Let's Encrypt | - |
| CDN / DDoS | Cloudflare | - |
| Payment Gateway | Midtrans Snap | - |
| WebSocket SaaS | Pusher | - |
| WhatsApp Notif | Fonnte API | - |
| Email | Mailtrap / SMTP | - |
| CI/CD | GitHub Actions | - |
| File Storage | Local / AWS S3 | - |

---

> **PENTING:** Dokumen ini adalah *living document*. Setiap perubahan signifikan harus di-review oleh tech lead sebelum implementasi.
>
> **TIP:** Untuk onboarding developer baru, baca Section 1-6 terlebih dahulu, kemudian lanjut ke section yang relevan.

---
*KantinKita Platform v1.0.0 | April 2026*
