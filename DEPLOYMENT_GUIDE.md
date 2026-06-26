# Deployment Guide - KantinKita Sandbox

## Overview
Deploying full-stack application with:
- **Database & Backend**: Railway (MySQL + Laravel API)
- **Frontend**: Vercel (React + Vite)

---

## Phase 1: Database Deployment (Railway)

### Step 1: Create Railway Project
1. Go to https://railway.app
2. Sign in / Sign up
3. Click **"New Project"**
4. Name: `kantinkita-sandbox`
5. Region: Asia Pacific (Singapore) - closest to Indonesia

### Step 2: Add MySQL Database
1. In Railway Dashboard, click **"+ Add Database"**
2. Select **MySQL**
3. Choose plan: **Free** (100 MB storage)
4. Railway will auto-generate connection string

### Step 3: Export Database from Local
On your local machine (Windows):
```bash
cd "d:\Kampus\New folder\Dev_LarKantinKita\kantinkita-api"

# Method 1: Using mysqldump
mysqldump -u root -p kantinkita_db > kantinkita_db_export.sql

# Method 2: Using phpMyAdmin
# - Go to http://localhost/phpmyadmin
# - Select kantinkita_db
# - Click Export tab
# - Choose "Quick" method, format: SQL
# - Download the file
```

### Step 4: Import Database to Railway

#### Option A: Using Railway CLI (Recommended)
```bash
# Install Railway CLI if not installed
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run SQL import
cat kantinkita_db_export.sql | railway run mysql -h $RAILWAY_MYSQL_HOST -P $RAILWAY_MYSQL_PORT -u $RAILWAY_MYSQL_USERNAME -p$RAILWAY_MYSQL_PASSWORD kantinkita_db
```

#### Option B: Using phpMyAdmin (if Railway provides)
1. In Railway Dashboard, go to your MySQL service
2. Click **"Connect"** → **"phpMyAdmin"**
3. Import your SQL file

#### Option C: Using MySQL Workbench
1. Open MySQL Workbench
2. Create new connection with Railway MySQL credentials:
   - Hostname: [from Railway Variables]
   - Port: [from Railway Variables]
   - Username: [from Railway Variables]
   - Password: [from Railway Variables]
3. Create database: `kantinkita_db`
4. Run SQL file: File → Run SQL Script

### Step 5: Run Migrations (if needed)
If database is empty or you want to use migrations:
```bash
cd "d:\Kampus\New folder\Dev_LarKantinKita\kantinkita-api"

# Set environment variables
set DB_CONNECTION=mysql
set DB_HOST=your-railway-mysql-host
set DB_PORT=3306
set DB_DATABASE=kantinkita_db
set DB_USERNAME=your-username
set DB_PASSWORD=your-password

# Run migrations
php artisan migrate --force

# Run seeders (if you have roles & permissions)
php artisan db:seed --class=RolePermissionSeeder
```

---

## Phase 2: Backend Deployment (Railway)

### Step 1: Prepare Backend for Production

#### Create `.env` for Production
```env
# Copy from .env.example or create new
APP_NAME="KantinKita Sandbox"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://devlarkantinkita-sandbox.up.railway.app

# Database (will be auto-filled by Railway)
DB_CONNECTION=mysql
DB_HOST=railway-mysql-host
DB_PORT=3306
DB_DATABASE=kantinkita_db
DB_USERNAME=railway-username
DB_PASSWORD=railway-password

# Frontend URL (Vercel)
FRONTEND_URL=https://kksandbox.vercel.app

# Mail Configuration (Gmail API)
MAIL_MAILER=gmail-api
MAIL_FROM_ADDRESS=pangestu5711@gmail.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_REDIRECT_URI=https://devlarkantinkita-sandbox.up.railway.app/auth/google/callback
GOOGLE_GMAIL_REDIRECT_URI=https://devlarkantinkita-sandbox.up.railway.app/api/v1/auth/google/gmail-redirect

# Queue (use sync for no queue worker)
QUEUE_CONNECTION=sync

# Storage
FILESYSTEM_DISK=public
```

