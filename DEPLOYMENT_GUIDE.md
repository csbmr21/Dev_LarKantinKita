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
2. Click **"CREATE PROJECT"** → Name: `kantinkita-sandbox`
3. Wait for project creation (~30 seconds)
4. In top bar, verify project is selected: `kantinkita-sandbox`

### Step 2: Enable Required APIs
1. Click **"+ ENABLE APIS AND SERVICES"**
2. Search for: `Gmail API`
3. Click **"Enable"**
4. Search for: `People API`
5. Click **"Enable"**

### Step 3: Configure OAuth Consent Screen
1. Click **"OAuth consent screen"** in left menu
2. User type: **"External"** → Click **"Create"**
3. Fill in:
   - **App name**: `KantinKita Sandbox`
   - **User support email**: `pangestu5711@gmail.com`
   - **App logo** (optional): Skip
   - **Application home page**: Leave blank
   - **Application privacy policy link**: Leave blank
   - **Application terms of service link**: Leave blank
   - **Authorized domains**: 
     - `vercel.app`
     - `railway.app`
   - **Developer contact information**: `pangestu5711@gmail.com`
4. Click **"Save and Continue"**
5. Add scopes:
   - Click **"Add scopes"**
   - Check: `https://www.googleapis.com/auth/gmail.send`
   - Click **"Update"** then **"Save and Continue"**
6. Add test users:
   - Click **"Add users"**
   - Add: `pangestu5711@gmail.com`
   - Click **"Add"** then **"Save and Continue"**
7. Review summary → Click **"Back to dashboard"**

### Step 4: Create OAuth 2.0 Credentials
1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Application type: **"Web application"**
3. Name: `KantinKita Sandbox OAuth`
4. Add authorized redirect URIs:

#### Backend (Railway)
```
https://devlarkantinkita-sandbox.up.railway.app/auth/google/callback
https://devlarkantinkita-sandbox.up.railway.app/api/v1/auth/google/gmail-callback
```

#### Frontend (Vercel) - Optional
```
https://kksandbox.vercel.app/auth/callback
```

#### Local Development
```
http://localhost:5173/auth/callback
http://localhost:8000/auth/google/callback
```

5. Click **"Create"**

### Step 5: Copy OAuth Credentials
You'll see:
```
Client ID: 123456789-abc123xyz789.apps.googleusercontent.com
Client Secret: GOCSPX-abc123xyz789
```

**IMPORTANT**: Copy both values - you'll need them for Railway and Vercel environment variables.

**DO NOT close this window yet** - you need to generate Gmail API refresh token.

---

## Phase 4b: Gmail App Password Creation (Alternative to OAuth)

### Option A: Use OAuth 2.0 (Recommended for Production)
Follow Steps 1-5 above. This is more secure and production-ready.

### Option B: Use Gmail App Password (Simpler for Testing)
If OAuth setup is too complex, use app password:

#### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Under **"Signing in to Google"**, click **"2-Step Verification"**
3. Click **"Get Started"**
4. Follow prompts to set up phone number
5. Verify by entering code sent to your phone
6. Complete setup

#### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
   - If you don't see it, go to **"Security"** → **"2-Step Verification"** → scroll to **"App passwords"**
2. Under **"Select app"**, choose: **"Mail"**
3. Under **"Select device"**, choose: **"Other (Custom name)"**
4. Name: `KantinKita Sandbox`
5. Click **"Generate"**
6. Copy the 16-character password (format: `abcd efgh ijkl mnop`)
7. **Store this securely** - you'll need it for Railway `GOOGLE_CLIENT_SECRET`

#### Step 3: Configure Environment Variables
For app password, use these values:
```
GOOGLE_CLIENT_ID=your-google-client-id (can be any string for app password)
GOOGLE_CLIENT_SECRET=abcd efgh ijkl mnop (the 16-char app password)
GOOGLE_REDIRECT_URI=https://devlarkantinkita-sandbox.up.railway.app/auth/google/callback
GOOGLE_GMAIL_REDIRECT_URI=https://devlarkantinkita-sandbox.up.railway.app/api/v1/auth/google/gmail-redirect
```

**Note**: For app password, `GOOGLE_CLIENT_ID` can be any string (not used for auth). The actual authentication uses the app password in `GOOGLE_CLIENT_SECRET`.

---

## Phase 4c: Get Gmail API Refresh Token (OAuth Flow)

### Step 1: Initialize OAuth Flow
1. Open: `https://devlarkantinkita-sandbox.up.railway.app/api/v1/auth/google/gmail-redirect`
2. Sign in with `pangestu5711@gmail.com`
3. Grant permissions:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
4. You'll see success page with:
   ```
   Refresh Token: 1//0dX... (long string)
   ```

