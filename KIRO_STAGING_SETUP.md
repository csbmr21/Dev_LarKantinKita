# Kiro Staging Setup Guide

## Architecture Overview

Frontend (Vercel) ←→ Backend API (Railway) ←→ Database (Railway MySQL)

Google OAuth + Gmail API untuk email OTP

---

## Setup Checklist

### 1. Google Cloud Console

1. Buka https://console.cloud.google.com/apis/credentials
2. Edit OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `https://devlarkantinkita-sandbox.up.railway.app/auth/google/callback`
   - `https://devlarkantinkita-sandbox.up.railway.app/api/v1/auth/google/gmail-callback`
4. Authorized JavaScript origins:
   - `https://kksandbox.vercel.app`
   - `https://devlarkantinkita-sandbox.up.railway.app`

### 2. Get Gmail Refresh Token

1. Buka: `https://devlarkantinkita-sandbox.up.railway.app/api/v1/auth/google/gmail-redirect`
2. Pilih akun Google (pangestu5711@gmail.com)
3. Izinkan akses Gmail API
4. Copy token yang muncul

### 3. Railway Variables

```
GOOGLE_REFRESH_TOKEN=<paste token dari step 2>
MAIL_MAILER=gmail-api
MAIL_FROM_ADDRESS=pangestu5711@gmail.com
FRONTEND_URL=https://kksandbox.vercel.app
```

### 4. Vercel Variables

```
VITE_API_BASE_URL=https://devlarkantinkita-sandbox.up.railway.app/api/v1
```

---

## Test Steps

### Test Email
```
GET https://devlarkantinkita-sandbox.up.railway.app/api/v1/auth/test-email?email=pangestu5711@gmail.com
```

### Test Login
1. Buka https://kksandbox.vercel.app/login
2. Login Google
3. OTP harus muncul di email

---

## Files Already Updated

✅ `app/Http/Middleware/CheckSubscriptionStatus.php` - bypass GET, local dev
✅ `routes/api.php` - subscription middleware
✅ `config/mail.php` - gmail-api transport
✅ `app/Http/Controllers/Api/AuthController.php` - Gmail OAuth
✅ `app/Mail/OtpMail.php` - sync send

---

## Push Changes

```bash
git add -A
git commit -m "feat: sandbox staging setup with Gmail API"
git push origin main
```