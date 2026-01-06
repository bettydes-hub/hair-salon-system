# Email Setup (Gmail SMTP)

Follow these steps to enable email verification and password reset:

## 1) Create an App Password (Gmail)
1. Enable 2-Step Verification on the Gmail account.
2. Go to Google Account → Security → App Passwords.
3. Create an app password (choose “Mail” and “Other/Custom”), copy the generated 16-character password.

## 2) Add environment variables to `.env` in `backend/`
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password   # the 16-char app password
FROM_EMAIL=your_email@gmail.com   # sender email shown to recipients
```

## 3) Migrate database (adds verification/reset fields)
```
cd backend
.\venv\Scripts\activate  # or source venv/bin/activate on mac/linux
flask db upgrade
```

## 4) Flows supported
- **Staff onboarding**: when admin creates a staff user, a 6-digit verification code is emailed. Login is blocked until verified.
- **Resend verification**: `POST /api/auth/resend-verification` with `{ email }`.
- **Verify code**: `POST /api/auth/verify-email` with `{ email, code }`.
- **Forgot password**: `POST /api/auth/request-password-reset` with `{ email }` → code emailed. Reset with `POST /api/auth/reset-password` `{ email, code, new_password }`.

## 5) Troubleshooting
- If emails don’t send, check console logs for SMTP errors.
- Ensure less secure access is NOT needed when using app passwords.
- Make sure the backend can reach smtp.gmail.com:465 (firewall).