### Step 2: Copy Refresh Token
1. **Copy the full refresh token** (starts with `1//0dX...`)
2. Go to Railway Dashboard → Variables
3. Add variable:
   - Key: `GOOGLE_REFRESH_TOKEN`
   - Value: [paste your refresh token]
4. Click **"Update Variable"**

### Step 3: Verify Configuration
1. In Railway Dashboard → Variables, verify all variables are set:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `MAIL_MAILER=gmail-api`
2. Click **"Deploy latest commit"** to restart backend
3. Wait for deployment (~2 minutes)

---

## Phase 5: Direct MySQL Connection to Railway

### Option A: Using MySQL Workbench (Recommended for GUI Users)

#### Step 1: Install MySQL Workbench
1. Download: https://dev.mysql.com/downloads/workbench/
2. Install for Windows
3. Launch MySQL Workbench

#### Step 2: Get Railway MySQL Connection Details
1. In Railway Dashboard → your project → **MySQL** service
2. Click **"Connect"**
3. Click **"Connection Strings"**
4. Copy **"Direct Connection"** values:
   ```
   Host: roundhouse.proxy.railway.app
   Port: 56348
   User: railway
   Password: [your-password]
   Database: railway
   SSL: Required
   ```

#### Step 3: Create New Connection in MySQL Workbench
1. Click **"+ Add Connection"**
2. Configuration:
   - **Connection Name**: `Railway MySQL - KantinKita`
   - **Connection Method**: Standard TCP
   - **Hostname**: `roundhouse.proxy.railway.app`
   - **Port**: `56348`
   - **Username**: `railway`
   - **Password**: Click **"Store in Keychain"** → paste Railway password
3. Click **"Test Connection"**
4. Should show: **"Connection successful"**
5. Click **"OK"**

#### Step 4: Import Database
1. Double-click your connection to connect
2. In top menu: **File** → **Run SQL Script**
3. Select your SQL file: `kantinkita_db_export.sql`
4. Click **"Execute"** (yellow bolt icon)
5. Wait for completion (~1-2 minutes)
6. Check **"Output"** tab for success message

#### Step 5: Verify Import
1. In **"Schemas"** sidebar, click **"Refresh"**
2. You should see: `railway` database
3. Right-click `railway` → **"Set as Default Schema"**
4. Click **"Tables"** → should see all tables (users, menus, orders, etc.)

---

### Option B: Using Command Line (For Advanced Users)

#### Step 1: Get Railway MySQL Credentials
```bash
# In Railway Dashboard → MySQL → Connect → Connection Strings
# Copy these values:
HOST=roundhouse.proxy.railway.app
PORT=56348
USER=railway
PASSWORD=[your-password-from-railway]
DATABASE=railway
```

#### Step 2: Connect via MySQL Client
```bash
# Windows (PowerShell)
mysql -h roundhouse.proxy.railway.app -P 56348 -u railway -p railway < kantinkita_db_export.sql

# Or interactive connection
mysql -h roundhouse.proxy.railway.app -P 56348 -u railway -p
# Then in MySQL:
USE railway;
SOURCE kantinkita_db_export.sql;
```

#### Step 3: Verify Import
```sql
SHOW DATABASES;
USE railway;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM menus;
```

---

### Option C: Using Database GUI Tools (DBeaver, TablePlus, etc.)

#### DBeaver Example:
1. Open DBeaver → **Database** → **Create** → **MySQL**
2. Connection settings:
   - Host: `roundhouse.proxy.railway.app`
   - Port: `56348`
   - Database: `railway`
   - Username: `railway`
   - Password: [paste from Railway]
3. Click **"Test Connection"**
4. After success, right-click connection → **"Run SQL"**
5. Open your SQL file → Execute

#### TablePlus Example:
1. Open TablePlus → **+** to add connection
2. Select **MySQL**
3. Fill in:
   - Host: `roundhouse.proxy.railway.app`
   - Port: `56348`
   - Username: `railway`
   - Password: [paste from Railway]
   - Database: `railway`
4. Click **"Connect"**
5. Click **"Query"** tab → Open SQL file → Execute

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
---

## Phase 8: ChatGPT Prompt Template

### Prompt for Deployment Assistance
Copy and paste this prompt to ChatGPT or any AI assistant for deployment help:

