# ⚙️ KantinKita — Technical Specification
**Konfigurasi, Deployment & Testing**
> Versi: 1.0.0 | April 2026 | Dokumen Pendamping Arsitektur

---

## Daftar Isi

1. [Project Structure](#1-project-structure)
2. [Dependency Manifest](#2-dependency-manifest)
3. [Build & Tooling Config](#3-build--tooling-config)
4. [Design System (Tailwind v4)](#4-design-system-tailwind-v4)
5. [Environment Variables](#5-environment-variables)
6. [Server Configuration](#6-server-configuration)
7. [Process Management (Supervisor)](#7-process-management-supervisor)
8. [CI/CD Pipeline (GitHub Actions)](#8-cicd-pipeline-github-actions)
9. [Database Seeder](#9-database-seeder)
10. [Testing Specification](#10-testing-specification)

---

## 1. Project Structure

### 1.1 Monorepo Layout

```
kantinkita/
├── backend/                    # Laravel 12 API
│   ├── app/
│   │   ├── Console/
│   │   │   └── Commands/
│   │   │       ├── BackupDatabase.php
│   │   │       └── CancelExpiredOrders.php
│   │   ├── Events/
│   │   │   ├── NewOrderReceived.php
│   │   │   ├── OrderStatusChanged.php
│   │   │   └── PaymentReceived.php
│   │   ├── Exceptions/
│   │   │   └── Handler.php
│   │   ├── Helpers/
│   │   │   └── helpers.php             ← autoloaded via composer.json
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── TenantController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── MenuController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   ├── SubscriptionController.php
│   │   │   │   ├── ReportController.php
│   │   │   │   ├── SettingController.php
│   │   │   │   ├── UserController.php
│   │   │   │   └── LogController.php
│   │   │   ├── Middleware/
│   │   │   │   ├── RoleMiddleware.php
│   │   │   │   └── TenantAccessMiddleware.php
│   │   │   ├── Requests/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginRequest.php
│   │   │   │   │   └── RegisterRequest.php
│   │   │   │   ├── Order/
│   │   │   │   │   ├── CheckoutRequest.php
│   │   │   │   │   └── UpdateOrderStatusRequest.php
│   │   │   │   ├── Menu/
│   │   │   │   │   ├── StoreMenuRequest.php
│   │   │   │   │   └── UpdateMenuRequest.php
│   │   │   │   └── Setting/
│   │   │   │       └── UpdateSettingRequest.php
│   │   │   └── Resources/
│   │   │       ├── UserResource.php
│   │   │       ├── TenantResource.php
│   │   │       ├── MenuResource.php
│   │   │       ├── OrderResource.php
│   │   │       └── OrderItemResource.php
│   │   ├── Jobs/
│   │   │   ├── SendEmailNotification.php
│   │   │   └── SendWhatsAppNotification.php
│   │   ├── Listeners/
│   │   │   ├── HandleNewOrder.php
│   │   │   └── HandleOrderStatusChange.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Tenant.php
│   │   │   ├── Category.php
│   │   │   ├── Menu.php
│   │   │   ├── Order.php
│   │   │   ├── OrderItem.php
│   │   │   ├── Payment.php
│   │   │   ├── Subscription.php
│   │   │   ├── ActivityLog.php
│   │   │   ├── SystemSetting.php
│   │   │   ├── ConfigVersion.php
│   │   │   └── ErrorLog.php
│   │   ├── Observers/
│   │   │   ├── MenuObserver.php
│   │   │   └── OrderObserver.php
│   │   ├── Repositories/
│   │   │   ├── Contracts/
│   │   │   │   ├── MenuRepositoryInterface.php
│   │   │   │   └── OrderRepositoryInterface.php
│   │   │   ├── MenuRepository.php
│   │   │   ├── OrderRepository.php
│   │   │   └── TenantRepository.php
│   │   └── Services/
│   │       ├── OrderService.php
│   │       ├── PaymentService.php
│   │       ├── MidtransService.php
│   │       ├── NotificationService.php
│   │       └── ReportService.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       ├── UserSeeder.php
│   │       ├── TenantSeeder.php
│   │       ├── CategorySeeder.php
│   │       ├── MenuSeeder.php
│   │       └── SystemSettingSeeder.php
│   ├── routes/
│   │   ├── api.php
│   │   └── channels.php
│   ├── tests/
│   │   ├── Feature/
│   │   │   ├── AuthTest.php
│   │   │   ├── CustomerOrderTest.php
│   │   │   ├── StaffMenuTest.php
│   │   │   └── AdminTest.php
│   │   └── Unit/
│   │       ├── OrderServiceTest.php
│   │       └── ReportServiceTest.php
│   ├── composer.json
│   └── .env
│
├── frontend/                   # React 19 + Vite + Tailwind v4
│   ├── public/
│   │   ├── favicon.svg
│   │   └── manifest.json
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── auth.js
│   │   │   ├── orders.js
│   │   │   ├── menus.js
│   │   │   └── tenants.js
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   └── layout/
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Navbar.jsx
│   │   │       └── PageWrapper.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   └── useOrderRealtime.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── customer/
│   │   │   │   ├── MenuPage.jsx
│   │   │   │   ├── CartPage.jsx
│   │   │   │   └── OrderHistoryPage.jsx
│   │   │   ├── staff/
│   │   │   │   ├── OrderDashboard.jsx
│   │   │   │   └── MenuManagement.jsx
│   │   │   ├── owner/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ReportPage.jsx
│   │   │   │   └── TenantSettings.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── TenantList.jsx
│   │   │       ├── UserList.jsx
│   │   │       ├── SystemSettings.jsx
│   │   │       └── ErrorLogs.jsx
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   └── cartStore.js
│   │   ├── utils/
│   │   │   ├── currency.js
│   │   │   ├── date.js
│   │   │   └── orderStatus.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

---

## 2. Dependency Manifest

### 2.1 Backend — `composer.json`

```json
{
    "name": "kantinkita/api",
    "type": "project",
    "description": "KantinKita Backend API",
    "require": {
        "php": "^8.3",
        "laravel/framework": "^12.0",
        "laravel/sanctum": "^4.0",
        "laravel/tinker": "^2.9"
    },
    "require-dev": {
        "fakerphp/faker": "^1.23",
        "laravel/pint": "^1.13",
        "laravel/sail": "^1.26",
        "mockery/mockery": "^1.6",
        "nunomaduro/collision": "^8.1",
        "phpunit/phpunit": "^11.0",
        "spatie/laravel-ignition": "^2.4"
    },
    "autoload": {
        "psr-4": {
            "App\\": "app/"
        },
        "files": [
            "app/Helpers/helpers.php"
        ]
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\": "tests/"
        }
    },
    "scripts": {
        "post-autoload-dump": [
            "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover --ansi"
        ],
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ],
        "post-root-package-install": [
            "@php -r \"file_exists('.env') || copy('.env.example', '.env');\""
        ],
        "post-create-project-cmd": [
            "@php artisan key:generate --ansi",
            "@php artisan migrate --ansi",
            "@php artisan db:seed --ansi"
        ]
    }
}
```

> **Catatan:** Tidak ada package third-party payment/pusher SDK karena integrasi dilakukan via HTTP (`Http::post()`) langsung ke Midtrans & Fonnte REST API. Pusher broadcast menggunakan koneksi native Laravel Broadcasting.

### 2.2 Frontend — `package.json`

```json
{
    "name": "kantinkita-web",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "scripts": {
        "dev":     "vite",
        "build":   "vite build",
        "preview": "vite preview",
        "lint":    "eslint . --ext js,jsx --report-unused-disable-directives",
        "format":  "prettier --write src/"
    },
    "dependencies": {
        "react":                  "^19.0.0",
        "react-dom":              "^19.0.0",
        "react-router-dom":       "^7.0.0",
        "axios":                  "^1.7.0",
        "zustand":                "^5.0.0",
        "@tanstack/react-query":  "^5.0.0",
        "recharts":               "^2.12.0",
        "react-hot-toast":        "^2.4.0",
        "@heroicons/react":       "^2.1.0",
        "date-fns":               "^3.6.0",
        "laravel-echo":           "^1.16.0",
        "pusher-js":              "^8.4.0",
        "clsx":                   "^2.1.0",
        "tailwind-merge":         "^2.3.0"
    },
    "devDependencies": {
        "@types/react":           "^19.0.0",
        "@types/react-dom":       "^19.0.0",
        "@vitejs/plugin-react":   "^4.3.0",
        "vite":                   "^6.0.0",
        "tailwindcss":            "^4.0.0",
        "@tailwindcss/vite":      "^4.0.0",
        "autoprefixer":           "^10.4.0",
        "eslint":                 "^9.0.0",
        "eslint-plugin-react":    "^7.34.0",
        "prettier":               "^3.3.0"
    }
}
```

#### Kegunaan setiap dependency utama

| Package | Kegunaan |
|---------|----------|
| `react` + `react-dom` | UI framework core |
| `react-router-dom` v7 | Client-side routing |
| `axios` | HTTP client dengan interceptor token |
| `zustand` v5 | Global state (auth, cart) |
| `@tanstack/react-query` | Server state, caching, refetch |
| `recharts` | Grafik laporan (bar, line, pie) |
| `react-hot-toast` | Notifikasi toast UI |
| `@heroicons/react` | Icon set konsisten |
| `date-fns` | Format tanggal/waktu |
| `laravel-echo` + `pusher-js` | Real-time WebSocket |
| `clsx` + `tailwind-merge` | Conditional class merging |

---

## 3. Build & Tooling Config

### 3.1 `vite.config.js`

```js
import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import tailwindcss      from '@tailwindcss/vite';
import path             from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target:       'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir:    'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor:   ['react', 'react-dom', 'react-router-dom'],
                    query:    ['@tanstack/react-query'],
                    charts:   ['recharts'],
                    realtime: ['laravel-echo', 'pusher-js'],
                },
            },
        },
    },
});
```

**Code Splitting Strategy:**

| Chunk | Bundle | Alasan |
|-------|--------|--------|
| `vendor` | React core | Cache terlama, jarang berubah |
| `query` | TanStack Query | Dipakai semua halaman |
| `charts` | Recharts (~500KB) | Hanya di halaman laporan |
| `realtime` | Echo + Pusher | Hanya di dashboard realtime |

### 3.2 `index.html`

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="KantinKita - Platform Kantin Digital" />
    <meta name="theme-color" content="#2D6A4F" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
    />
    <title>KantinKita</title>
</head>
<body>
    <div id="root"></div>
    <!--
        Midtrans Snap JS dimuat secara global (bukan sebagai modul)
        karena window.snap tidak tersedia via npm package
    -->
    <script
        src="%VITE_MIDTRANS_SNAP_URL%"
        data-client-key="%VITE_MIDTRANS_CLIENT_KEY%"
    ></script>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

> **Catatan:** `%VITE_MIDTRANS_CLIENT_KEY%` adalah placeholder yang disubstitusi Vite saat build dari file `.env`. Gunakan `import.meta.env.VITE_MIDTRANS_CLIENT_KEY` jika dibutuhkan di dalam JS.

---

## 4. Design System (Tailwind v4)

### 4.1 `src/index.css`

```css
/* ─── Tailwind v4 Import ──────────────────────────────── */
@import "tailwindcss";

/* ─── Theme Tokens ────────────────────────────────────── */
@theme {
    /* Primary: Forest Green — brand KantinKita */
    --color-primary:     #2D6A4F;
    --color-primary-50:  #f0fdf4;
    --color-primary-100: #dcfce7;
    --color-primary-200: #bbf7d0;
    --color-primary-300: #86efac;
    --color-primary-400: #4ade80;
    --color-primary-500: #2D6A4F;
    --color-primary-600: #16a34a;
    --color-primary-700: #15803d;
    --color-primary-800: #166534;
    --color-primary-900: #14532d;

    /* Secondary: Coral/Orange — CTA & highlight */
    --color-secondary: #F4845F;

    /* Typography */
    --font-sans: 'Inter', system-ui, sans-serif;

    /* Border radius scale */
    --radius-xl:  0.75rem;
    --radius-2xl: 1rem;
    --radius-3xl: 1.5rem;
}

/* ─── Base Styles ─────────────────────────────────────── */
@layer base {
    * {
        box-sizing: border-box;
    }

    body {
        font-family: var(--font-sans);
        background-color: #F9FAFB;
        color: #111827;
    }

    /* Custom scrollbar — thin & subtle */
    ::-webkit-scrollbar       { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
        background: #D1D5DB;
        border-radius: 2px;
    }
}

/* ─── Custom Utilities ────────────────────────────────── */
@utility scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width:    none;
    &::-webkit-scrollbar { display: none; }
}

@utility line-clamp-2 {
    display:              -webkit-box;
    -webkit-line-clamp:   2;
    -webkit-box-orient:   vertical;
    overflow:             hidden;
}
```

### 4.2 Color Palette Rationale

| Token | HEX | Penggunaan |
|-------|-----|------------|
| `primary` | `#2D6A4F` | Button utama, navbar, badge aktif |
| `primary-50` | `#f0fdf4` | Background card hover, alert success |
| `secondary` | `#F4845F` | CTA checkout, badge pending, highlight |

### 4.3 PWA Manifest — `public/manifest.json`

```json
{
    "name": "KantinKita",
    "short_name": "KantinKita",
    "description": "Platform Kantin Digital untuk Kampus & Sekolah",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#2D6A4F",
    "background_color": "#F9FAFB",
    "icons": [
        { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
}
```

---

## 5. Environment Variables

### 5.1 Backend — `.env` (Laravel)

```dotenv
# ── App ────────────────────────────────────────────────
APP_NAME=KantinKita
APP_ENV=local
APP_KEY=                            # php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_TIMEZONE=Asia/Jakarta
FRONTEND_URL=http://localhost:5173

# ── Logging ────────────────────────────────────────────
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# ── Database ───────────────────────────────────────────
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kantinkita
DB_USERNAME=root
DB_PASSWORD=

# ── Drivers ────────────────────────────────────────────
BROADCAST_DRIVER=pusher
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=10080              # 7 hari dalam menit

# ── Redis ──────────────────────────────────────────────
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0                          # default (session, queue)
REDIS_CACHE_DB=1                    # db terpisah untuk cache

# ── Mail ───────────────────────────────────────────────
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@kantinkita.com
MAIL_FROM_NAME=KantinKita

# ── Pusher (Broadcast) ─────────────────────────────────
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=ap1

# ── Midtrans ───────────────────────────────────────────
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_MODE=sandbox               # sandbox | production
MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js

# ── Fonnte (WhatsApp) ──────────────────────────────────
FONNTE_TOKEN=
FONNTE_URL=https://api.fonnte.com/send

# ── Sanctum / CORS ─────────────────────────────────────
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost

# ── Backup ─────────────────────────────────────────────
BACKUP_PATH=storage/backups
BACKUP_KEEP_DAYS=30
```

### 5.2 Frontend — `.env` (Vite)

```dotenv
VITE_APP_NAME=KantinKita
VITE_API_URL=http://localhost:8000
VITE_PUSHER_APP_KEY=
VITE_PUSHER_APP_CLUSTER=ap1
VITE_MIDTRANS_CLIENT_KEY=
VITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

> **PENTING:** Semua variabel frontend dengan prefix `VITE_` akan ter-embed ke dalam bundle JavaScript dan **dapat dibaca oleh pengguna**. Jangan pernah meletakkan Server Key / secret di sini.

### 5.3 Environment Matrix (Local vs Production)

| Variable | Local | Production |
|----------|-------|------------|
| `APP_DEBUG` | `true` | **`false`** |
| `APP_ENV` | `local` | `production` |
| `MIDTRANS_MODE` | `sandbox` | `production` |
| `MAIL_MAILER` | `smtp` (Mailtrap) | `smtp` (SMTP prod) |
| `MIDTRANS_SNAP_URL` | .sandbox. URL | prod URL (tanpa sandbox) |
| `LOG_LEVEL` | `debug` | `error` |
| `FRONTEND_URL` | `http://localhost:5173` | `https://kantinkita.com` |

---

## 6. Server Configuration

### 6.1 Nginx — Backend API

```nginx
# /etc/nginx/sites-available/kantinkita-api.conf

server {
    listen 80;
    server_name api.kantinkita.com;
    # HTTP → HTTPS redirect (aktifkan setelah SSL terpasang)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.kantinkita.com;

    root  /var/www/kantinkita-api/public;
    index index.php;

    # Upload limit (foto menu, dll)
    client_max_body_size 10M;

    # Security headers
    add_header X-Frame-Options      "SAMEORIGIN"  always;
    add_header X-Content-Type-Options "nosniff"   always;
    add_header X-XSS-Protection     "1; mode=block" always;
    add_header Referrer-Policy      "strict-origin-when-cross-origin" always;

    # Laravel: semua request ke index.php
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM handler
    location ~ \.php$ {
        fastcgi_pass  unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include       fastcgi_params;
        fastcgi_read_timeout 300;
    }

    # Blokir akses ke file tersembunyi
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types
        text/plain text/css application/json
        application/javascript text/xml application/xml
        application/xml+rss text/javascript;

    # SSL (Let's Encrypt via Certbot)
    ssl_certificate     /etc/letsencrypt/live/api.kantinkita.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.kantinkita.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
}
```

### 6.2 Nginx — Frontend SPA

```nginx
# /etc/nginx/sites-available/kantinkita-web.conf

server {
    listen 80;
    server_name kantinkita.com www.kantinkita.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kantinkita.com www.kantinkita.com;

    root  /var/www/kantinkita-web/dist;
    index index.html;

    # SPA fallback: semua route ke index.html (React Router handles routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache agresif untuk hashed assets (Vite add content hash ke filename)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip static
    gzip        on;
    gzip_static on;
    gzip_types
        text/plain text/css application/json
        application/javascript text/xml application/xml;

    ssl_certificate     /etc/letsencrypt/live/kantinkita.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kantinkita.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
}
```

---

## 7. Process Management (Supervisor)

```ini
# /etc/supervisor/conf.d/kantinkita.conf

# ── Queue Workers ──────────────────────────────────────
[program:kantinkita-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/kantinkita-api/artisan queue:work redis
        --sleep=3
        --tries=3
        --max-time=3600
        --queue=notifications,default
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/supervisor/kantinkita-worker.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
stopwaitsecs=3600

# ── Laravel Task Scheduler ─────────────────────────────
[program:kantinkita-scheduler]
process_name=%(program_name)s
command=php /var/www/kantinkita-api/artisan schedule:work
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/supervisor/kantinkita-scheduler.log
stdout_logfile_maxbytes=5MB
stdout_logfile_backups=3
```

**Supervisor Commands:**
```bash
# Reload konfigurasi setelah perubahan
sudo supervisorctl reread
sudo supervisorctl update

# Kelola workers
sudo supervisorctl start  kantinkita-worker:*
sudo supervisorctl stop   kantinkita-worker:*
sudo supervisorctl restart kantinkita-worker:*
sudo supervisorctl status

# Restart setelah deploy (wajib agar worker pakai kode baru)
php artisan queue:restart
```

**Scheduled Tasks (via scheduler):**

| Command | Jadwal | Fungsi |
|---------|--------|--------|
| `order:cancel-expired` | Setiap 5 menit | Cancel order expired |
| `backup:run --only-db` | 02:00 WIB | Backup database harian |
| `backup:run --only-files` | 02:30 WIB | Backup file uploads |
| `backup:clean` | 03:00 WIB | Hapus backup >30 hari |
| `error-log:cleanup` | Minggu 00:00 | Arsip error_logs lama |

---

## 8. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml

name: Deploy KantinKita

on:
  push:
    branches: [main]

jobs:
  # ── Job 1: Backend Tests ─────────────────────────────
  test-backend:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: kantinkita_test
        ports: ['3306:3306']
        options: --health-cmd="mysqladmin ping" --health-timeout=5s --health-retries=10
      redis:
        image: redis:7
        ports: ['6379:6379']
        options: --health-cmd="redis-cli ping" --health-retries=5

    steps:
      - uses: actions/checkout@v4

      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mbstring, xml, ctype, json, bcmath, pdo_mysql, redis
          coverage: none

      - name: Cache Composer
        uses: actions/cache@v4
        with:
          path: backend/vendor
          key: composer-${{ hashFiles('backend/composer.lock') }}

      - name: Install Dependencies
        run: composer install --no-interaction --prefer-dist --optimize-autoloader
        working-directory: ./backend

      - name: Setup Test Environment
        run: |
          cp .env.testing .env
          php artisan key:generate
          php artisan migrate --force
        working-directory: ./backend

      - name: Run Tests
        run: php artisan test --parallel --stop-on-failure
        working-directory: ./backend

  # ── Job 2: Frontend Build ────────────────────────────
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Build Production Bundle
        run: npm run build
        working-directory: ./frontend
        env:
          VITE_API_URL: ${{ secrets.PROD_API_URL }}
          VITE_PUSHER_APP_KEY: ${{ secrets.PROD_PUSHER_KEY }}
          VITE_PUSHER_APP_CLUSTER: ap1
          VITE_MIDTRANS_CLIENT_KEY: ${{ secrets.PROD_MIDTRANS_CLIENT_KEY }}
          VITE_MIDTRANS_SNAP_URL: https://app.midtrans.com/snap/snap.js

  # ── Job 3: Deploy (hanya jika test pass) ─────────────
  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Production Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host:     ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key:      ${{ secrets.SERVER_SSH_KEY }}
          port:     22
          timeout:  120s
          script: |
            set -e  # Hentikan jika ada perintah gagal

            echo "=== Deploy Backend ==="
            cd /var/www/kantinkita-api
            git pull origin main
            composer install --no-dev --optimize-autoloader
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            php artisan event:cache
            php artisan queue:restart
            sudo systemctl reload php8.3-fpm

            echo "=== Deploy Frontend ==="
            cd /var/www/kantinkita-web
            git pull origin main
            npm ci --omit=dev
            npm run build

            echo "=== Reload Nginx ==="
            sudo systemctl reload nginx

            echo "=== Deploy Selesai! ==="
```

**GitHub Secrets yang Dibutuhkan:**

| Secret | Deskripsi |
|--------|-----------|
| `SERVER_HOST` | IP / domain server produksi |
| `SERVER_USER` | SSH username (misal: `deploy`) |
| `SERVER_SSH_KEY` | SSH private key untuk akses server |
| `PROD_API_URL` | URL API produksi |
| `PROD_PUSHER_KEY` | Pusher App Key (production) |
| `PROD_MIDTRANS_CLIENT_KEY` | Midtrans Client Key (production) |

---

## 9. Database Seeder

### 9.1 User Accounts Default

| Email | Password | Role | Keterangan |
|-------|----------|------|------------|
| `admin@kantinkita.com` | `admin123` | admin | Platform super admin |
| `owner@kantinkita.com` | `owner123` | owner | Owner Kantin Barokah |
| `staff@kantinkita.com` | `staff123` | staff | Staff Kantin Barokah |
| `customer@kantinkita.com` | `customer123` | customer | Pelanggan demo |

> **PENTING:** Ganti semua password default sebelum go-live ke production, atau gunakan `php artisan db:seed` hanya di environment `local` / `testing`.

### 9.2 Tenant Default

```
Nama    : Kantin Barokah
Owner   : owner@kantinkita.com
Status  : Aktif & Buka
Min Order: Rp 10.000
Open Hours: 07:00 – 17:00 (Senin – Sabtu)
```

### 9.3 Categories

```
1. Makanan Berat
2. Minuman
3. Snack
4. Paket Hemat
```

### 9.4 Menu Items

| Nama | Harga | Kategori |
|------|-------|----------|
| Nasi Goreng Spesial | Rp 15.000 | Makanan Berat |
| Nasi Ayam Bakar | Rp 18.000 | Makanan Berat |
| Mie Ayam Bakso | Rp 12.000 | Makanan Berat |
| Nasi Uduk Komplit | Rp 16.000 | Makanan Berat |
| Es Teh Manis | Rp 5.000 | Minuman |
| Es Jeruk Peras | Rp 6.000 | Minuman |
| Jus Alpukat | Rp 8.000 | Minuman |
| Air Mineral | Rp 3.000 | Minuman |
| Gorengan (3pcs) | Rp 5.000 | Snack |
| Risoles Mayo | Rp 4.000 | Snack |
| Paket Nasi + Minum | Rp 18.000 | Paket Hemat |
| Paket Mie + Minum | Rp 15.000 | Paket Hemat |

### 9.5 System Settings Default

| Key | Value | Type | Group | Keterangan |
|-----|-------|------|-------|------------|
| `fee_type` | `percentage` | select | fee | Jenis biaya layanan |
| `fee_value` | `2` | float | fee | Nilai fee (dalam %) |
| `fee_label` | `Biaya Layanan` | string | fee | Label tampil di UI |
| `payment_timeout` | `30` | integer | payment | Menit sebelum order expired |
| `midtrans_mode` | `sandbox` | select | payment | Mode Midtrans |
| `notif_order_created` | `1` | boolean | notification | Notif saat order dibuat |
| `notif_order_paid` | `1` | boolean | notification | Notif saat order dibayar |
| `notif_order_processing` | `1` | boolean | notification | Notif saat diproses |
| `notif_order_completed` | `1` | boolean | notification | Notif saat selesai |
| `auto_cancel_minutes` | `30` | integer | order | Menit sebelum auto-cancel |
| `max_items_per_order` | `20` | integer | order | Max item per transaksi |
| `price_starter` | `99000` | integer | subscription | Harga paket Starter/bulan |
| `price_professional` | `299000` | integer | subscription | Harga paket Professional/bulan |
| `price_enterprise` | `799000` | integer | subscription | Harga paket Enterprise/bulan |
| `trial_days` | `14` | integer | subscription | Masa trial gratis |

---

## 10. Testing Specification

### 10.1 Konfigurasi Test Environment

```dotenv
# backend/.env.testing
APP_ENV=testing
DB_DATABASE=kantinkita_test
QUEUE_CONNECTION=sync       # Jalankan job sinkron saat testing
MAIL_MAILER=array           # Tangkap email, jangan kirim
BROADCAST_DRIVER=log        # Log broadcast, jangan kirim ke Pusher
CACHE_DRIVER=array          # In-memory cache
SESSION_DRIVER=array
```

```bash
# Jalankan semua test
php artisan test

# Jalankan paralel (lebih cepat)
php artisan test --parallel

# Jalankan hanya feature test
php artisan test --testsuite=Feature

# Jalankan test spesifik
php artisan test tests/Feature/AuthTest.php

# Hentikan pada kegagalan pertama
php artisan test --stop-on-failure
```

---

### 10.2 Feature Tests

#### `AuthTest.php`

```php
class AuthTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_register_successfully()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'username'              => 'johndoe',
            'full_name'             => 'John Doe',
            'email'                 => 'john@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['data' => ['token', 'user']]);
        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    }

    /** @test */
    public function user_can_login_successfully()
    {
        $user = User::factory()->create([
            'email'    => 'john@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    /** @test */
    public function login_fails_with_wrong_password()
    {
        User::factory()->create(['email' => 'john@example.com']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'john@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Email atau password salah.']);
    }

    /** @test */
    public function user_can_logout()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);
        $this->assertCount(0, $user->tokens);
    }

    /** @test */
    public function user_can_get_own_profile()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
                 ->assertJsonFragment(['email' => $user->email]);
    }

    /** @test */
    public function user_can_update_profile()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->putJson('/api/v1/auth/profile', [
                             'full_name' => 'Updated Name',
                             'phone'     => '081234567890',
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['full_name' => 'Updated Name']);
    }
}
```

#### `CustomerOrderTest.php`

```php
class CustomerOrderTest extends TestCase
{
    use RefreshDatabase;