#### Generate App Key
```bash
php artisan key:generate --show
# Copy the generated key
```

### Step 2: Push Code to GitHub
```bash
cd "d:\Kampus\New folder\Dev_LarKantinKita"

# Check status
git status

# Add all changes
git add -A

# Commit
git commit -m "feat: ready for production deployment"

# Push to main branch
git push origin main
```

### Step 3: Deploy Backend to Railway

#### Option A: Deploy from GitHub (Recommended)
1. In Railway Dashboard, click **"New"** → **"Project"**
2. Connect to GitHub repository
3. Select `Dev_LarKantinKita` → `kantinkita-api` folder
4. Railway will auto-detect Laravel
5. Wait for deployment to complete (~2-5 minutes)

#### Option B: Deploy from CLI
```bash
cd "d:\Kampus\New folder\Dev_LarKantinKita\kantinkita-api"
railway up
```

### Step 4: Set Railway Variables
In Railway Dashboard → Variables:

| Key | Value |
|-----|-------|
| `APP_KEY` | [from step 1] |
| `APP_URL` | `https://devlarkantinkita-sandbox.up.railway.app` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | [Railway auto-provided] |
| `DB_PORT` | [Railway auto-provided] |
| `DB_DATABASE` | [Railway auto-provided] |
| `DB_USERNAME` | [Railway auto-provided] |
| `DB_PASSWORD` | [Railway auto-provided] |
| `FRONTEND_URL` | `https://kksandbox.vercel.app` |
| `MAIL_MAILER` | `gmail-api` |
| `MAIL_FROM_ADDRESS` | `pangestu5711@gmail.com` |
| `GOOGLE_CLIENT_ID` | [your Google Cloud Client ID] |
| `GOOGLE_CLIENT_SECRET` | [your Google Cloud Client Secret] |
| `GOOGLE_REFRESH_TOKEN` | [your Gmail API refresh token] |
| `QUEUE_CONNECTION` | `sync` |

### Step 5: Create Storage Link
```bash
# In Railway, run command:
php artisan storage:link
```

### Step 6: Test Backend
```
https://devlarkantinkita-sandbox.up.railway.app/api/v1/up
```

Expected response:
```json
{
  "message": "OK",
  "timestamp": "2024-06-26T..."
}
```

---

## Phase 3: Frontend Deployment (Vercel)

### Step 1: Update Frontend Environment
In `vite.config.js` or create `.env.production`:
```env
VITE_API_BASE_URL=https://devlarkantinkita-sandbox.up.railway.app/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APP_NAME="KantinKita Sandbox"
VITE_APP_URL=https://kksandbox.vercel.app
```

### Step 2: Build Frontend
```bash
cd "d:\Kampus\New folder\Dev_LarKantinKita"

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 3: Deploy to Vercel

#### Option A: Deploy from GitHub (Recommended)
1. Go to https://vercel.com
2. Sign in
3. Click **"Add New..."** → **"Project"**
4. Import from GitHub
5. Select `Dev_LarKantinKita` repository
6. Configure:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### Option B: Deploy from CLI
```bash
cd "d:\Kampus\New folder\Dev_LarKantinKita"

# Install Vercel CLI if not installed
npm install -g vercel

# Deploy
vercel --prod
```

### Step 4: Set Vercel Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_BASE_URL` | `https://devlarkantinkita-sandbox.up.railway.app/api/v1` | Production |
| `VITE_GOOGLE_CLIENT_ID` | [your Google Cloud Client ID] | Production |
| `VITE_APP_NAME` | `KantinKita Sandbox` | Production |
| `VITE_APP_URL` | `https://kksandbox.vercel.app` | Production |

