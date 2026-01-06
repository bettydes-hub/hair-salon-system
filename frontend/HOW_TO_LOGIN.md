# 🔐 How to Login - User Guide

## First Time Setup

### Step 1: Create First Admin User

Since the register endpoint allows the first user without authentication, you can create your first admin:

**Option A: Using Postman/API Tool**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@salon.com",
  "password": "admin123",
  "role": "admin"
}
```

**Option B: Using Frontend (if you add a register page)**
- We can add a registration page for first-time setup

---

## Login Process

### For Admin Users

1. **Go to Login Page**
   - Open `http://localhost:3000`
   - You'll be redirected to `/login`

2. **Enter Credentials**
   ```
   Email: admin@salon.com
   Password: admin123
   ```

3. **Click "Sign In"**
   - You'll be redirected to Admin Dashboard
   - You'll see all features (Services, Working Hours, Users, etc.)

---

### For Receptionist Users

1. **Go to Login Page**
   - Open `http://localhost:3000/login`

2. **Enter Credentials**
   ```
   Email: receptionist@salon.com
   Password: receptionist123
   ```
   *(Use the email/password of a receptionist account)*

3. **Click "Sign In"**
   - You'll be redirected to Receptionist Dashboard
   - You'll see limited features (only Appointments)

---

## Creating More Users

### As Admin (After First Login)

1. **Login as Admin**
2. **Go to User Management**
   - Click "User Management" button on dashboard
   - Or go to `/users`

3. **Create New User**
   - Click "+ New User" button
   - Fill in:
     - Name: e.g., "John Receptionist"
     - Email: e.g., "receptionist@salon.com"
     - Password: e.g., "receptionist123"
     - Role: Select "Receptionist" or "Admin"
   - Click "Create User"

4. **New User Can Now Login**
   - Use the email and password you just created

---

## Example Users Setup

### Admin Account
```
Email: admin@salon.com
Password: admin123
Role: admin
```

### Receptionist Account
```
Email: receptionist@salon.com
Password: receptionist123
Role: receptionist
```

---

## Quick Test Users

If you want to test both roles quickly:

1. **Create Admin** (first user - no login needed)
   - Use Postman: `POST /api/auth/register`
   - Or we can add a setup page

2. **Login as Admin**
   - Create receptionist from User Management page

3. **Logout**
   - Click "Logout" button

4. **Login as Receptionist**
   - Use the receptionist credentials you created

---

## Troubleshooting

**Can't login?**
- Check if user exists in database
- Check if password is correct
- Check backend is running
- Check browser console for errors

**No users exist?**
- Create first admin using register endpoint
- Or we can add a setup/registration page

---

**Need help creating the first user? Let me know and I can add a setup page!**

