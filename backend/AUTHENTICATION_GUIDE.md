# 🔐 Authentication & Authorization Guide

This guide will help you implement the user roles and permissions system.

## Quick Reference

See **USER_ROLES.md** in the root directory for complete role definitions.

## Implementation Steps

### Step 1: Create User Model

```python
# app/models/user.py
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin' or 'receptionist'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if password is correct"""
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        """Check if user is admin"""
        return self.role == 'admin'
    
    def is_receptionist(self):
        """Check if user is receptionist"""
        return self.role == 'receptionist'
```

### Step 2: Create Customer Model

```python
# app/models/customer.py
from datetime import datetime

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    preferences = db.Column(db.JSON)  # Optional: service preferences
    
    # Relationships
    appointments = db.relationship('Appointment', backref='customer', lazy=True)
```

### Step 3: Create Permission Decorators

```python
# app/utils/decorators.py
from functools import wraps
from flask import jsonify, request
import jwt
from app import db
from app.models.user import User

def token_required(f):
    """Require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """Require admin role"""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin():
            return jsonify({'message': 'Admin access required!'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated

def receptionist_or_admin_required(f):
    """Require receptionist or admin role"""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not (current_user.is_receptionist() or current_user.is_admin()):
            return jsonify({'message': 'Access denied!'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated
```

### Step 4: Example API Routes with Permissions

```python
# app/routes/appointments.py
from flask import Blueprint, request, jsonify
from app.utils.decorators import token_required, admin_required, receptionist_or_admin_required

appointments_bp = Blueprint('appointments', __name__)

# Public endpoint - customers can book
@appointments_bp.route('/api/appointments', methods=['POST'])
def create_appointment():
    """Anyone can create an appointment (public booking)"""
    # Your booking logic here
    pass

# Protected endpoint - only staff
@appointments_bp.route('/api/appointments', methods=['GET'])
@receptionist_or_admin_required
def get_appointments(current_user):
    """Receptionist and admin can view appointments"""
    # Your logic here
    pass

# Admin only endpoint
@appointments_bp.route('/api/services', methods=['POST'])
@admin_required
def create_service(current_user):
    """Only admin can create services"""
    # Your logic here
    pass
```

### Step 5: Login Endpoint

```python
# app/routes/auth.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import jwt
from app import db
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'message': 'Account is inactive'}), 403
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 200
```

## Frontend Implementation Tips

### Store Token
```javascript
// After login, store token
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

### Send Token with Requests
```javascript
// In your API service file
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/appointments', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Check User Role
```javascript
const user = JSON.parse(localStorage.getItem('user'));

if (user.role === 'admin') {
  // Show admin features
} else if (user.role === 'receptionist') {
  // Show receptionist features
}
```

## Security Best Practices

1. **Never store passwords in plain text** - Always hash them
2. **Use HTTPS in production** - Protect tokens in transit
3. **Set token expiration** - Don't make tokens last forever
4. **Validate all inputs** - Check user data before processing
5. **Rate limiting** - Prevent brute force attacks on login
6. **CORS configuration** - Only allow your frontend domain

## Testing Your Implementation

### Test Admin Access
```python
# Create admin user
admin = User(username='admin', email='admin@salon.com', role='admin')
admin.set_password('admin123')
db.session.add(admin)
db.session.commit()
```

### Test Receptionist Access
```python
# Create receptionist user
receptionist = User(username='receptionist1', email='recep@salon.com', role='receptionist')
receptionist.set_password('recep123')
db.session.add(receptionist)
db.session.commit()
```

### Test Public Booking
- Try booking without token (should work)
- Try accessing admin endpoints without token (should fail)

---

**Remember**: Start simple, test each step, and build up gradually!

