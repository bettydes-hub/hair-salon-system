# 🧪 Quick Backend Test Guide

Test all new features quickly!

## ⚡ Quick Test Sequence

### Step 1: Start Server
```powershell
cd "C:\Users\betty\OneDrive\Documents\hair salon\backend"
.\venv\Scripts\Activate.ps1
python run.py
```

Server should start on `http://localhost:5000`

---

## 🔐 Test 1: Authentication (JWT)

### 1.1 Register First Admin User
**Note:** Since register now requires admin, you may need to temporarily remove `@admin_required` or create admin directly in database.

**Option A: Temporarily remove protection (for first admin only)**
- Comment out `@admin_required` in `app/routes/auth.py` line 9
- Register admin
- Uncomment it back

**Option B: Use existing user from before**

### 1.2 Login and Get Token
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@salon.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@salon.com",
    "role": "admin"
  }
}
```

**✅ Save the token!** You'll need it for protected endpoints.

### 1.3 Test Protected Endpoint
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your-token-here>
```

**Expected:** Returns your user info

### 1.4 Test Without Token (Should Fail)
```http
GET http://localhost:5000/api/auth/me
```

**Expected:** `401 Unauthorized` - "Token is missing"

---

## 📅 Test 2: Appointment Features

### 2.1 Create Service First (Admin Only)
```http
POST http://localhost:5000/api/services/
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "Haircut",
  "description": "Professional haircut",
  "duration_minutes": 30,
  "price": 25.00
}
```

### 2.2 Get Available Time Slots
```http
GET http://localhost:5000/api/appointments/available-slots?date=2024-01-15&service_id=1
```

**Expected:** List of available time slots

### 2.3 Create Appointment (Public - No Token)
```http
POST http://localhost:5000/api/appointments/
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_phone": "555-1234",
  "service_id": 1,
  "appointment_date": "2024-01-15",
  "appointment_time": "10:00"
}
```

**Expected:** Appointment created successfully

### 2.4 Try to Create Conflicting Appointment (Should Fail)
```http
POST http://localhost:5000/api/appointments/
Content-Type: application/json

{
  "customer_name": "Jane Doe",
  "customer_phone": "555-5678",
  "service_id": 1,
  "appointment_date": "2024-01-15",
  "appointment_time": "10:00"
}
```

**Expected:** `400 Bad Request` - "Time slot is already booked"

### 2.5 List Appointments (Protected)
```http
GET http://localhost:5000/api/appointments/
Authorization: Bearer <your-token>
```

**Expected:** List of all appointments

### 2.6 Filter Appointments
```http
GET http://localhost:5000/api/appointments/?status=pending
Authorization: Bearer <your-token>
```

```http
GET http://localhost:5000/api/appointments/?date=2024-01-15
Authorization: Bearer <your-token>
```

### 2.7 Get Single Appointment
```http
GET http://localhost:5000/api/appointments/1
Authorization: Bearer <your-token>
```

### 2.8 Update Appointment Status
```http
PUT http://localhost:5000/api/appointments/1/status
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

---

## ✅ Test 3: Input Validation

### 3.1 Test Invalid Email
```http
POST http://localhost:5000/api/auth/register
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "Test",
  "email": "invalid-email",
  "password": "test123",
  "role": "receptionist"
}
```

**Expected:** `400 Bad Request` - Validation errors

### 3.2 Test Missing Fields
```http
POST http://localhost:5000/api/appointments/
Content-Type: application/json

{
  "customer_name": "John"
}
```

**Expected:** `400 Bad Request` - Missing required fields

### 3.3 Test Invalid Date Format
```http
POST http://localhost:5000/api/appointments/
Content-Type: application/json

{
  "customer_name": "John",
  "customer_phone": "555-1234",
  "service_id": 1,
  "appointment_date": "01/15/2024",
  "appointment_time": "10:00"
}
```

**Expected:** `400 Bad Request` - Invalid date format

---

## 🛎️ Test 4: Services (Admin Only)

### 4.1 Create Service
```http
POST http://localhost:5000/api/services/
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "Hair Color",
  "description": "Full hair coloring",
  "duration_minutes": 120,
  "price": 150.00
}
```

### 4.2 Get Single Service
```http
GET http://localhost:5000/api/services/1
```

### 4.3 Update Service
```http
PUT http://localhost:5000/api/services/1
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "price": 30.00
}
```

### 4.4 Try as Receptionist (Should Fail)
- Login as receptionist
- Try to create service
- **Expected:** `403 Forbidden` - "Admin access required"

---

## ⏰ Test 5: Working Hours

### 5.1 List Working Hours
```http
GET http://localhost:5000/api/working-hours/
```

**Expected:** Ordered by day of week

### 5.2 Update Working Hours (Admin Only)
```http
PUT http://localhost:5000/api/working-hours/1
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "open_time": "09:00",
  "close_time": "18:00",
  "is_closed": false
}
```

---

## 🎯 Test Checklist

### Authentication
- [ ] Login and get JWT token
- [ ] Access protected endpoint with token
- [ ] Access protected endpoint without token (should fail)
- [ ] Test admin-only endpoint as receptionist (should fail)

### Appointments
- [ ] Create appointment (public)
- [ ] Try conflicting appointment (should fail)
- [ ] List appointments (protected)
- [ ] Filter appointments by date/status
- [ ] Get single appointment
- [ ] Update appointment status
- [ ] Get available time slots

### Validation
- [ ] Test invalid email
- [ ] Test missing fields
- [ ] Test invalid date format
- [ ] Test invalid time format

### Services
- [ ] Create service (admin)
- [ ] Get single service (public)
- [ ] Update service (admin)
- [ ] Try create service as receptionist (should fail)

### Working Hours
- [ ] List working hours (public)
- [ ] Update working hours (admin)

---

## 🚨 Common Issues

### Issue: "Token is missing"
**Solution:** Add `Authorization: Bearer <token>` header

### Issue: "Admin access required"
**Solution:** Make sure you're logged in as admin, not receptionist

### Issue: "Time slot is already booked"
**Solution:** This is working correctly! Try a different time.

### Issue: "Service not available"
**Solution:** Make sure service exists and `is_active = true`

---

## ✅ Success Criteria

If all these tests pass, your backend is **100% complete** and ready for frontend integration!

1. ✅ JWT authentication works
2. ✅ Protected routes work
3. ✅ Role-based access works
4. ✅ Conflict detection works
5. ✅ Input validation works
6. ✅ All endpoints respond correctly

---

**Ready to test? Start the server and follow the sequence above!** 🚀

