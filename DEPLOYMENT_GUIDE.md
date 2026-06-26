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

## Phase 9: ChatGPT Prompts for Development

### 9.1 UI React Development Prompts

#### Prompt 1: Create React Component from Design
```
You are an expert React developer specializing in Vite, TypeScript, Tailwind CSS, and React Query.

Create a complete React component with the following requirements:

**Component**: [Describe component, e.g., "Order Management Table"]

**Features**:
- [List features, e.g., "Show order list with filtering, sorting, status badges"]

**Data Sources**:
- [API endpoints, e.g., "GET /api/v1/orders", "GET /api/v1/menus"]

**UI Requirements**:
- Use Tailwind CSS for styling
- TypeScript for type safety
- React Query for data fetching
- React Router for navigation if needed
- Toast notifications for user feedback

**Context**: [Any additional context about the component]

Please provide:
1. Complete TypeScript component file
2. API hook if needed (using React Query)
3. Type definitions
4. Error handling
5. Loading states

Return the complete code in a markdown code block.
```

#### Prompt 2: Fix React Component Issues
```
I have a React component that is not working correctly.

**Component File**: [file path]

**Issue**: [Describe the problem clearly]

**Code**:
[Provide relevant code section]

**Error Message**: [Any error from console or terminal]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

Please help me:
1. Identify the root cause
2. Provide step-by-step fix
3. Include corrected code
4. Explain what was wrong

Include specific line numbers and code changes.
```

#### Prompt 3: Optimize React Performance
```
I need to optimize the performance of my React application.

**Context**:
- Application: [Describe app, e.g., "LarKantinKita - food ordering system"]
- Pages with issues: [List pages]
- Symptoms: [Slow rendering, re-renders, etc.]

**Technology Stack**:
- React 18
- TypeScript
- Vite
- React Query
- Zustand (state management)

Please provide:
1. Performance profiling steps
2. Common optimization techniques for React
3. Specific code improvements for my app
4. React Query optimization tips
5. Component memoization suggestions

Include code examples for each optimization.
```

---

### 9.2 Laravel API Development Prompts

#### Prompt 1: Create Laravel API Endpoint
```
You are an expert Laravel backend developer.

Create a complete Laravel API endpoint with the following requirements:

**Endpoint**: [HTTP Method + Path, e.g., "POST /api/v1/orders"]

**Purpose**: [What it does, e.g., "Create new customer order"]

**Request Body**:
- [List fields with types, e.g., "items: array, notes: string, payment_method: string"]

**Response**:
- [Expected response structure]

**Authentication**: [Bearer token, role requirements]

**Validation Rules**: [Specific rules for each field]

**Database Tables**: [Which tables are affected]

Please provide:
1. Route definition (in routes/api.php)
2. Controller method
3. Request validation class
4. Resource class for response formatting
5. Any model relationships needed
6. Error handling

Include complete code with namespaces and imports.
```

#### Prompt 2: Fix Laravel Database Issues
```
I'm having database issues in my Laravel application.

**Problem**: [Describe the issue, e.g., "Migration fails with foreign key constraint"]

**Error Message**: [Full error from console]

**Relevant Files**:
- [List migration files, models, controllers]

**Current Setup**:
- Laravel version: [e.g., 10.x]
- Database: MySQL
- PHP version: [e.g., 8.2]

**What I've Tried**: [List attempts to fix]

Please help me:
1. Identify the root cause
2. Provide corrected migration code if needed
3. Fix any model relationship issues
4. Provide rollback and re-run commands
5. Verification steps

Include specific artisan commands and file contents.
```