### Step 5: Configure Google OAuth in Vercel
If using Vercel Auth (optional):
1. In Vercel Dashboard → Authentication
2. Add Google provider
3. Set redirect URL to: `https://kksandbox.vercel.app/auth/callback`

---

## Phase 4: Google Cloud Configuration

### Step 1: Create OAuth 2.0 Credentials
1. Go to https://console.cloud.google.com/apis/credentials
2. Create new project: `kantinkita-sandbox`
3. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
4. Application type: **Web application**

### Step 2: Configure Authorized Redirect URIs

#### Backend (Railway)
```
https://devlarkantinkita-sandbox.up.railway.app/auth/google/callback
https://devlarkantinkita-sandbox.up.railway.app/api/v1/auth/google/gmail-callback
```

#### Frontend (Vercel) - Optional
```
https://kksandbox.vercel.app/auth/callback
```

### Step 3: Configure JavaScript Origins
```
https://kksandbox.vercel.app
https://devlarkantinkita-sandbox.up.railway.app
http://localhost:5173
```

### Step 4: Get Gmail API Refresh Token
1. Open: `https://devlarkantinkita-sandbox.up.railway.app/api/v1/auth/google/gmail-redirect`
2. Sign in with `pangestu5711@gmail.com`
3. Grant permissions:
   - `https://www.googleapis.com/auth/gmail.send`
4. Copy the refresh token from the success page
5. Paste into Railway variable `GOOGLE_REFRESH_TOKEN`

---

## Phase 5: Final Testing

### Test 1: Backend API
```bash
# Test health check
curl https://devlarkantinkita-sandbox.up.railway.app/api/v1/up

# Test email (if configured)
curl "https://devlarkantinkita-sandbox.up.railway.app/api/v1/auth/test-email?email=pangestu5711@gmail.com"
```

### Test 2: Frontend
1. Open: `https://kksandbox.vercel.app`
2. Try login with credentials:
   - Email: `admin@kantinkita.com`
   - Password: `password`
3. Try Google OAuth login

### Test 3: OTP Email
1. Login with Google OAuth
2. Check if OTP email arrives in `pangestu5711@gmail.com`
3. If not, check Railway logs for Gmail API errors

---

## Phase 6: Common Issues & Solutions

### Issue 1: Database Connection Failed
**Solution:**
- Check Railway database credentials
- Ensure database is imported correctly
- Verify DB_HOST, DB_PORT, DB_DATABASE match Railway variables

### Issue 2: Gmail API Error
**Solution:**
- Verify `GOOGLE_REFRESH_TOKEN` is correct
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match
- Ensure Gmail API is enabled in Google Cloud Console

### Issue 3: CORS Errors
**Solution:**
- Add frontend URL to `ALLOWED_ORIGINS` in backend
- Ensure `FRONTEND_URL` in Railway matches Vercel URL

### Issue 4: Storage Path Not Found
**Solution:**
- Run `php artisan storage:link`
- Check `storage/app/public` exists and is writable

---

## Phase 7: Maintenance

### Daily Backup (Optional)
```bash
# Auto-backup MySQL to Railway storage
railway run mysqldump -h $RAILWAY_MYSQL_HOST -P $RAILWAY_MYSQL_PORT -u $RAILWAY_MYSQL_USERNAME -p$RAILWAY_MYSQL_PASSWORD kantinkita_db > backup_$(date +%Y%m%d).sql
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Deploy to Railway
cd kantinkita-api
railway up

# Deploy to Vercel
cd ..
vercel --prod
```

---

## Summary

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | https://kksandbox.vercel.app | Deploy |
| Backend API | https://devlarkantinkita-sandbox.up.railway.app/api/v1 | Deploy |
| Database | Railway MySQL (auto-provisioned) | Deploy |
| Google OAuth | Configured in Google Cloud Console | Config |
| Gmail API | Configured with refresh token | Config |

**Total Deployment Time**: ~30-45 minutes