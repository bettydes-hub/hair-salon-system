# Quick Email Setup Guide

## Step 1: Create Gmail App Password

**You CANNOT use your regular Gmail password (`Bettydes12@m`) for SMTP!**

You need to create a special "App Password":

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Click "Security"** in the left sidebar
3. **Enable 2-Step Verification** (if not already enabled)
4. **Scroll down to "App passwords"** (or search for it)
5. **Click "App passwords"**
6. **Select app**: Choose "Mail"
7. **Select device**: Choose "Other (Custom name)" and type "Hair Salon System"
8. **Click "Generate"**
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

## Step 2: Update Your .env File

Open `backend/.env` and add these lines (or update if they exist):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=bechode2112@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
FROM_EMAIL=bechode2112@gmail.com
```

**Replace `abcdefghijklmnop` with the 16-character app password you just created!**

## Step 3: Run Database Migration

```bash
cd backend
.\venv\Scripts\activate
flask db upgrade
```

## Step 4: Restart Backend

Restart your backend server to load the new email configuration.

## Testing

After setup, when an admin creates a new staff member:
- The staff member will receive an email with a 6-digit verification code
- They must verify their email before they can log in
- If they forget their password, they can request a reset code via email

## Troubleshooting

- **"Authentication failed"**: Make sure you're using the App Password, not your regular password
- **"Connection refused"**: Check your firewall allows outbound connections to smtp.gmail.com:465
- **No emails received**: Check spam folder, verify email address is correct