#### Prompt 3: Optimize Laravel Queries
```
I need to optimize database queries in my Laravel application.

**Context**:
- Application: Laravel API for food ordering
- Common issue: N+1 query problem
- Slow endpoints: [List endpoints]

**Technology Stack**:
- Laravel 10.x
- MySQL
- PHP 8.2

Please provide:
1. How to identify N+1 queries (using Laravel Debugbar)
2. Eager loading examples with `with()`
3. Lazy loading vs eager loading tradeoffs
4. Query optimization techniques
5. Database indexing recommendations

Include specific code examples for common Laravel patterns like:
- Loading relationships
- Custom query scopes
- Database transactions
```

---

### 9.3 Database Schema Design Prompts

#### Prompt 1: Design Database Schema from Requirements
```
You are an expert database designer specializing in MySQL and Laravel Eloquent.

Design a complete database schema for:

**Application**: [Describe app, e.g., "Food ordering system for school canteens"]

**Requirements**:
- [List requirements, e.g., "Multiple tenants, menus, orders, payments"]

**Entities**:
- [List main entities, e.g., "Users, Tenants, Menus, Orders, OrderItems, Payments"]

Please provide:
1. Entity Relationship Diagram (in text/mermaid format)
2. Complete MySQL CREATE TABLE statements
3. Laravel migration files
4. Eloquent model definitions
5. Relationships (hasOne, belongsTo, many-to-many, etc.)
6. Index recommendations
7. Soft deletes where appropriate

Include:
- Primary keys (UUID or auto-increment)
- Foreign key constraints
- Timestamps
- Soft deletes (deleted_at)
- Common fields (status, is_active, etc.)
```

#### Prompt 2: Fix Database Migration Issues
```
I'm having issues with my Laravel database migrations.

**Problem**: [Describe issue, e.g., "Migration order is wrong", "Duplicate key"]

**Error Message**: [Full error]

**Migration Files**: [List affected migration files]

**Current State**:
- Latest migration: [name]
- Database version: [number]

**What I Want**: [What should happen]

Please help me:
1. Identify migration order issues
2. Fix any syntax errors
3. Provide rollback command
4. Provide re-run command
5. Verify migration was successful

Include specific artisan commands and corrected migration code.
```

---

### 9.4 **Prompt for User Manual PDF Generation**

#### **Comprehensive User Manual for Web Application**

