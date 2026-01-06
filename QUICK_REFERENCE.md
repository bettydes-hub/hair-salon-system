# ⚡ Quick Reference Cheat Sheet

## 🚀 Starting the Application

### Backend
```bash
cd backend
python run.py
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000 (or Vite default port)
```

---

## 🔑 Key Concepts

### Authentication Flow
1. User logs in → Backend generates JWT token
2. Token stored in localStorage
3. Token sent in `Authorization: Bearer <token>` header
4. Backend validates token on protected routes

### Role Hierarchy
- **Admin**: Full access (users, services, appointments, working hours)
- **Manager**: Services, appointments, working hours (no user management)
- **Receptionist**: Appointments only
- **Client**: View/create appointments (limited)

---

## 📁 Important Files

### Backend
- `backend/app/__init__.py` - Flask app factory
- `backend/app/models/user.py` - User model
- `backend/app/routes/auth.py` - Authentication endpoints
- `backend/app/utils/decorators.py` - Auth decorators
- `backend/app/services/appointment_service.py` - Business logic

### Frontend
- `frontend/src/App.jsx` - Main routing
- `frontend/src/services/api.js` - API calls
- `frontend/src/utils/auth.js` - Auth helpers
- `frontend/src/components/ProtectedRoute.jsx` - Route protection

---

## 🗄️ Database Models

### User
- `id`, `name`, `email`, `password_hash`, `role`, `profile_photo_url`, `must_change_password`

### Service
- `id`, `name`, `description`, `category`, `image_url`, `duration_minutes`, `price`, `is_active`

### Appointment
- `id`, `customer_name`, `customer_phone`, `service_id`, `appointment_date`, `appointment_time`, `status`, `created_by`

### WorkingHour
- `id`, `day_of_week`, `is_open`, `open_time`, `close_time`

---

## 🔐 Decorators (Backend)

```python
@token_required              # Any authenticated user
@admin_required              # Admin only
@manager_or_admin_required   # Manager or admin
@receptionist_or_admin_required  # Receptionist or admin
@staff_required              # Admin, manager, or receptionist
```

---

## 🌐 Main API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (admin only)
- `GET /api/auth/me` - Current user
- `POST /api/auth/change-password` - Change password

### Services
- `GET /api/services/` - List services
- `POST /api/services/` - Create (manager/admin)
- `PUT /api/services/<id>` - Update (manager/admin)

### Appointments
- `POST /api/appointments/` - Create (public)
- `GET /api/appointments/` - List (authenticated)
- `PUT /api/appointments/<id>` - Update (receptionist/admin)
- `GET /api/appointments/available-slots` - Get slots (public)

---

## 💡 Key Functions

### Backend
- `can_book_appointment()` - Check if appointment can be booked
- `check_appointment_conflict()` - Check for time conflicts
- `get_available_time_slots()` - Calculate available slots
- `is_within_working_hours()` - Validate against working hours

### Frontend
- `isAuthenticated()` - Check if user logged in
- `isAdmin()`, `isManager()`, etc. - Role checks
- `authAPI.login()` - Login function
- `appointmentsAPI.create()` - Create appointment

---

## 🔒 Security Features

1. **Password Hashing**: `werkzeug.security.generate_password_hash()`
2. **JWT Tokens**: Stateless authentication
3. **Role-Based Access**: Decorators check user roles
4. **Input Validation**: Validators check all inputs
5. **CORS**: Configured for frontend origin only

---

## 🎯 Common Questions

**Q: How does authentication work?**
A: JWT tokens stored in localStorage, sent in Authorization header

**Q: How do you prevent double-booking?**
A: `check_appointment_conflict()` checks for overlapping appointments

**Q: How are passwords secured?**
A: Hashed with werkzeug, never stored in plain text

**Q: What's the difference between roles?**
A: Admin (full access), Manager (no user management), Receptionist (appointments only), Client (limited)

**Q: How does the frontend talk to backend?**
A: Axios HTTP client, JSON requests/responses, CORS enabled

---

## 🐛 Common Issues

### CORS Error
- Check backend CORS configuration in `app/__init__.py`
- Ensure frontend URL is in allowed origins

### 401 Unauthorized
- Token expired or invalid
- Check localStorage for token
- User needs to login again

### 403 Forbidden
- User doesn't have required role
- Check user role in database
- Verify decorator on route

### Password Change Modal Stuck
- Check `must_change_password` flag in database
- Clear localStorage and login again

---

## 📝 Code Patterns

### Protected Route (Backend)
```python
@appointments_bp.route('/<id>', methods=['DELETE'])
@receptionist_or_admin_required
def delete_appointment(current_user, id):
    # current_user is automatically injected
    ...
```

### API Call (Frontend)
```javascript
const response = await appointmentsAPI.create({
  customer_name: 'John Doe',
  service_id: 1,
  appointment_date: '2024-01-15',
  appointment_time: '10:00'
})
```

### State Management (Frontend)
```javascript
const [appointments, setAppointments] = useState([])

useEffect(() => {
  const fetchData = async () => {
    const data = await appointmentsAPI.getAll()
    setAppointments(data)
  }
  fetchData()
}, [])
```

---

## 🎨 Tech Stack Summary

- **Backend**: Flask, SQLAlchemy, PostgreSQL, JWT
- **Frontend**: React, Vite, Axios, Tailwind CSS
- **Database**: PostgreSQL
- **Auth**: JWT (JSON Web Tokens)

---

**Remember**: 
- Always validate input
- Check user permissions
- Handle errors gracefully
- Use meaningful error messages