    private User   $customer;
    private Tenant $tenant;
    private Menu   $menu;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customer = User::factory()->customer()->create();
        $this->tenant   = Tenant::factory()->create();
        $this->menu     = Menu::factory()
                              ->for($this->tenant)
                              ->create(['price' => 15000, 'is_available' => 1]);
    }

    /** @test */
    public function customer_can_checkout_successfully()
    {
        $response = $this->actingAs($this->customer, 'sanctum')
                         ->postJson('/api/v1/orders', [
                             'tenant_id' => $this->tenant->id,
                             'items'     => [
                                 ['menu_id' => $this->menu->id, 'quantity' => 2]
                             ],
                             'notes' => 'Tidak pedas',
                         ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'data' => [
                         'order_number', 'status',
                         'grand_total',  'snap_token'
                     ]
                 ]);

        $this->assertDatabaseHas('orders', [
            'user_id'  => $this->customer->id,
            'status'   => 'pending_payment',
        ]);
    }

    /** @test */
    public function checkout_fails_with_empty_items()
    {
        $response = $this->actingAs($this->customer, 'sanctum')
                         ->postJson('/api/v1/orders', [
                             'tenant_id' => $this->tenant->id,
                             'items'     => [],
                         ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function customer_can_view_own_order_history()
    {
        Order::factory()->count(3)->for($this->customer)->for($this->tenant)->create();

        $response = $this->actingAs($this->customer, 'sanctum')
                         ->getJson('/api/v1/orders');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function customer_cannot_view_other_customers_orders()
    {
        $otherCustomer = User::factory()->customer()->create();
        $order = Order::factory()->for($otherCustomer)->for($this->tenant)->create();

        $response = $this->actingAs($this->customer, 'sanctum')
                         ->getJson("/api/v1/orders/{$order->id}");

        $response->assertStatus(403);
    }
}
```

#### `StaffMenuTest.php`

```php
class StaffMenuTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function staff_can_create_menu()
    {
        $staff  = User::factory()->staff()->create();
        $tenant = Tenant::factory()->create();
        $tenant->staff()->attach($staff);
        $category = Category::factory()->for($tenant)->create();

        $response = $this->actingAs($staff, 'sanctum')
                         ->postJson('/api/v1/menus', [
                             'tenant_id'    => $tenant->id,
                             'category_id'  => $category->id,
                             'name'         => 'Nasi Goreng Baru',
                             'price'        => 15000,
                             'is_available' => 1,
                         ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('menus', ['name' => 'Nasi Goreng Baru']);
    }

    /** @test */
    public function staff_cannot_manage_menu_of_other_tenant()
    {
        $staff       = User::factory()->staff()->create();
        $otherTenant = Tenant::factory()->create();
        $menu        = Menu::factory()->for($otherTenant)->create();

        $response = $this->actingAs($staff, 'sanctum')
                         ->putJson("/api/v1/menus/{$menu->id}", [
                             'name' => 'Menu Diubah',
                         ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function staff_can_toggle_menu_availability()
    {
        $staff  = User::factory()->staff()->create();
        $tenant = Tenant::factory()->create();
        $tenant->staff()->attach($staff);
        $menu = Menu::factory()->for($tenant)->create(['is_available' => 1]);

        $response = $this->actingAs($staff, 'sanctum')
                         ->patchJson("/api/v1/menus/{$menu->id}/toggle");

        $response->assertStatus(200);
        $this->assertDatabaseHas('menus', [
            'id'           => $menu->id,
            'is_available' => 0,
        ]);
    }
}
```

#### `AdminTest.php`

```php
class AdminTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    /** @test */
    public function admin_can_list_all_tenants()
    {
        Tenant::factory()->count(5)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->getJson('/api/v1/tenants');

        $response->assertStatus(200)
                 ->assertJsonCount(5, 'data');
    }

    /** @test */
    public function admin_can_update_system_settings()
    {
        SystemSetting::factory()->create([
            'key'   => 'fee_value',
            'value' => '2',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->putJson('/api/v1/settings', [
                             'settings' => [
                                 ['key' => 'fee_value', 'value' => '3'],
                             ]
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('system_settings', [
            'key'   => 'fee_value',
            'value' => '3',
        ]);
    }

    /** @test */
    public function non_admin_cannot_access_admin_routes()
    {
        $owner = User::factory()->owner()->create();

        $response = $this->actingAs($owner, 'sanctum')
                         ->getJson('/api/v1/admin/settings');

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_create_backup()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
                         ->postJson('/api/v1/admin/backup');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data' => ['path', 'size', 'created_at']]);
    }
}
```

---

### 10.3 Unit Tests

#### `OrderServiceTest.php`

```php
class OrderServiceTest extends TestCase
{
    private OrderService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(OrderService::class);
    }

    /** @test */
    public function calculates_percentage_fee_correctly()
    {
        // fee_value = 2%, total = 100.000
        // expected fee = 2.000, grand_total = 102.000
        $result = $this->service->calculateFee(100000, 'percentage', 2);

        $this->assertEquals(2000,   $result['fee']);
        $this->assertEquals(102000, $result['grand_total']);
    }

    /** @test */
    public function calculates_fixed_fee_correctly()
    {
        // fee_value = 3.000 (fixed)
        // expected fee = 3.000, grand_total = 103.000
        $result = $this->service->calculateFee(100000, 'fixed', 3000);

        $this->assertEquals(3000,   $result['fee']);
        $this->assertEquals(103000, $result['grand_total']);
    }

    /** @test */
    public function validates_allowed_status_transitions()
    {
        // paid -> processing: allowed
        $this->assertTrue(
            $this->service->isValidStatusTransition('paid', 'processing')
        );

        // pending_payment -> completed: NOT allowed
        $this->assertFalse(
            $this->service->isValidStatusTransition('pending_payment', 'completed')
        );

        // completed -> processing: NOT allowed (no going back)
        $this->assertFalse(
            $this->service->isValidStatusTransition('completed', 'processing')
        );
    }

    /** @test */
    public function cancels_expired_orders()
    {
        $expiredOrder = Order::factory()->create([
            'status'     => 'pending_payment',
            'expires_at' => now()->subMinutes(35),
        ]);

        $activeOrder = Order::factory()->create([
            'status'     => 'pending_payment',
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->service->cancelExpiredOrders();

        $this->assertDatabaseHas('orders', [
            'id'     => $expiredOrder->id,
            'status' => 'expired',
        ]);
        $this->assertDatabaseHas('orders', [
            'id'     => $activeOrder->id,
            'status' => 'pending_payment',
        ]);
    }
}
```

#### `ReportServiceTest.php`

```php
class ReportServiceTest extends TestCase
{
    use RefreshDatabase;

    private ReportService $service;
    private Tenant        $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ReportService::class);
        $this->tenant  = Tenant::factory()->create();
    }

    /** @test */
    public function calculates_total_revenue_correctly()
    {
        Order::factory()->count(3)->for($this->tenant)->create([
            'status'      => 'completed',
            'grand_total' => 50000,
        ]);
        Order::factory()->for($this->tenant)->create([
            'status'      => 'cancelled', // tidak dihitung
            'grand_total' => 100000,
        ]);

        $revenue = $this->service->getTotalRevenue($this->tenant->id);

        $this->assertEquals(150000, $revenue);
    }

    /** @test */
    public function returns_top_menus_sorted_by_quantity()
    {
        $menu1 = Menu::factory()->for($this->tenant)->create(['name' => 'Nasi Goreng']);
        $menu2 = Menu::factory()->for($this->tenant)->create(['name' => 'Mie Ayam']);

        // Nasi Goreng sold 10x, Mie Ayam sold 5x
        OrderItem::factory()->count(10)->create(['menu_id' => $menu1->id, 'quantity' => 1]);
        OrderItem::factory()->count(5)->create(['menu_id'  => $menu2->id, 'quantity' => 1]);

        $topMenus = $this->service->getTopMenus($this->tenant->id, limit: 5);

        $this->assertEquals('Nasi Goreng', $topMenus->first()->name);
        $this->assertEquals(10,            $topMenus->first()->total_sold);
    }

    /** @test */
    public function generates_daily_chart_data_for_date_range()
    {
        $startDate = now()->subDays(6)->startOfDay();
        $endDate   = now()->endOfDay();

        $chartData = $this->service->getDailyChartData(
            $this->tenant->id, $startDate, $endDate
        );

        // Harus ada 7 entri (7 hari)
        $this->assertCount(7, $chartData);
        $this->assertArrayHasKey('date',    $chartData->first());
        $this->assertArrayHasKey('revenue', $chartData->first());
        $this->assertArrayHasKey('orders',  $chartData->first());
    }
}
```

### 10.4 Test Coverage Targets

| Area | Target Coverage |
|------|----------------|
| Service Layer | ≥ 90% |
| Controller Layer | ≥ 80% |
| Model & Repository | ≥ 70% |
| Overall | ≥ 75% |

```bash
# Generate HTML coverage report
php artisan test --coverage --min=75

# Generate laporan ke folder
XDEBUG_MODE=coverage php artisan test --coverage-html=storage/coverage
```

---

> **PENTING:** Dokumen ini harus dibaca bersama dengan `kantinkita_architecture.md`. Keduanya merupakan satu kesatuan dokumentasi teknis KantinKita.

---
*KantinKita Technical Specification v1.0.0 | April 2026*