```
You are an expert technical writer specializing in creating comprehensive user manuals for web applications.

I need you to create a complete, professional **User Manual in PDF format** for my web application with the following details:

---

**Application Details:**
- **Name**: KantinKita (Kantin Management System)
- **Type**: Multi-tenant Food Ordering Platform for School/Campus Canteens
- **Technology**: Laravel (Backend) + React + Vite (Frontend)
- **URL**: https://kksandbox.vercel.app
- **API**: https://devlarkantinkita-sandbox.up.railway.app/api/v1

---

**User Roles:**
1. **Admin** - System administrator (super admin)
2. **Owner/Merchant** - Kantin/tenant owner
3. **Staff** - Kantin staff (cashier/kitchen)
4. **Customer** - Students/users who order food

---

**Application Features by Role:**

### **Admin Features:**
- Dashboard with system overview
- User management (CRUD users)
- Tenant management (CRUD kantin/merchants)
- Role & permission management
- Subscription management
- System settings
- Audit logs & activity monitoring
- Backup & restore database
- Error log monitoring
- Impersonation (login as other user)

### **Owner/Merchant Features:**
- Dashboard with sales analytics
- Menu management (CRUD menus, categories)
- Staff management (add/remove staff)
- Order management (view all orders, refunds)
- Sales reports (daily, weekly, monthly)
- Tenant profile settings (logo, open hours, etc.)
- Subscription status

### **Staff Features:**
- Dashboard with pending orders
- Order processing (kanban board: Pending → Processing → Ready → Completed)
- Realtime order notifications (Pusher)
- POS (Point of Sale) - cashier mode untuk order manual
- Menu availability toggle (stock on/off)
- Order history

### **Customer Features:**
- Browse all kantin/tenants
- Browse menus by kantin
- Add to cart (with server sync)
- Checkout with Midtrans payment gateway
- Google OAuth login
- OTP verification via email (Gmail API)
- Order tracking (status updates)
- Order history
- Favorite kantin
- Profile settings

---

**Specific Instructions for the Manual:**

1. **Structure & Format**:
   - Create a professional PDF-ready markdown document
   - Include Table of Contents with page numbers
   - Use clear section headings (H1, H2, H3)
   - Add numbered steps for each procedure
   - Include placeholders for screenshots: `[Screenshot: Description]`
   - Use tables for feature comparisons or checklists

2. **Content to Include**:
   
   **A. Introduction Section:**
   - Welcome message
   - About KantinKita
   - Who should use this manual
   - System requirements (browser, device)
   - Glossary of terms
   
   **B. Getting Started:**
   - How to access the application
   - Registration process (Google OAuth)
   - OTP verification
   - First-time login
   - Password reset (if applicable)
   - User interface overview
   
   **C. User Guides by Role:**
   For each role, create detailed step-by-step guides:
   
   **Admin Guide:**
   - How to access admin panel
   - How to create/edit/delete users
   - How to manage tenants (approve/suspend)
   - How to assign roles & permissions
   - How to view audit logs
   - How to impersonate users
   - How to backup database
   
   **Owner/Merchant Guide:**
   - How to set up your kantin profile
   - How to add/edit/delete menus
   - How to manage categories
   - How to add staff members
   - How to process orders
   - How to handle refunds
   - How to view sales reports
   - How to update subscription
   
   **Staff Guide:**
   - How to login and access staff dashboard
   - How to view pending orders
   - How to process orders (drag-and-drop kanban)
   - How to use POS for manual orders
   - How to mark menu as sold out
   - How to complete orders
   
   **Customer Guide:**
   - How to browse kantin
   - How to search menus
   - How to add items to cart
   - How to checkout
   - How to pay with Midtrans (QRIS, Virtual Account, etc.)
   - How to track order status
   - How to view order history
   - How to add kantin to favorites
   - How to update profile

3. **Special Sections**:
   - **Troubleshooting**: Common issues and solutions
   - **FAQ**: Frequently asked questions
   - **Best Practices**: Tips for efficient use
   - **Security Tips**: Password management, logout procedures
   - **Contact Support**: How to get help

4. **Visual Guidelines**:
   - Use emoji/icons for visual appeal (✅ ❌ ⚠️ 📱 💡)
   - Add warning boxes for critical steps
   - Add info boxes for tips and notes
   - Use code blocks for technical details
   - Create comparison tables where applicable

5. **Formatting Requirements**:
   - Professional, clear, and concise language
   - Use active voice ("Click the button" not "The button should be clicked")
   - Number all procedures (Step 1, Step 2, etc.)
   - Add "Expected Result" after each procedure
   - Include troubleshooting tips for common errors

---

**Deliverable:**

Please generate a **complete markdown document** formatted for PDF export that includes:
- Cover page with title, version, and date
- Table of contents
- All sections listed above
- Appendix with glossary and quick reference
- Footer with page numbers and document version

**Output Format:**
Return the complete document in markdown format, ready to be converted to PDF using tools like:
- Pandoc
- Markdown to PDF
- Typora
- VS Code Markdown PDF extension

Make sure the document is **comprehensive, professional, and easy to follow** for non-technical users.
```

---

#### **Alternative: Step-by-Step Prompt (For Iterative Generation)**

If you prefer to generate the manual section by section, use this approach:

```
You are a technical writer creating a user manual for KantinKita web application.

**Current Section**: [e.g., "Customer Guide - How to Checkout"]

**Application Context**:
- Name: KantinKita (Food Ordering Platform)
- User Role: Customer
- Feature: Checkout with Midtrans payment

**Section Requirements**:
1. Write a clear step-by-step guide (numbered steps)
2. Add "Expected Result" after each major step
3. Include placeholder for screenshot: [Screenshot: description]
4. Add troubleshooting tips at the end
5. Use professional but friendly tone
6. Assume user is non-technical

**Previous Context** (if continuing):
[Paste previous section if this is a continuation]

Please generate this section in markdown format, ready for PDF export.
```

