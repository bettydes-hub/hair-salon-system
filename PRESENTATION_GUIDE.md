# 🎤 Presentation Guide - Hair Salon Management System

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Models](#database-models)
5. [Authentication & Authorization](#authentication--authorization)
6. [Key Features](#key-features)
7. [API Endpoints](#api-endpoints)
8. [Frontend Structure](#frontend-structure)
9. [Important Code Patterns](#important-code-patterns)
10. [Common Questions & Answers](#common-questions--answers)

---

## 🎯 Project Overview

**What is this project?**
- A full-stack web application for managing a hair salon business
- Features appointment booking, service management, user management, and working hours
- Built with React (frontend) and Flask (backend)
- Uses PostgreSQL database

**Main Purpose:**
- Allow customers to book appointments online
- Enable staff (admin, manager, receptionist) to manage appointments and services
- Track business operations and schedules

---

## 🛠️ Tech Stack

### Backend
- **Python 3.8+** - Programming language
- **Flask** - Web framework (lightweight, flexible)
- **SQLAlchemy** - ORM (Object-Relational Mapping) for database operations
- **Flask-Migrate** - Database migrations (Alembic)
- **PyJWT** - JSON Web Tokens for authentication
- **PostgreSQL** - Database (via psycopg2-binary)
- **Flask-CORS** - Cross-Origin Resource Sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool (faster than Create React App)
- **React Router DOM** - Routing/navigation
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework

### Why these technologies?
- **Flask**: Simple, flexible, good for REST APIs
- **React**: Component-based, modern UI development
- **PostgreSQL**: Reliable relational database
- **JWT**: Stateless authentication (no server-side sessions)

---

## 🏗️ Architecture

### Project Structure
```
hair salon/
├── backend/              # Flask backend
│   ├── app/
│   │   ├── models/       # Database models (User, Service, Appointment, WorkingHour)
│   │   ├── routes/       # API endpoints (auth, services, appointments, working_hours)
│   │   ├── services/     # Business logic (appointment_service)
│   │   ├── utils/        # Helpers (decorators, validators)
│   │   └── config.py     # Configuration
│   ├── migrations/       # Database migrations
│   └── run.py            # Application entry point
│
└── frontend/             # React frontend
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Page components (Login, Dashboard, etc.)
    │   ├── services/     # API service layer (api.js)
    │   └── utils/        # Helper functions (auth.js, helpers.js)
    └── package.json
```

### How Frontend and Backend Communicate
1. Frontend makes HTTP requests to backend API endpoints
2. Backend processes requests, queries database, returns JSON
3. Frontend receives JSON, updates UI
4. Uses JWT tokens for authentication (stored in localStorage)

### Data Flow Example (Booking Appointment)
1. User fills form in React component
2. Component calls `appointmentsAPI.create()` from `api.js`
3. Axios sends POST request to `/api/appointments/`
4. Backend route validates data, checks availability
5. Backend creates appointment in database
6. Backend returns success response
7. Frontend updates UI to show success message

---

## 🗄️ Database Models

### 1. User Model (`app/models/user.py`)
**Purpose**: Stores staff members (admin, manager, receptionist) and clients

**Fields:**
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password_hash` - Hashed password (never store plain passwords!)
- `role` - User role: 'admin', 'manager', 'receptionist', or 'client'
- `profile_photo_url` - Path to profile photo
- `must_change_password` - Boolean flag (forces password change on first login)
- `created_at` - Timestamp

**Key Methods:**
- `set_password(password)` - Hashes and stores password
- `check_password(password)` - Verifies password
- `is_admin()`, `is_manager()`, `is_receptionist()`, `is_client()` - Role checks
- `is_staff()` - Returns True if admin, manager, or receptionist

**Security Note**: Passwords are hashed using `werkzeug.security.generate_password_hash()`

### 2. Service Model (`app/models/service.py`)
**Purpose**: Stores salon services (haircuts, coloring, etc.)

**Fields:**
- `id` - Primary key
- `name` - Service name (e.g., "Haircut")
- `description` - Service description
- `category` - Service category (e.g., "Haircut", "Coloring")
- `image_url` - Path to service image
- `duration_minutes` - How long the service takes
- `price` - Service price (Decimal)
- `is_active` - Whether service is available

**Relationships:**
- One service can have many appointments (`appointments` relationship)

### 3. Appointment Model (`app/models/appointment.py`)
**Purpose**: Stores all appointment bookings

**Fields:**
- `id` - Primary key
- `customer_name` - Customer's name
- `customer_phone` - Customer's phone number
- `service_id` - Foreign key to Service
- `appointment_date` - Date of appointment
- `appointment_time` - Time of appointment
- `status` - 'pending', 'confirmed', 'completed', or 'cancelled'
- `created_by` - Who created it: 'admin', 'receptionist', 'customer', or 'ai'
- `created_at` - Timestamp

**Relationships:**
- Belongs to one Service (`service` relationship via backref)

### 4. WorkingHour Model (`app/models/working_hour.py`)
**Purpose**: Stores salon operating hours for each day of the week

**Fields:**
- `id` - Primary key
- `day_of_week` - 0-6 (Monday-Sunday)
- `is_open` - Boolean (is salon open this day?)
- `open_time` - Opening time
- `close_time` - Closing time

---

## 🔐 Authentication & Authorization

### How Authentication Works

1. **Login Flow:**
   - User submits email/password
   - Backend verifies credentials
   - Backend generates JWT token (contains user_id, email, role)
   - Token sent to frontend, stored in localStorage
   - Token included in all subsequent API requests

2. **Token Structure:**
   ```python
   {
     'user_id': 1,
     'email': 'admin@salon.com',
     'role': 'admin',
     'exp': <expiration_timestamp>
   }
   ```

3. **Token Validation:**
   - `@token_required` decorator extracts token from Authorization header
   - Verifies token signature and expiration
   - Loads user from database
   - Passes `current_user` to route function

### Role-Based Access Control

**Roles:**
- **Admin**: Full access (manage users, services, appointments, working hours)
- **Manager**: Manage services, appointments, working hours (cannot manage users)
- **Receptionist**: Manage appointments only
- **Client**: View and create appointments (limited access)

**Decorators:**
- `@token_required` - Requires valid token (any authenticated user)
- `@admin_required` - Requires admin role
- `@manager_or_admin_required` - Requires manager or admin
- `@receptionist_or_admin_required` - Requires receptionist or admin
- `@staff_required` - Requires staff (admin, manager, or receptionist)

**Example:**
```python
@appointments_bp.route('/<int:id>', methods=['DELETE'])
@receptionist_or_admin_required
def delete_appointment(current_user, id):
    # Only receptionists and admins can delete appointments
    ...
```

### Password Change Requirement
- New staff users must change password on first login
- `must_change_password` flag in User model
- Frontend shows modal if flag is True
- User cannot access other features until password is changed

---

## ✨ Key Features

### 1. Appointment Management
- **Create**: Customers can book online, staff can create for walk-ins
- **View**: Staff see all appointments, clients see only their own
- **Update**: Staff can modify appointment details
- **Status Management**: pending → confirmed → completed/cancelled
- **Availability Check**: System checks if time slot is available
- **Conflict Prevention**: Prevents double-booking

### 2. Service Management
- **CRUD Operations**: Create, read, update, delete services
- **Image Upload**: Upload service images
- **Categories**: Organize services by category
- **Pricing & Duration**: Set price and duration for each service
- **Activation**: Can activate/deactivate services

### 3. User Management (Admin Only)
- **Create Users**: Admin can create staff accounts
- **Update Users**: Modify name, email, role, password
- **Delete Users**: Remove user accounts (cannot delete self)
- **Role Assignment**: Assign roles (admin, receptionist)

### 4. Working Hours Management
- **Set Hours**: Configure operating hours for each day
- **Open/Closed**: Mark days as open or closed
- **Availability Calculation**: System uses this to determine available slots

### 5. Profile Management
- **Update Profile**: Change name, email
- **Profile Photo**: Upload profile pictures
- **Change Password**: Update password (with validation)

---

## 🌐 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user (admin only, or first user)
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/upload-profile-photo` - Upload profile photo
- `PUT /api/auth/profile` - Update profile
- `GET /api/auth/users` - List all users (admin only)
- `GET /api/auth/users/<id>` - Get user by ID (admin only)
- `PUT /api/auth/users/<id>` - Update user (admin only)
- `DELETE /api/auth/users/<id>` - Delete user (admin only)

### Services (`/api/services`)
- `GET /api/services/` - List all active services (public)
- `GET /api/services/<id>` - Get service by ID (public)
- `POST /api/services/` - Create service (manager/admin)
- `PUT /api/services/<id>` - Update service (manager/admin)
- `DELETE /api/services/<id>` - Deactivate service (manager/admin)
- `POST /api/services/upload-image` - Upload service image (manager/admin)

### Appointments (`/api/appointments`)
- `POST /api/appointments/` - Create appointment (public for customers)
- `GET /api/appointments/` - List appointments (authenticated)
- `GET /api/appointments/<id>` - Get appointment by ID (authenticated)
- `PUT /api/appointments/<id>` - Update appointment (receptionist/admin)
- `PUT /api/appointments/<id>/status` - Update status (receptionist/admin)
- `DELETE /api/appointments/<id>` - Delete appointment (receptionist/admin)
- `GET /api/appointments/available-slots` - Get available time slots (public)

### Working Hours (`/api/working-hours`)
- `GET /api/working-hours/` - Get all working hours
- `POST /api/working-hours/initialize` - Initialize default working hours
- `PUT /api/working-hours/<id>` - Update working hours (admin)

---

## 🎨 Frontend Structure

### Routing (`App.jsx`)
- Uses React Router for navigation
- Protected routes wrapped in `<ProtectedRoute>` component
- Redirects unauthenticated users to login
- Shows password change modal if required

### Key Pages
- **Login** (`pages/Login.jsx`) - Authentication page
- **Dashboard** (`pages/Dashboard.jsx`) - Role-based dashboard (redirects to specific dashboard)
- **AdminDashboard** - Admin-specific features
- **ManagerDashboard** - Manager-specific features
- **ReceptionistDashboard** - Receptionist-specific features
- **ClientDashboard** - Client-specific features
- **Appointments** - View/manage appointments
- **Services** - View/manage services
- **Users** - User management (admin only)
- **Profile** - User profile management
- **WorkingHours** - Set working hours (admin)

### API Service Layer (`services/api.js`)
- Centralized API calls using Axios
- Automatic token injection via interceptors
- Error handling (401 redirects to login)
- Organized by feature (authAPI, servicesAPI, appointmentsAPI, etc.)

### Authentication Utilities (`utils/auth.js`)
- Helper functions for checking roles
- Token management
- User data access

### Protected Routes (`components/ProtectedRoute.jsx`)
- Wraps routes that require authentication
- Checks for valid token
- Redirects to login if not authenticated

---

## 💻 Important Code Patterns

### 1. Decorator Pattern (Backend)
**Purpose**: Reusable authentication/authorization checks

```python
@token_required
def some_route(current_user):
    # current_user is automatically injected
    return jsonify({'user': current_user.name})
```

**How it works:**
- Decorator extracts token from request headers
- Validates token
- Loads user from database
- Passes user to route function
- Returns 401 if token invalid

### 2. Service Layer Pattern
**Purpose**: Separate business logic from routes

**Example:** `app/services/appointment_service.py`
- `can_book_appointment()` - Checks if appointment can be booked
- `check_appointment_conflict()` - Checks for time conflicts
- `get_available_time_slots()` - Calculates available slots

**Why?**
- Reusable logic
- Easier to test
- Cleaner route handlers

### 3. Blueprint Pattern (Flask)
**Purpose**: Organize routes by feature

```python
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    ...
```

**Benefits:**
- Modular code organization
- Easy to add/remove features
- Clear URL structure

### 4. Interceptor Pattern (Frontend)
**Purpose**: Automatically add token to requests

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Benefits:**
- No need to manually add token to each request
- Centralized error handling

### 5. Validation Pattern
**Purpose**: Validate input before processing

**Backend:** `app/utils/validators.py`
- `validate_user_data()` - Validates user registration/update
- `validate_service_data()` - Validates service data
- `validate_appointment_data()` - Validates appointment data

**Returns:** List of error messages or empty list if valid

---

## ❓ Common Questions & Answers

### Q1: How does authentication work?
**A:** 
- User logs in with email/password
- Backend verifies credentials and generates JWT token
- Token stored in localStorage on frontend
- Token sent in Authorization header with each request
- Backend validates token on protected routes
- Token expires after 24 hours

### Q2: How do you prevent unauthorized access?
**A:**
- Protected routes use `@token_required` decorator
- Decorator validates JWT token
- Role-based decorators (`@admin_required`, etc.) check user role
- Frontend uses `ProtectedRoute` component to block unauthenticated access
- API returns 401/403 errors for unauthorized requests

### Q3: How does appointment booking work?
**A:**
1. User selects service and date/time
2. Frontend calls `/api/appointments/available-slots` to check availability
3. If available, frontend sends POST to `/api/appointments/`
4. Backend validates data and checks for conflicts
5. If valid, creates appointment in database
6. Returns success response

### Q4: How do you handle password security?
**A:**
- Passwords are NEVER stored in plain text
- Uses `werkzeug.security.generate_password_hash()` to hash passwords
- Uses `check_password_hash()` to verify passwords
- New staff users must change password on first login
- Password validation (minimum 6 characters, cannot reuse current password)

### Q5: What is the difference between roles?
**A:**
- **Admin**: Full access - can manage users, services, appointments, working hours
- **Manager**: Can manage services, appointments, working hours (cannot manage users)
- **Receptionist**: Can only manage appointments
- **Client**: Can view and create appointments (limited access)

### Q6: How does the frontend communicate with backend?
**A:**
- Frontend uses Axios HTTP client
- API calls defined in `services/api.js`
- Base URL configured in environment variables
- CORS enabled on backend for frontend origin
- JSON format for request/response

### Q7: How do you handle file uploads?
**A:**
- Profile photos: Uploaded to `uploads/profiles/` directory
- Service images: Uploaded to `uploads/services/` directory
- Files renamed with UUID to prevent conflicts
- Only image files allowed (PNG, JPG, JPEG, GIF, WEBP)
- Max file size: 16MB
- Files served via Flask routes (`/uploads/profiles/<filename>`)

### Q8: What database do you use and why?
**A:**
- PostgreSQL - Relational database
- Why: Reliable, supports complex queries, good for structured data
- Uses SQLAlchemy ORM to interact with database
- Migrations handled by Flask-Migrate (Alembic)

### Q9: How do you handle errors?
**A:**
- Backend returns JSON error responses with status codes
- Frontend catches errors in try/catch blocks
- Axios interceptors handle 401 errors (redirect to login)
- User-friendly error messages displayed in UI
- Validation errors returned as arrays

### Q10: How is the project structured?
**A:**
- **Backend**: Flask application factory pattern (`create_app()`)
- **Models**: SQLAlchemy models in `app/models/`
- **Routes**: Blueprints in `app/routes/`
- **Services**: Business logic in `app/services/`
- **Utils**: Helpers in `app/utils/`
- **Frontend**: Component-based React app
- **Pages**: Full page components
- **Components**: Reusable UI components
- **Services**: API service layer

### Q11: What happens when a user logs in?
**A:**
1. User submits email/password
2. Frontend sends POST to `/api/auth/login`
3. Backend verifies credentials
4. If valid, backend generates JWT token
5. Backend returns token and user data
6. Frontend stores token and user in localStorage
7. Frontend redirects to dashboard
8. If `must_change_password` is True, shows password change modal

### Q12: How do you ensure data integrity?
**A:**
- Foreign key constraints (service_id references services.id)
- Input validation on all endpoints
- Database transactions (db.session.commit())
- Unique constraints (email must be unique)
- Status validation (appointment status must be valid value)

### Q13: What technologies did you choose and why?
**A:**
- **Flask**: Lightweight, flexible, good for REST APIs, easy to learn
- **React**: Modern, component-based, large ecosystem, good performance
- **PostgreSQL**: Reliable, ACID compliant, good for production
- **JWT**: Stateless authentication, scalable, no server-side sessions
- **Tailwind CSS**: Fast development, consistent design, utility-first

### Q14: How do you handle state management?
**A:**
- React `useState` for component-level state
- React `useEffect` for side effects (API calls)
- localStorage for persistent data (token, user)
- No global state management library (could add Redux/Zustand if needed)

### Q15: What are the main challenges you faced?
**A:**
- **CORS**: Configured Flask-CORS to allow frontend requests
- **Authentication**: Implemented JWT token system
- **Password Change Flow**: Modal appears on first login, prevents access until changed
- **File Uploads**: Set up upload directories and serving routes
- **Role-Based Access**: Created decorators for different permission levels
- **Time Slot Availability**: Logic to check working hours and existing appointments

---

## 🎯 Key Points to Emphasize

1. **Security**: Passwords hashed, JWT authentication, role-based access control
2. **Architecture**: Clean separation of concerns (models, routes, services)
3. **User Experience**: Password change requirement, protected routes, error handling
4. **Scalability**: Modular structure, reusable components, service layer pattern
5. **Best Practices**: Input validation, error handling, code organization

---

## 📝 Quick Reference

### Start Backend
```bash
cd backend
python run.py
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Database Migrations
```bash
cd backend
flask db migrate -m "description"
flask db upgrade
```

### Key Files to Know
- `backend/app/__init__.py` - Flask app initialization
- `backend/app/routes/auth.py` - Authentication endpoints
- `backend/app/models/user.py` - User model
- `frontend/src/App.jsx` - Main routing
- `frontend/src/services/api.js` - API service layer
- `frontend/src/utils/auth.js` - Auth utilities

---

**Good luck with your presentation! 🚀**

