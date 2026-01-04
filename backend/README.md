# Hair Salon Backend API

Flask REST API for Hair Salon management system with JWT authentication, appointment scheduling, and business logic.

## 🚀 Quick Start

```bash
# Navigate to backend folder
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows
# or
source venv/bin/activate      # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with:
# DATABASE_URL=postgresql://user:password@localhost:5432/hair_salon_db
# SECRET_KEY=your-secret-key-here

# Run database migrations
flask db upgrade

# Start server
python run.py
```

Server runs on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── app/
│   ├── models/          # Database models (User, Service, Appointment, WorkingHour)
│   ├── routes/          # API endpoints (auth, services, appointments, working_hours)
│   ├── services/        # Business logic (appointment_service)
│   └── utils/           # Utilities (decorators, validators)
├── migrations/          # Database migrations
├── requirements.txt     # Python dependencies
└── run.py              # Application entry point
```

## 🔑 Features

- **Authentication**: JWT token-based auth with role-based access (Admin/Receptionist)
- **Appointments**: Create, read, update, delete with conflict detection
- **Services**: Manage salon services (CRUD operations)
- **Working Hours**: Manage salon availability
- **Validation**: Input validation on all endpoints
- **Business Logic**: Availability checking, conflict detection, time slot generation

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user (first admin only, then admin-only)
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (protected)

### Services
- `GET /api/services/` - List all active services (public)
- `GET /api/services/<id>` - Get single service (public)
- `POST /api/services/` - Create service (admin only)
- `PUT /api/services/<id>` - Update service (admin only)
- `DELETE /api/services/<id>` - Deactivate service (admin only)

### Appointments
- `POST /api/appointments/` - Create appointment (public)
- `GET /api/appointments/` - List appointments with filters (protected)
- `GET /api/appointments/<id>` - Get single appointment (protected)
- `PUT /api/appointments/<id>` - Update appointment (protected)
- `PUT /api/appointments/<id>/status` - Update status (protected)
- `DELETE /api/appointments/<id>` - Delete appointment (protected)
- `GET /api/appointments/available-slots` - Get available time slots (public)

### Working Hours
- `GET /api/working-hours/` - List all working hours (public)
- `GET /api/working-hours/<id>` - Get single day (public)
- `PUT /api/working-hours/<id>` - Update working hours (admin only)

## 🔐 Authentication

Protected endpoints require JWT token in header:
```
Authorization: Bearer <your-token-here>
```

Get token by logging in:
```json
POST /api/auth/login
{
  "email": "admin@salon.com",
  "password": "admin123"
}
```

## 🧪 Testing

See `QUICK_TEST_GUIDE.md` for complete testing guide with all endpoints and examples.

## 📦 Dependencies

- Flask 3.0.0
- Flask-SQLAlchemy 3.1.1
- Flask-Migrate 4.0.5
- Flask-CORS 4.0.0
- PyJWT 2.8.0
- psycopg2-binary 2.9.9
- python-dotenv 1.0.0

## 🗄️ Database

PostgreSQL database with tables:
- `users` - Admin and receptionist accounts
- `services` - Salon services
- `appointments` - Customer appointments
- `working_hours` - Salon availability schedule

## 📝 Environment Variables

Create `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost:5432/hair_salon_db
SECRET_KEY=your-secret-key-change-in-production
OPENAI_API_KEY=your-openai-key (optional)
```

## ✅ Status

Backend is complete and ready for frontend integration!