---

#### **Prompt for Converting Manual to PDF**

After generating the markdown manual, use this prompt to get conversion instructions:

```
I have a complete user manual in markdown format for my web application.

**Manual File**: `USER_MANUAL.md`

**Requirements**:
- Convert to professional PDF
- Include page numbers
- Add table of contents with links
- Professional styling (colors, fonts)
- Cover page with logo placeholder

**Tools Available**:
- Pandoc
- VS Code with Markdown PDF extension
- Typora
- Online converters

Please provide:
1. Step-by-step instructions for each tool
2. Recommended CSS/styling for professional appearance
3. Command-line examples (for Pandoc)
4. Tips for adding page breaks, headers, footers
5. How to embed images/screenshots

Include specific commands and configuration examples.
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

---

## Phase 9: ChatGPT Prompts for Development

### 9.1 UI React Development Prompts

#### Prompt 1: Create React Component from Design
```
You are an expert React developer specializing in Vite, TypeScript, Tailwind CSS, and React Query.

Create a complete React component with the following requirements:

**Component**: [Describe component, e.g., "Order Management Table"]

**Features**:
- [List features, e.g., "Show order list with filtering, sorting, status badges"]

**Data Sources**:
- [API endpoints, e.g., "GET /api/v1/orders", "GET /api/v1/menus"]

**UI Requirements**:
- Use Tailwind CSS for styling
- TypeScript for type safety
- React Query for data fetching
- React Router for navigation if needed
- Toast notifications for user feedback

**Context**: [Any additional context about the component]

Please provide:
1. Complete TypeScript component file
2. API hook if needed (using React Query)
3. Type definitions
4. Error handling
5. Loading states

Return the complete code in a markdown code block.
```

#### Prompt 2: Fix React Component Issues
```
I have a React component that is not working correctly.

**Component File**: [file path]

**Issue**: [Describe the problem clearly]

**Code**:
[Provide relevant code section]

**Error Message**: [Any error from console or terminal]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

Please help me:
1. Identify the root cause
2. Provide step-by-step fix
3. Include corrected code
4. Explain what was wrong

Include specific line numbers and code changes.
```

#### Prompt 3: Optimize React Performance
```
I need to optimize the performance of my React application.

**Context**:
- Application: [Describe app, e.g., "LarKantinKita - food ordering system"]
- Pages with issues: [List pages]
- Symptoms: [Slow rendering, re-renders, etc.]

**Technology Stack**:
- React 18
- TypeScript
- Vite
- React Query
- Zustand (state management)

Please provide:
1. Performance profiling steps
2. Common optimization techniques for React
3. Specific code improvements for my app
4. React Query optimization tips
5. Component memoization suggestions

Include code examples for each optimization.
```

---

### 9.2 Laravel API Development Prompts

#### Prompt 1: Create Laravel API Endpoint
```
You are an expert Laravel backend developer.

Create a complete Laravel API endpoint with the following requirements:

**Endpoint**: [HTTP Method + Path, e.g., "POST /api/v1/orders"]

**Purpose**: [What it does, e.g., "Create new customer order"]

**Request Body**:
- [List fields with types, e.g., "items: array, notes: string, payment_method: string"]

**Response**:
- [Expected response structure]

**Authentication**: [Bearer token, role requirements]

**Validation Rules**: [Specific rules for each field]

**Database Tables**: [Which tables are affected]

Please provide:
1. Route definition (in routes/api.php)
2. Controller method
3. Request validation class
4. Resource class for response formatting
5. Any model relationships needed
6. Error handling

Include complete code with namespaces and imports.
```

#### Prompt 2: Fix Laravel Database Issues
```
I'm having database issues in my Laravel application.