```
You are an expert DevOps engineer specializing in Laravel, React, Railway, and Vercel deployments.

I need to deploy a full-stack application with the following architecture:
- Backend: Laravel API (in folder `kantinkita-api`)
- Frontend: React + Vite (in root folder)
- Database: MySQL on Railway (Free tier, 100MB)
- Hosting: Railway for backend, Vercel for frontend
- Authentication: Google OAuth with Gmail API for OTP emails

Current environment details:
- Railway project name: `kantinkita-sandbox`
- Backend URL: https://devlarkantinkita-sandbox.up.railway.app
- Frontend URL: https://kksandbox.vercel.app
- Email: pangestu5711@gmail.com

Please help me with the following steps:

1. Create a comprehensive deployment checklist for Railway and Vercel
2. Provide step-by-step instructions for:
   - Setting up MySQL on Railway
   - Importing local database to Railway MySQL (using MySQL Workbench)
   - Configuring Gmail API for OTP email sending
   - Setting up Google OAuth 2.0 credentials
   - Configuring environment variables on both platforms

3. Provide the exact commands and configuration files needed:
   - Laravel `.env` for production
   - Vercel environment variables
   - Gmail transport configuration

4. Help troubleshoot common issues:
   - Database connection errors
   - Gmail API "unsupported mail transport" errors
   - CORS errors between frontend and backend
   - Storage path issues

Please be very specific with:
- Exact command-line instructions
- File paths
- Configuration file contents
- Railway/Vercel dashboard navigation steps

Return all information in a well-structured markdown format.
```

### Prompt for Bug Fixing
If you encounter issues after deployment:

```
I deployed my Laravel + React application to Railway (backend) and Vercel (frontend).

Context:
- Backend: https://devlarkantinkita-sandbox.up.railway.app
- Frontend: https://kksandbox.vercel.app
- Database: Railway MySQL
- Authentication: Google OAuth with OTP via Gmail API

Problem: [Describe your issue clearly]

Error logs:
[Copy relevant error messages]

I've already tried:
[Describe what you've attempted]

Please help me:
1. Diagnose the root cause
2. Provide step-by-step fix instructions
3. Verify the fix works

Include specific commands, file edits, and Railway/Vercel settings changes.
```

### Prompt for Database Migration
```
I need to migrate my local MySQL database to Railway.

Current setup:
- Local database name: `kantinkita_db`
- Export file: `kantinkita_db_export.sql`
- Railway MySQL host: `roundhouse.proxy.railway.app`
- Railway MySQL port: `56348`
- Railway MySQL user: `railway`

Please provide:
1. Step-by-step instructions to connect to Railway MySQL using MySQL Workbench
2. Command to import the SQL file
3. Verification queries to confirm import success
4. Laravel `.env` configuration for Railway MySQL

Include troubleshooting for common connection errors.
```

---

## Appendix: Quick Reference

### Railway Variables Checklist
- [ ] `APP_KEY` (generated with `php artisan key:generate`)
- [ ] `APP_URL` (`https://devlarkantinkita-sandbox.up.railway.app`)
- [ ] `APP_ENV` (`production`)
- [ ] `APP_DEBUG` (`false`)
- [ ] `DB_CONNECTION` (`mysql`)
- [ ] `DB_HOST` (auto-provided by Railway)
- [ ] `DB_PORT` (auto-provided by Railway)
- [ ] `DB_DATABASE` (auto-provided by Railway)
- [ ] `DB_USERNAME` (auto-provided by Railway)
- [ ] `DB_PASSWORD` (auto-provided by Railway)
- [ ] `FRONTEND_URL` (`https://kksandbox.vercel.app`)
- [ ] `MAIL_MAILER` (`gmail-api`)
- [ ] `MAIL_FROM_ADDRESS` (`pangestu5711@gmail.com`)
- [ ] `GOOGLE_CLIENT_ID` (from Google Cloud Console)
- [ ] `GOOGLE_CLIENT_SECRET` (from Google Cloud Console or app password)
- [ ] `GOOGLE_REFRESH_TOKEN` (generated via OAuth flow)
- [ ] `QUEUE_CONNECTION` (`sync`)

### Vercel Environment Variables Checklist
- [ ] `VITE_API_BASE_URL` (`https://devlarkantinkita-sandbox.up.railway.app/api/v1`)
- [ ] `VITE_GOOGLE_CLIENT_ID` (from Google Cloud Console)
- [ ] `VITE_APP_NAME` (`KantinKita Sandbox`)
- [ ] `VITE_APP_URL` (`https://kksandbox.vercel.app`)

### Gmail API Setup Checklist
- [ ] Created Google Cloud project: `kantinkita-sandbox`
- [ ] Enabled Gmail API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 credentials
- [ ] Added authorized redirect URIs
- [ ] Generated refresh token
- [ ] Stored refresh token in Railway variables

### Testing Checklist
- [ ] Backend health check: `/api/v1/up`
- [ ] Database connection: Run any API endpoint that queries database
- [ ] Google OAuth login: Attempt login with `pangestu5711@gmail.com`
- [ ] OTP email delivery: Check inbox (and spam folder)
- [ ] Frontend-backend integration: Test user profile, orders, menus
- [ ] File storage: Upload and view profile picture

---

**Last Updated**: 2026-06-26
**Version**: 1.0
**Maintainer**: Dev Team