# 👥 User Roles & Permissions

This document defines all user types and their permissions in the Hair Salon AI System.

## 1️⃣ Admin (Salon Owner / Manager)

**Role**: Full system control

### Permissions:
- ✅ Login to system
- ✅ View all appointments
- ✅ Add, edit, cancel appointments
- ✅ Manage services (add/edit/remove)
- ✅ Set working hours
- ✅ Manage employees (receptionists)
- ✅ View daily / weekly reports
- ✅ Manage system settings
- ✅ View customer database
- ✅ Manage staff schedules

### Goal:
Control and manage the entire salon operation.

### Database Fields:
- `id` - Unique identifier
- `username` - Login username
- `email` - Email address
- `password_hash` - Encrypted password
- `role` - "admin"
- `created_at` - Account creation date
- `is_active` - Account status

---

## 2️⃣ Receptionist (Employee)

**Role**: Appointment management

### Permissions:
- ✅ Login to system
- ✅ Add appointments for walk-in customers
- ✅ Edit appointment date/time
- ✅ View daily schedule
- ✅ Mark appointments as completed
- ✅ View customer information (for booking)
- ✅ Search appointments

### Restrictions:
- ❌ Cannot manage services
- ❌ Cannot manage system settings
- ❌ Cannot view reports
- ❌ Cannot manage other employees
- ❌ Cannot delete appointments (only cancel)

### Goal:
Handle in-person customers and daily scheduling.

### Database Fields:
- `id` - Unique identifier
- `username` - Login username
- `email` - Email address
- `password_hash` - Encrypted password
- `role` - "receptionist"
- `employee_id` - Employee identifier
- `created_at` - Account creation date
- `is_active` - Account status
- `admin_id` - Reference to admin who created this account

---

## 3️⃣ Customer (Client)

**Role**: Booking user (no login required)

### Permissions:
- ✅ View available services
- ✅ Book appointments online
- ✅ Use AI assistant for booking
- ✅ Receive booking confirmation
- ✅ View their own booking details (via confirmation code/email)

### Restrictions:
- ❌ Cannot edit or cancel appointments (must contact salon)
- ❌ Cannot view other bookings
- ❌ Cannot access admin/receptionist features
- ❌ No login required (public booking)

### Goal:
Book salon services easily without creating an account.

### Database Fields:
- `id` - Unique identifier
- `name` - Full name
- `email` - Email address
- `phone` - Phone number
- `role` - "customer" (or null, since no login)
- `created_at` - First booking date
- `preferences` - Service preferences (JSON field, optional)

**Note**: Customers don't have login credentials. They're identified by email/phone for booking purposes.

---

## 4️⃣ AI Assistant (System Component)

**Role**: Smart booking helper

### Permissions:
- ✅ Understand natural language booking requests
- ✅ Suggest services and time slots
- ✅ Generate structured booking data
- ✅ Answer customer questions about services
- ✅ Provide style recommendations

### Restrictions:
- ❌ Cannot modify database directly
- ❌ Cannot access admin/receptionist data
- ❌ Cannot process payments
- ❌ Cannot override business rules (working hours, availability)

### Goal:
Make booking faster and smarter through natural language interaction.

### Implementation:
- No database user record needed
- API endpoint: `/api/ai/chat`
- API endpoint: `/api/ai/recommendations`
- Uses OpenAI API for processing

---

## 🔐 Authentication Flow

### Admin & Receptionist
1. User visits login page
2. Enters username/email and password
3. System validates credentials
4. System checks role and permissions
5. User redirected to appropriate dashboard

### Customer
1. No authentication required
2. Customer provides name, email, phone during booking
3. System creates/updates customer record
4. Booking confirmation sent via email

---

## 📊 Permission Matrix

| Feature | Admin | Receptionist | Customer | AI Assistant |
|---------|-------|---------------|----------|--------------|
| Login | ✅ | ✅ | ❌ | N/A |
| View All Appointments | ✅ | ✅ (daily only) | ❌ | ❌ |
| Add Appointment | ✅ | ✅ | ✅ (online) | ✅ (suggest) |
| Edit Appointment | ✅ | ✅ | ❌ | ❌ |
| Cancel Appointment | ✅ | ✅ | ❌ | ❌ |
| Manage Services | ✅ | ❌ | ❌ | ❌ |
| Manage Employees | ✅ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ❌ | ❌ | ❌ |
| Set Working Hours | ✅ | ❌ | ❌ | ❌ |
| AI Chat | ✅ | ✅ | ✅ | ✅ |
| View Own Booking | ✅ | ✅ | ✅ (via email) | ❌ |

---

## 🗄️ Database Schema Considerations

### Users Table
```python
# For Admin and Receptionist
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin' or 'receptionist'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

### Customers Table
```python
# For Customer records (no login)
class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    preferences = db.Column(db.JSON)  # Optional: service preferences
```

---

## 🛡️ Security Considerations

1. **Password Hashing**: Use bcrypt or similar for password storage
2. **JWT Tokens**: Use JWT for admin/receptionist sessions
3. **Role-Based Access Control**: Check role on every protected endpoint
4. **Input Validation**: Validate all user inputs
5. **Rate Limiting**: Prevent abuse of AI endpoints
6. **CORS**: Configure CORS properly for frontend-backend communication

---

## 🚀 Implementation Phases

### Phase 1: Basic Structure
- Create User model (admin/receptionist)
- Create Customer model
- Basic authentication (login/logout)

### Phase 2: Role-Based Access
- Implement role checking middleware
- Create permission decorators
- Protect API endpoints

### Phase 3: Customer Booking
- Public booking interface
- Customer record creation
- Email confirmations

### Phase 4: AI Integration
- AI chat endpoint
- Booking assistance
- Style recommendations

---

**Next Steps**: Use this document when designing your database models and API endpoints!