**Problem**: [Describe the issue, e.g., "Migration fails with foreign key constraint"]

**Error Message**: [Full error from console]

**Relevant Files**:
- [List migration files, models, controllers]

**Current Setup**:
- Laravel version: [e.g., 10.x]
- Database: MySQL
- PHP version: [e.g., 8.2]

**What I've Tried**: [List attempts to fix]

Please help me:
1. Identify the root cause
2. Provide corrected migration code if needed
3. Fix any model relationship issues
4. Provide rollback and re-run commands
5. Verification steps

Include specific artisan commands and file contents.
```

#### Prompt 3: Optimize Laravel Queries
```
I need to optimize database queries in my Laravel application.

**Context**:
- Application: Laravel API for food ordering
- Common issue: N+1 query problem
- Slow endpoints: [List endpoints]

**Technology Stack**:
- Laravel 10.x
- MySQL
- PHP 8.2

Please provide:
1. How to identify N+1 queries (using Laravel Debugbar)
2. Eager loading examples with `with()`
3. Lazy loading vs eager loading tradeoffs
4. Query optimization techniques
5. Database indexing recommendations

Include specific code examples for common Laravel patterns like:
- Loading relationships
- Custom query scopes
- Database transactions
```

---

### 9.3 Database Schema Design Prompts

#### Prompt 1: Design Database Schema from Requirements
```
You are an expert database designer specializing in MySQL and Laravel Eloquent.

Design a complete database schema for:

**Application**: [Describe app, e.g., "Food ordering system for school canteens"]

**Requirements**:
- [List requirements, e.g., "Multiple tenants, menus, orders, payments"]

**Entities**:
- [List main entities, e.g., "Users, Tenants, Menus, Orders, OrderItems, Payments"]

Please provide:
1. Entity Relationship Diagram (in text/mermaid format)
2. Complete MySQL CREATE TABLE statements
3. Laravel migration files
4. Eloquent model definitions
5. Relationships (hasOne, belongsTo, many-to-many, etc.)
6. Index recommendations
7. Soft deletes where appropriate

Include:
- Primary keys (UUID or auto-increment)
- Foreign key constraints
- Timestamps
- Soft deletes (deleted_at)
- Common fields (status, is_active, etc.)
```

#### Prompt 2: Fix Database Migration Issues
```
I'm having issues with my Laravel database migrations.

**Problem**: [Describe issue, e.g., "Migration order is wrong", "Duplicate key"]

**Error Message**: [Full error]

**Migration Files**: [List affected migration files]

**Current State**:
- Latest migration: [name]
- Database version: [number]

**What I Want**: [What should happen]

Please help me:
1. Identify migration order issues
2. Fix any syntax errors
3. Provide rollback command
4. Provide re-run command
5. Verify migration was successful

Include specific artisan commands and corrected migration code.
```

#### Prompt 3: Database Performance Tuning
```
My Laravel application has slow database queries.

**Context**:
- Database: MySQL
- Table sizes: [List approximate sizes]
- Slow queries: [List query patterns]

**Current Indexes**: [Describe existing indexes]

Please provide:
1. How to analyze slow queries (EXPLAIN)
2. Index optimization strategy
3. Query rewriting techniques
4. Connection pooling recommendations
5. Caching strategies (query cache, Redis)

Include specific SQL examples and Laravel query builder optimizations.
```

---

### 9.4 Deployment Debugging Prompts

#### Prompt 1: Debug Railway Deployment Issues
```
My Laravel application deployment to Railway is failing.

**Context**:
- Deployment platform: Railway
- Application: Laravel 10 API
- Build logs: [Attach or describe]

**Error Messages**: [Copy error logs]

**Environment Variables**: [List configured]

**What I've Tried**: [List troubleshooting steps]

