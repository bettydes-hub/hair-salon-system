# 👥 Create Users with Different Roles - Postman Guide

## Step-by-Step Guide

### Step 1: Create First Admin User (No Auth Required)

**Request:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Admin Owner",
  "email": "admin@salon.com",
  "password": "admin123",
  "role": "admin"
}
```

**Expected Response (201):**
```json
{
  "message": "User admin@salon.com registered successfully",
  "user": {
    "id": 1,
    "name": "Admin Owner",
    "email": "admin@salon.com",
    "role": "admin"
  }
}
```

---

### Step 2: Login as Admin to Get Token

**Request:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@salon.com",
  "password": "admin123"
}
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "Admin Owner",
    "email": "admin@salon.com",
    "role": "admin"
  }
}
```

**✅ Copy the token!** You'll need it for the next steps.

---

### Step 3: Create Receptionist User (Admin Auth Required)

**Request:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
Authorization: Bearer <your-admin-token-here>
```

**Body:**
```json
{
  "name": "Receptionist One",
  "email": "receptionist@salon.com",
  "password": "receptionist123",
  "role": "receptionist"
}
```

**Expected Response (201):**
```json
{
  "message": "User receptionist@salon.com registered successfully",
  "user": {
    "id": 2,
    "name": "Receptionist One",
    "email": "receptionist@salon.com",
    "role": "receptionist"
  }
}
```

---

### Step 4: Create Another Admin User (Optional)

**Request:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
Authorization: Bearer <your-admin-token-here>
```

**Body:**
```json
{
  "name": "Admin Manager",
  "email": "manager@salon.com",
  "password": "manager123",
  "role": "admin"
}
```

---

### Step 7: Create More Receptionists (Optional)

**Request:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
Authorization: Bearer <your-admin-token-here>
```

**Body:**
```json
{
  "name": "Receptionist Two",
  "email": "receptionist2@salon.com",
  "password": "receptionist123",
  "role": "receptionist"
}
```

---

## Test All Users

### Test Admin Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@salon.com",
  "password": "admin123"
}
```

### Test Receptionist Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "receptionist@salon.com",
  "password": "receptionist123"
}
```

---

## List All Users (Admin Only)

**Request:**
```
GET http://localhost:5000/api/auth/users
Authorization: Bearer <your-admin-token-here>
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Admin Owner",
    "email": "admin@salon.com",
    "role": "admin",
    "created_at": "2024-01-04T..."
  },
  {
    "id": 2,
    "name": "Receptionist One",
    "email": "receptionist@salon.com",
    "role": "receptionist",
    "created_at": "2024-01-04T..."
  }
]
```

---

## Example Users to Create

### Admin Users (Full Owner Access)
```json
{
  "name": "Salon Owner",
  "email": "owner@salon.com",
  "password": "owner123",
  "role": "admin"
}
```

### Manager Users (Management Access - No User Management)
```json
{
  "name": "Manager",
  "email": "manager@salon.com",
  "password": "manager123",
  "role": "manager"
}
```

### Receptionist Users
```json
{
  "name": "Sarah Receptionist",
  "email": "sarah@salon.com",
  "password": "sarah123",
  "role": "receptionist"
}
```

```json
{
  "name": "John Receptionist",
  "email": "john@salon.com",
  "password": "john123",
  "role": "receptionist"
}
```

### Client Users (Customers)
```json
{
  "name": "Jane Customer",
  "email": "jane@customer.com",
  "password": "jane123",
  "role": "client"
}
```

```json
{
  "name": "Bob Client",
  "email": "bob@customer.com",
  "password": "bob123",
  "role": "client"
}
```

---

## Quick Test Sequence

1. ✅ Create first admin (no token needed)
2. ✅ Login as admin → Get token
3. ✅ Create manager (with admin token)
4. ✅ Create receptionist (with admin token)
5. ✅ Create client (with admin token)
6. ✅ List all users (with admin token)
7. ✅ Test login for each user type

---

## Common Errors

**Error: "Admin authentication required"**
- Solution: Make sure you're sending the token in Authorization header
- Format: `Authorization: Bearer <token>`

**Error: "Email already exists"**
- Solution: Use a different email address

**Error: "Validation failed"**
- Solution: Check all required fields are present:
  - name (at least 2 characters)
  - email (valid format)
  - password (at least 6 characters)
  - role (must be "admin", "manager", "receptionist", or "client")

---

**Ready to test! Start with Step 1 and create your users!** 🚀