Please help me:
1. Identify deployment failure root cause
2. Fix build configuration issues
3. Environment variable troubleshooting
4. Database migration errors
5. Storage permissions

Include specific Railway CLI commands and fixes for common Laravel deployment issues.
```

#### Prompt 2: Debug Vercel Frontend Deployment
```
My Vercel frontend deployment is failing.

**Context**:
- Framework: Vite + React + TypeScript
- Build errors: [Describe]

**Error Messages**: [Copy from Vercel dashboard]

**Configuration Files**:
- vite.config.js
- package.json
- vercel.json (if exists)

**Environment Variables**: [List configured in Vercel]

Please help me:
1. Identify build configuration issues
2. Fix TypeScript errors
3. Environment variable problems
4. Route configuration
5. Deployment verification

Include specific commands to run locally for debugging.
```

#### Prompt 3: Debug Cross-Origin (CORS) Errors
```
I'm getting CORS errors between my frontend and backend.

**Context**:
- Frontend: https://kksandbox.vercel.app (Vercel)
- Backend: https://devlarkantinkita-sandbox.up.railway.app (Railway)
- Error: [Copy CORS error from browser console]

**Current Setup**:
- Laravel CORS config: [show config if changed]
- Frontend API calls: [show axios config]

Please help me:
1. Identify CORS configuration issues
2. Fix Laravel CORS configuration (fideloper/laravel-cors or native)
3. Environment variable settings
4. Pre-flight OPTIONS handling
5. Testing commands

Include specific code changes for Laravel CORS configuration.
```

#### Prompt 4: Debug Database Connection Errors
```
My application cannot connect to the database after deployment.

**Context**:
- Database: MySQL on Railway
- Application: Laravel API
- Error: "SQLSTATE[HY000] [2002]" or similar

**Configuration**:
- .env variables: [List DB_* values]
- Railway variables: [List auto-provided]

Please help me:
1. Identify connection string issues
2. Railway MySQL connection details
3. Firewall/network restrictions
4. SSL/TLS requirements
5. Testing connection with tunneling

Include specific Railway commands to get connection details and test.
```

#### Prompt 5: Debug Email/SMTP Issues
```
Email sending is failing in my deployed Laravel application.

**Context**:
- Mail driver: Gmail API (custom transport)
- Error: "Unsupported mail transport" or authentication errors

**Configuration**:
- config/mail.php
- .env MAIL_* variables
- Railway variables

**Code**: [Show custom transport class if exists]

Please help me:
1. Identify mail transport configuration issues
2. Gmail API setup verification
3. Environment variable loading in production
4. Laravel mail provider registration
5. Testing email sending

Include specific configuration file contents and testing commands.
```

---

## Quick Reference: Common Deployment Error Patterns

### Error: "Unsupported mail transport [gmail-api]"
**Solution**:
1. Check MailServiceProvider is registered in `bootstrap/providers.php`
2. Verify `config/mail.php` transport is set to `gmail-api`
3. Check `.env` has `MAIL_MAILER=gmail-api`
4. Clear config cache: `php artisan config:clear`

### Error: "SQLSTATE[HY000] [2002] No connection could be made"
**Solution**:
1. Verify Railway MySQL connection variables
2. Check Railway project is active
3. Test connection with tunnel: `railway open`
4. Ensure MySQL service is running

### Error: "SQLSTATE[HY000] [1045] Access denied"
**Solution**:
1. Verify DB_USERNAME and DB_PASSWORD match Railway variables
2. Check database name is correct
3. Test credentials with MySQL client

### Error: "Vite not found" on deployment
**Solution**:
1. Check `package.json` has vite devDependencies
2. Verify install command runs `npm ci` or `npm install`
3. Check node version compatibility

### Error: "Class 'PDO' not found"
**Solution**:
1. Enable PDO extension in Railway PHP configuration
2. Check PHP extensions in Railway dashboard

---

**Version**: 1.1
**Last Updated**: 2026-06-26